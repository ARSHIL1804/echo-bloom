import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useForms } from "@/lib/data";
import { formatLimit, usePlan } from "@/lib/plans";
import { UpgradeDialog } from "@/components/dashboard/UpgradeDialog";
import { FormEditor } from "@/components/dashboard/FormEditor";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/forms/new")({
  component: NewForm,
  head: () => ({
    meta: [
      { title: "Create collection form — Testimonially" },
      { name: "description", content: "Build a shareable form that collects new testimonials." },
      { property: "og:title", content: "Create collection form — Testimonially" },
      {
        property: "og:description",
        content: "Build a shareable form that collects new testimonials.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function NewForm() {
  const { user } = useAuth();
  const { data: forms } = useForms(user?.id);
  const plan = usePlan(user?.id);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const total = forms?.length ?? 0;
  const atLimit = plan.forms !== Infinity && total >= plan.forms;

  if (atLimit) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="surface-card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Sparkles className="size-6" />
          </span>
          <h2 className="font-display text-lg font-bold">
            You've reached the {plan.name} plan limit
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            The {plan.name} plan includes {formatLimit(plan.forms)} collection form
            {plan.forms === 1 ? "" : "s"}. Upgrade to collect testimonials through more forms.
          </p>
          <Button className="mt-2 rounded-xl" onClick={() => setUpgradeOpen(true)}>
            Upgrade plan
          </Button>
        </div>
        <UpgradeDialog
          open={upgradeOpen}
          onOpenChange={setUpgradeOpen}
          currentPlan={plan.id}
          reason={`The ${plan.name} plan is limited to ${formatLimit(plan.forms)} collection forms.`}
        />
      </div>
    );
  }

  return <FormEditor />;
}
