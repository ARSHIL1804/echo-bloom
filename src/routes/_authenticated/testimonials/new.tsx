import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSaveTestimonial, useTestimonials } from "@/lib/data";
import { formatLimit, usePlan } from "@/lib/plans";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { UpgradeDialog } from "@/components/dashboard/UpgradeDialog";
import {
  TestimonialForm,
  emptyValues,
  toRecord,
} from "@/components/dashboard/TestimonialForm";
import { Button } from "@/components/ui/button";

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
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function NewTestimonial() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const save = useSaveTestimonial(user?.id);
  const { data: testimonials } = useTestimonials(user?.id);
  const plan = usePlan(user?.id);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const atLimit = (testimonials?.length ?? 0) >= plan.testimonials;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title="Add Testimonial" subtitle="Add a new piece of customer social proof." />
      {atLimit ? (
        <div className="surface-card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Sparkles className="size-6" />
          </span>
          <h2 className="font-display text-lg font-bold">
            You've reached the {plan.name} plan limit
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            The {plan.name} plan includes {formatLimit(plan.testimonials)} testimonials. Upgrade to
            add more social proof.
          </p>
          <div className="mt-2 flex gap-2">
            <Button className="rounded-xl" onClick={() => setUpgradeOpen(true)}>
              Upgrade plan
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => navigate({ to: "/testimonials" })}>
              Back to testimonials
            </Button>
          </div>
        </div>
      ) : (
        <TestimonialForm
          initial={emptyValues()}
          submitLabel="Save Testimonial"
          onCancel={() => navigate({ to: "/testimonials" })}
          onSubmit={async (values) => {
            if ((testimonials?.length ?? 0) >= plan.testimonials) {
              toast.error(`The ${plan.name} plan allows ${formatLimit(plan.testimonials)} testimonials`);
              return;
            }
            try {
              await save.mutateAsync({ values: toRecord(values) });
              toast.success("Testimonial saved successfully");
              navigate({ to: "/testimonials" });
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Could not save testimonial");
            }
          }}
        />
      )}
      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        currentPlan={plan.id}
        reason={`The ${plan.name} plan is limited to ${formatLimit(plan.testimonials)} testimonials.`}
      />
    </div>
  );
}
