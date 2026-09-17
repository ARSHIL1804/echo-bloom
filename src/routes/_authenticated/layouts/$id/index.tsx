import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useLayout } from "@/lib/data";
import { LayoutEditor } from "@/components/dashboard/LayoutEditor";

export const Route = createFileRoute("/_authenticated/layouts/$id/")({
  component: EditLayout,
  head: () => ({
    meta: [
      { title: "Edit layout — Testimonially" },
      { name: "description", content: "Customize your testimonial widget and publish it." },
      { property: "og:title", content: "Edit layout — Testimonially" },
      { property: "og:description", content: "Customize your testimonial widget and publish it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function EditLayout() {
  const { id } = Route.useParams();
  const { data, isLoading } = useLayout(id);

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="surface-card p-10 text-center">
        <p className="text-sm text-muted-foreground">This layout no longer exists.</p>
      </div>
    );
  }

  return <LayoutEditor layout={data} />;
}
