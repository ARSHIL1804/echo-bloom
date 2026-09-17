import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLANS, PLAN_ORDER, formatLimit, type PlanId } from "@/lib/plans";
import { useUpgrade } from "@/lib/checkout";

const keyFeatures: Record<PlanId, string[]> = {
  free: [
    "10 testimonials",
    "2 published layouts",
    "1 brand · 1 collection form",
    "Testimonially branding shown",
  ],
  pro: [
    "Unlimited testimonials & layouts",
    "Unlimited brands & collection forms",
    "3 campaigns monthly, 500 emails each",
    "Remove Testimonially branding",
  ],
};

export function UpgradeDialog({
  open,
  onOpenChange,
  currentPlan,
  reason,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: PlanId;
  /** Short line shown at the top, e.g. why the limit was hit. */
  reason?: string;
}) {
  const [pending, setPending] = useState<PlanId | null>(null);

  function choose(plan: PlanId) {
    setPending(plan);
    openCheckout(plan);
    setPending(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">Upgrade your plan</DialogTitle>
          <DialogDescription>
            {reason ?? "Get more testimonials, layouts, and branding control."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            const current = id === currentPlan;
            const isDowngrade = PLAN_ORDER.indexOf(id) < PLAN_ORDER.indexOf(currentPlan);
            return (
              <div
                key={id}
                className={cn(
                  "rounded-2xl border p-5",
                  id === "pro" && !current ? "border-primary" : "border-border",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display font-bold">{plan.name}</h3>
                  <p className="font-display text-lg font-extrabold">
                    {plan.price}
                    <span className="text-xs font-medium text-muted-foreground">/mo</span>
                  </p>
                </div>
                <ul className="mt-3 space-y-2">
                  {keyFeatures[id].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  {formatLimit(plan.testimonials)} testimonials ·{" "}
                  {formatLimit(plan.publishedLayouts)} published layouts ·{" "}
                  {formatLimit(plan.brands)} brand{plan.brands === 1 ? "" : "s"}
                </p>
                <Button
                  className="mt-4 w-full rounded-xl"
                  variant={current ? "outline" : id === "pro" ? "default" : "outline"}
                  disabled={current}
                  onClick={() => choose(id)}
                >
                  {current ? "Current plan" : isDowngrade ? "Downgrade" : `Choose ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
