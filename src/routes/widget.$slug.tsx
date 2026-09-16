import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TestimonialWidget } from "@/components/widget/TestimonialWidget";
import { mergeConfig, type LayoutRecord, type Testimonial } from "@/lib/widget";

export const Route = createFileRoute("/widget/$slug")({
  component: PublicWidget,
  head: () => ({
    meta: [
      { title: "Testimonials" },
      { name: "description", content: "Customer testimonials widget." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Testimonials" },
      { property: "og:description", content: "Customer testimonials widget." },
      { property: "og:type", content: "website" },
    ],
  }),
});

function PublicWidget() {
  const { slug } = Route.useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-widget", slug],
    queryFn: async () => {
      const { data: layout, error: layoutError } = await supabase
        .from("layouts")
        .select("*")
        .eq("public_slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (layoutError) throw layoutError;
      if (!layout) return null;

      const record = layout as LayoutRecord;
      const ids = record.selected_testimonials ?? [];
      let testimonials: Testimonial[] = [];
      if (ids.length) {
        const { data: rows, error: rowsError } = await supabase
          .from("testimonials")
          .select("*")
          .in("id", ids);
        if (rowsError) throw rowsError;
        testimonials = (rows ?? []) as Testimonial[];
        testimonials.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      }
      const { data: ownerPlan } = await supabase.rpc("get_owner_plan", {
        _user_id: record.user_id!,
      });
      return { layout: record, testimonials, ownerPlan: (ownerPlan as string | null) ?? null };
    },
  });

  if (isLoading) {
    return (
      <div style={{ padding: 32, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
        <div
          style={{ height: 120, borderRadius: 16, background: "#F1F5F9" }}
          aria-label="Loading testimonials"
        />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          color: "#6B7280",
          fontSize: 14,
        }}
      >
        This testimonial widget is not available.
      </div>
    );
  }

  const config = mergeConfig(data.layout.configuration);
  const showBadge = !data.ownerPlan || data.ownerPlan === "free";

  return (
    <div style={{ minHeight: "100vh", background: config.colors.background }}>
      <TestimonialWidget
        type={data.layout.type}
        config={config}
        testimonials={data.testimonials}
      />
      {showBadge && (
        <a
          href="https://testimonially.lovable.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "fixed",
            bottom: 14,
            right: 14,
            zIndex: 50,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "#FFFFFF",
            color: "#111827",
            border: "1px solid #E5E7EB",
            borderRadius: 999,
            padding: "7px 14px",
            fontSize: 12,
            lineHeight: 1,
            textDecoration: "none",
            boxShadow: "0 4px 12px -4px rgba(17,24,39,0.15)",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          Powered by <span style={{ fontWeight: 700, color: "#6366F1" }}>Testimonially</span>
        </a>
      )}
    </div>
  );
}
