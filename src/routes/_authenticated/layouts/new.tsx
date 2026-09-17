import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLayouts } from "@/lib/data";
import { formatLimit, usePlan } from "@/lib/plans";
import { UpgradeDialog } from "@/components/dashboard/UpgradeDialog";
import { LayoutEditor } from "@/components/dashboard/LayoutEditor";
import { Button } from "@/components/ui/button";

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
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function NewLayout() {
  const { user } = useAuth();
  const { data: layouts } = useLayouts(user?.id);
  const plan = usePlan(user?.id);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const atLimit = (layouts?.length ?? 0) >= plan.layouts;

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
            The {plan.name} plan includes {formatLimit(plan.layouts)} layouts. Upgrade to create
            more testimonial widgets.
          </p>
          <Button className="mt-2 rounded-xl" onClick={() => setUpgradeOpen(true)}>
            Upgrade plan
          </Button>
        </div>
        <UpgradeDialog
          open={upgradeOpen}
          onOpenChange={setUpgradeOpen}
          currentPlan={plan.id}
          reason={`The ${plan.name} plan is limited to ${formatLimit(plan.layouts)} layouts.`}
        />
      </div>
    );
  }

  return <LayoutEditor />;
}
