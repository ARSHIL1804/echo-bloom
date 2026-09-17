import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { normalizeSource } from "@/lib/testimonial-sources";

const payloadSchema = z.object({
  slug: z.string().min(3).max(120),
  customer_name: z.string().trim().min(1).max(120),
  content: z.string().trim().min(10).max(2000),
  customer_email: z.string().trim().email().max(200).optional().or(z.literal("")),
  customer_avatar: z.string().trim().url().max(500).optional().or(z.literal("")),
  company_name: z.string().trim().max(160).optional().or(z.literal("")),
  job_title: z.string().trim().max(160).optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5).optional(),
  source: z.string().optional(),
  /** Personal campaign link token, when the visitor came from a campaign email. */
  recipient_token: z.string().trim().max(64).optional(),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional().or(z.literal("")),
});

/** Best-effort in-memory rate limit: 5 submissions per slug+IP per 10 minutes. */
const hits = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000;
const MAX_HITS = 5;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_HITS;
}

export const Route = createFileRoute("/api/public/submit-testimonial")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }

        const parsed = payloadSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ error: "Please check the form and try again." }, { status: 400 });
        }
        const data = parsed.data;
        if (data.website) {
          return Response.json({ ok: true });
        }

        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        if (rateLimited(`${data.slug}:${ip}`)) {
          return Response.json(
            { error: "Too many submissions. Please try again later." },
            { status: 429 },
          );
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: form, error: formError } = await supabaseAdmin
          .from("forms")
          .select("id, user_id, brand_id, auto_publish, status")
          .eq("slug", data.slug)
          .eq("status", "live")
          .maybeSingle();
        if (formError) {
          return Response.json({ error: "Could not submit right now." }, { status: 500 });
        }
        if (!form) {
          return Response.json({ error: "This form is not available." }, { status: 404 });
        }

        // Match the campaign recipient (if any) so the review is attributed and marked responded.
        let campaignId: string | null = null;
        let recipientId: string | null = null;
        if (data.recipient_token) {
          const { data: recipient } = await supabaseAdmin
            .from("campaign_recipients")
            .select("id, campaign_id, user_id")
            .eq("token", data.recipient_token)
            .maybeSingle();
          const row = recipient as { id: string; campaign_id: string; user_id: string } | null;
          if (row && row.user_id === form.user_id) {
            campaignId = row.campaign_id;
            recipientId = row.id;
          }
        }

        const { error: insertError } = await supabaseAdmin.from("testimonials").insert({
          user_id: form.user_id,
          brand_id: form.brand_id,
          form_id: form.id,
          campaign_id: campaignId,
          customer_name: data.customer_name,
          customer_email: data.customer_email || null,
          customer_avatar: data.customer_avatar || null,
          company_name: data.company_name || null,
          job_title: data.job_title || null,
          content: data.content,
          rating: data.rating ?? 5,
          source: normalizeSource(data.source),
          status: form.auto_publish ? "published" : "draft",
        } as never);

        if (insertError) {
          return Response.json({ error: "Could not save your testimonial." }, { status: 500 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
