import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type SendResult = {
  sent: number;
  failed: number;
  skipped: number;
  message: string;
};

function renderBody(message: string, name: string, link: string) {
  const withName = message.replaceAll("{{name}}", name || "there");
  return withName.includes("{{link}}") ? withName.replaceAll("{{link}}", link) : `${withName}\n\n${link}`;
}

function toHtml(body: string, link: string, unsubscribeUrl: string) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6">${escapeHtml(p).replaceAll("\n", "<br />")}</p>`)
    .join("");
  return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#111827;font-size:15px;max-width:560px;margin:0 auto;padding:24px">
${paragraphs}
<p style="margin:24px 0"><a href="${link}" style="background:#6366F1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px;display:inline-block;font-weight:600">Share your experience</a></p>
<p style="margin:32px 0 0;font-size:12px;color:#6B7280">Don't want these emails? <a href="${unsubscribeUrl}" style="color:#6B7280">Unsubscribe</a>.</p>
</div>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Sends the next batch of pending campaign emails (Pro plan only). */
export const sendCampaignBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { campaignId: string; reminders?: boolean }) =>
    z.object({ campaignId: z.string().uuid(), reminders: z.boolean().optional() }).parse(input),
  )
  .handler(async ({ data, context }): Promise<SendResult> => {
    const { supabase, userId } = context;

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", userId)
      .maybeSingle();
    const plan = (sub as { plan?: string } | null)?.plan ?? "free";
    if (plan === "free") {
      return { sent: 0, failed: 0, skipped: 0, message: "Email campaigns are a Pro feature." };
    }

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, name, subject, message, form_id, start_date, end_date, status")
      .eq("id", data.campaignId)
      .maybeSingle();
    if (campaignError || !campaign) {
      return { sent: 0, failed: 0, skipped: 0, message: "Campaign not found." };
    }
    const c = campaign as {
      subject: string;
      message: string;
      form_id: string | null;
      start_date: string;
      end_date: string | null;
    };

    if (!c.form_id) {
      return { sent: 0, failed: 0, skipped: 0, message: "Pick a collection form first." };
    }

    const today = new Date().toISOString().slice(0, 10);
    if (c.start_date > today) {
      return { sent: 0, failed: 0, skipped: 0, message: "This campaign starts later." };
    }
    if (c.end_date && c.end_date < today) {
      return { sent: 0, failed: 0, skipped: 0, message: "This campaign has already ended." };
    }

    const { data: form } = await supabase
      .from("forms")
      .select("slug, status")
      .eq("id", c.form_id)
      .maybeSingle();
    const slug = (form as { slug?: string; status?: string } | null)?.slug;
    if (!slug) {
      return { sent: 0, failed: 0, skipped: 0, message: "The linked form is unavailable." };
    }
    if ((form as { status?: string }).status !== "live") {
      return { sent: 0, failed: 0, skipped: 0, message: "Make the linked form live first." };
    }

    const { data: recipients } = await supabase
      .from("campaign_recipients")
      .select("id, name, email, token, status")
      .eq("campaign_id", data.campaignId)
      .eq("status", data.reminders ? "sent" : "pending")
      .limit(100);
    const list = (recipients ?? []) as {
      id: string;
      name: string;
      email: string;
      token: string;
    }[];
    if (!list.length) {
      return { sent: 0, failed: 0, skipped: 0, message: "No recipients waiting to be emailed." };
    }

    const apiKey = process.env["LOVABLE_API_KEY"];
    const from = process.env["CAMPAIGN_FROM_EMAIL"];
    if (!apiKey || !from) {
      return {
        sent: 0,
        failed: 0,
        skipped: list.length,
        message:
          "Email sending isn't set up yet. Add your own sending domain to start delivering campaign emails.",
      };
    }

    const origin = new URL(getRequest().url).origin;
    const { sendLovableEmail, EmailAPIError } = await import("@lovable.dev/email-js");

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const r of list) {
      const link = `${origin}/f/${slug}?r=${r.token}`;
      const unsubscribeUrl = `${origin}/api/public/campaign-unsubscribe?r=${r.token}`;
      const body = renderBody(c.message, r.name, link);
      try {
        await sendLovableEmail(
          {
            to: r.email,
            from,
            subject: c.subject,
            html: toHtml(body, link, unsubscribeUrl),
            text: `${body}\n\nUnsubscribe: ${unsubscribeUrl}`,
            label: "campaign",
            idempotency_key: `${data.campaignId}:${r.id}:${data.reminders ? "reminder" : "initial"}`,
          },
          { apiKey },
        );
        sent += 1;
        await supabase
          .from("campaign_recipients")
          .update(
            (data.reminders
              ? { reminded_at: new Date().toISOString() }
              : { status: "sent", sent_at: new Date().toISOString(), error: null }) as never,
          )
          .eq("id", r.id);
      } catch (error) {
        if (error instanceof EmailAPIError && error.status === 429) {
          skipped += 1;
          break;
        }
        failed += 1;
        await supabase
          .from("campaign_recipients")
          .update({
            status: "failed",
            error: error instanceof Error ? error.message.slice(0, 300) : "Send failed",
          } as never)
          .eq("id", r.id);
      }
    }

    if (sent > 0 && !data.reminders) {
      await supabase.from("campaigns").update({ status: "running" } as never).eq("id", data.campaignId);
    }

    return {
      sent,
      failed,
      skipped,
      message: `${sent} email${sent === 1 ? "" : "s"} sent${failed ? `, ${failed} failed` : ""}.`,
    };
  });
