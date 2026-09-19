import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TestimonialWidget } from "@/components/widget/TestimonialWidget";
import { getPublicWidgetBySlug, type PublicWidgetLookup } from "@/lib/public-lookups.functions";
import { mergeConfig, type WidgetTheme } from "@/lib/widget";
import { PLANS, normalizePlan } from "@/lib/plans";

export const Route = createFileRoute("/widget/$slug")({
  validateSearch: (search: Record<string, unknown>): { theme: WidgetTheme } => ({
    theme: search.theme === "dark" ? "dark" : "light",
  }),
  component: PublicWidget,
  head: () => ({
    meta: [
      { title: "Testimonials" },
      { name: "description", content: "Customer testimonials widget." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Testimonials" },
      { property: "og:description", content: "Customer testimonials widget." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function PublicWidget() {
  const { slug } = Route.useParams();
  const { theme } = Route.useSearch();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-widget", slug],
    queryFn: () => getPublicWidgetBySlug({ data: { slug } }) as Promise<PublicWidgetLookup | null>,
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

  const config = mergeConfig(data.layout.configuration, theme);
  const canRemoveBranding = PLANS[normalizePlan(data.ownerPlan)].removeBranding;
  const showBadge = canRemoveBranding ? config.branding.show : true;

  return (
    <div style={{ minHeight: "100vh", background: config.colors.background }}>
      <TestimonialWidget
        type={data.layout.type}
        config={config}
        testimonials={data.testimonials}
        showBranding={showBadge}
      />
    </div>
  );
}
