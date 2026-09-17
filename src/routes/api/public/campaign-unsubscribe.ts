import { createFileRoute } from "@tanstack/react-router";

function page(message: string) {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Unsubscribe</title></head>
<body style="font-family:ui-sans-serif,system-ui,sans-serif;background:#F8FAFC;color:#111827;display:grid;place-items:center;min-height:100vh;margin:0">
<div style="background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:32px 28px;max-width:420px;text-align:center">
<p style="margin:0;font-size:15px;line-height:1.6">${message}</p>
</div></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );
}

export const Route = createFileRoute("/api/public/campaign-unsubscribe")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = new URL(request.url).searchParams.get("r");
        if (!token || token.length > 64) {
          return page("This unsubscribe link is not valid.");
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin
          .from("campaign_recipients")
          .update({ status: "unsubscribed" } as never)
          .eq("token", token);
        if (error) {
          return page("We couldn't update your preferences. Please try again later.");
        }
        return page("You've been unsubscribed. You won't receive any more review requests.");
      },
    },
  },
});
