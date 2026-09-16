import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useForm } from "@/lib/data";
import { FormEditor } from "@/components/dashboard/FormEditor";

export const Route = createFileRoute("/_authenticated/forms/$id")({
  component: EditForm,
  head: () => ({
    meta: [
      { title: "Edit collection form — Testimonially" },
      { name: "description", content: "Update your testimonial collection form." },
      { property: "og:title", content: "Edit collection form — Testimonially" },
      { property: "og:description", content: "Update your testimonial collection form." },
      { property: "og:type", content: "website" },
    ],
  }),
});

function EditForm() {
  const { id } = Route.useParams();
  const { data, isLoading } = useForm(id);

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
        <p className="text-sm text-muted-foreground">This form no longer exists.</p>
      </div>
    );
  }

  return <FormEditor form={data} />;
}
