import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useSaveTestimonial } from "@/lib/data";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import {
  TestimonialForm,
  emptyValues,
} from "@/components/dashboard/TestimonialForm";

export const Route = createFileRoute("/_authenticated/testimonials/new")({
  component: NewTestimonial,
  head: () => ({
    meta: [
      { title: "Add testimonial — Testimonially" },
      { name: "description", content: "Add a new customer testimonial to your collection." },
      { property: "og:title", content: "Add testimonial — Testimonially" },
      {
        property: "og:description",
        content: "Add a new customer testimonial to your collection.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function NewTestimonial() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const save = useSaveTestimonial(user?.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title="Add Testimonial" subtitle="Add a new piece of customer social proof." />
      <TestimonialForm
        initial={emptyValues()}
        submitLabel="Save Testimonial"
        onCancel={() => navigate({ to: "/testimonials" })}
        onSubmit={async (values) => {
          try {
            await save.mutateAsync({ values });
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
