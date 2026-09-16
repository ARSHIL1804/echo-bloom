import { createFileRoute } from "@tanstack/react-router";
import { LayoutEditor } from "@/components/dashboard/LayoutEditor";

export const Route = createFileRoute("/_authenticated/layouts/new")({
  component: NewLayout,
  head: () => ({
    meta: [
      { title: "Create layout — Testimonially" },
      { name: "description", content: "Build and customize a new testimonial widget layout." },
      { property: "og:title", content: "Create layout — Testimonially" },
      {
        property: "og:description",
        content: "Build and customize a new testimonial widget layout.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function NewLayout() {
  return <LayoutEditor />;
}
