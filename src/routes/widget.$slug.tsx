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
      return { layout: record, testimonials };
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

  return (
    <div style={{ minHeight: "100vh", background: config.colors.background }}>
      <TestimonialWidget
        type={data.layout.type}
        config={config}
        testimonials={data.testimonials}
      />
    </div>
  );
}
