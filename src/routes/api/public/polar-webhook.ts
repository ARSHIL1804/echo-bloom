import { createFileRoute } from "@tanstack/react-router";
import { Webhook } from "standardwebhooks";

type PolarSubscription = {
  id?: string;
  status?: string;
  customer_id?: string;
  product_id?: string;
  current_period_end?: string | null;
  customer?: { id?: string; external_id?: string | null } | null;
  metadata?: Record<string, unknown> | null;
};

type PolarEvent = { type?: string; data?: PolarSubscription };

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export const Route = createFileRoute("/api/public/polar-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["POLAR_WEBHOOK_SECRET"];
        if (!secret) return new Response("Not configured", { status: 500 });

        const body = await request.text();
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
          headers[key] = value;
        });

        let event: PolarEvent;
        try {
          // Polar follows Standard Webhooks; the plain secret must be base64 encoded.
          const wh = new Webhook(Buffer.from(secret, "utf-8").toString("base64"));
          event = wh.verify(body, headers) as PolarEvent;
        } catch (error) {
          console.error("[polar-webhook] invalid signature", error);
          return new Response("Invalid signature", { status: 401 });
        }

        const type = event.type ?? "";
        const sub = event.data ?? {};
        const userId =
          (sub.customer?.external_id as string | undefined) ??
          (typeof sub.metadata?.["user_id"] === "string"
            ? (sub.metadata["user_id"] as string)
            : undefined);

        if (!type.startsWith("subscription.") || !userId) {
          return new Response("ok");
        }

        const revoked =
          type === "subscription.revoked" ||
          type === "subscription.canceled" ||
          !ACTIVE_STATUSES.has(sub.status ?? "");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: userId,
            plan: revoked ? "free" : "pro",
            status: revoked ? (sub.status ?? "canceled") : "active",
            current_period_end: sub.current_period_end ?? null,
            polar_customer_id: sub.customer_id ?? sub.customer?.id ?? null,
            polar_subscription_id: sub.id ?? null,
            polar_product_id: sub.product_id ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
        if (error) console.error("[polar-webhook] update failed", error);

        return new Response("ok");
      },
    },
  },
});
