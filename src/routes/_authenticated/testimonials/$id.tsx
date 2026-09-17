import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSaveTestimonial, useTestimonial } from "@/lib/data";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { TestimonialForm, toFormValues, toRecord } from "@/components/dashboard/TestimonialForm";

export const Route = createFileRoute("/_authenticated/testimonials/$id")({
  component: EditTestimonial,
  head: () => ({
    meta: [
      { title: "Edit testimonial — Testimonially" },
      { name: "description", content: "Update a customer testimonial." },
      { property: "og:title", content: "Edit testimonial — Testimonially" },
      { property: "og:description", content: "Update a customer testimonial." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function EditTestimonial() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading } = useTestimonial(id);
  const save = useSaveTestimonial(user?.id);

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
        <p className="text-sm text-muted-foreground">This testimonial no longer exists.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title="Edit Testimonial" subtitle={`Editing ${data.customer_name}'s feedback.`} />
      <TestimonialForm
        initial={toFormValues(data)}
        submitLabel="Save Changes"
        onCancel={() => navigate({ to: "/testimonials" })}
        onSubmit={async (values) => {
          try {
            await save.mutateAsync({ id, values: toRecord(values) });
            toast.success("Testimonial saved successfully");
            navigate({ to: "/testimonials" });
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not save testimonial");
          }
        }}
      />
    </div>
  );
}
