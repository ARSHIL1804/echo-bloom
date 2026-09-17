import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Polar product for the $29/mo Pro plan. */
export const POLAR_PRO_PRODUCT_ID = "e60a6089-9a9d-426a-a06a-9cfe3d32fc5d";

const POLAR_API = "https://api.polar.sh/v1";

function requireToken(): string {
  const token = process.env["POLAR_ACCESS_TOKEN"];
  if (!token) throw new Error("Payments are not configured yet.");
  return token;
}

function siteOrigin(): string {
  const request = getRequest();
  const origin = request?.headers.get("origin");
  if (origin) return origin;
  const host = request?.headers.get("host");
  const proto = host?.startsWith("localhost") ? "http" : "https";
  return host ? `${proto}://${host}` : "http://localhost:8080";
}

async function polar<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${POLAR_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireToken()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("[polar]", path, res.status, body);
    throw new Error("We couldn't reach the payment provider. Please try again.");
  }
  return (await res.json()) as T;
}

/** Starts a Polar checkout for the Pro plan and returns the hosted checkout URL. */
export const createProCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ url: string }> => {
    const { userId, claims } = context as { userId: string; claims: { email?: string } };

    const checkout = await polar<{ id: string; url: string }>("/checkouts/", {
      method: "POST",
      body: JSON.stringify({
        products: [POLAR_PRO_PRODUCT_ID],
        external_customer_id: userId,
        ...(claims?.email ? { customer_email: claims.email } : {}),
        success_url: `${siteOrigin()}/billing?checkout_id={CHECKOUT_ID}`,
        metadata: { user_id: userId, plan: "pro" },
      }),
    });

    return { url: checkout.url };
  });

type CheckoutStatus = "succeeded" | "failed" | "expired" | "open" | "confirmed";

/** Verifies a completed checkout and activates Pro immediately when it succeeded. */
export const confirmCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { checkoutId: string }) =>
    z.object({ checkoutId: z.string().min(6).max(100) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<{ status: CheckoutStatus; plan: "free" | "pro" }> => {
    const { userId } = context as { userId: string };

    const checkout = await polar<{
      status: CheckoutStatus;
      external_customer_id: string | null;
      customer_id: string | null;
      product_id: string | null;
      subscription_id: string | null;
    }>(`/checkouts/${data.checkoutId}`, { method: "GET" });

    if (checkout.status !== "succeeded" || checkout.external_customer_id !== userId) {
      return { status: checkout.status, plan: "free" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          plan: "pro",
          status: "active",
          polar_customer_id: checkout.customer_id,
          polar_subscription_id: checkout.subscription_id,
          polar_product_id: checkout.product_id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    return { status: "succeeded", plan: "pro" };
  });

/** Returns a Polar customer portal URL where the user can manage or cancel their plan. */
export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ url: string }> => {
    const { userId } = context as { userId: string };

    const session = await polar<{ customer_portal_url: string }>("/customer-sessions/", {
      method: "POST",
      body: JSON.stringify({ external_customer_id: userId }),
    });

    return { url: session.customer_portal_url };
  });
