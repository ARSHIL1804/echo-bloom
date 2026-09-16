import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, CreditCard, LayoutGrid, MessageSquareQuote, Palette } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useBrands, useLayouts, useTestimonials } from "@/lib/data";
import {
  PLANS,
  PLAN_ORDER,
  formatLimit,
  openCheckout,
  usePlan,
  useSubscription,
  type PlanId,
} from "@/lib/plans";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/billing")({
  component: BillingPage,
  head: () => ({
    meta: [
      { title: "Billing — Testimonially" },
      { name: "description", content: "Manage your Testimonially plan and usage." },
      { property: "og:title", content: "Billing — Testimonially" },
      { property: "og:description", content: "Manage your Testimonially plan and usage." },
      { property: "og:type", content: "website" },
    ],
  }),
});

function UsageMeter({
  icon: Icon,
  label,
  used,
  limit,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  used: number;
  limit: number;
  loading?: boolean;
}) {
  const unlimited = limit === Infinity;
  const pct = unlimited ? 0 : Math.min(100, (used / limit) * 100);
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-primary-soft text-primary">
            <Icon className="size-4" />
          </span>
          <p className="text-sm font-medium">{label}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {loading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <>
              <span className="font-semibold text-foreground">{used}</span>
              {" / "}
              {unlimited ? "∞" : limit}
            </>
          )}
        </p>
      </div>
      {!loading && !unlimited && (
        <Progress value={pct} className="mt-3 h-1.5" aria-label={`${label} usage`} />
      )}
    </div>
  );
}

function BillingPage() {
  const { user } = useAuth();
  const { data: subscription, isLoading: subLoading } = useSubscription(user?.id);
  const plan = usePlan(user?.id);
  const { data: testimonials, isLoading: tLoading } = useTestimonials(user?.id);
  const { data: layouts, isLoading: lLoading } = useLayouts(user?.id);
  const { data: brands, isLoading: bLoading } = useBrands(user?.id);
  const [pending, setPending] = useState<PlanId | null>(null);

  const publishedCount = (layouts ?? []).filter((l) => l.status === "published").length;

  function choose(id: PlanId) {
    setPending(id);
    openCheckout(id);
    setPending(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        subtitle="Your plan, usage, and upgrade options."
      />

      <div className="surface-card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-muted-foreground">Current plan</p>
          <p className="mt-1 font-display text-2xl font-bold">
            {subLoading ? <Skeleton className="h-8 w-32" /> : plan.name}
            <span className="ml-2 text-base font-medium text-muted-foreground">
              {plan.price}/mo
            </span>
          </p>
          {subscription?.current_period_end && subscription.plan !== "free" && (
            <p className="mt-1 text-xs text-muted-foreground">
              Renews{" "}
              {new Date(subscription.current_period_end).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-2 text-sm font-medium text-success">
          <span className="size-2 rounded-full bg-success" />
          {subscription?.status === "active" || !subscription?.status ? "Active" : subscription.status}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <UsageMeter
          icon={MessageSquareQuote}
          label="Testimonials"
          used={testimonials?.length ?? 0}
          limit={plan.testimonials}
          loading={tLoading}
        />
        <UsageMeter
          icon={LayoutGrid}
          label="Published layouts"
          used={publishedCount}
          limit={plan.publishedLayouts}
          loading={lLoading}
        />
        <UsageMeter
          icon={Palette}
          label="Brands"
          used={brands?.length ?? 0}
          limit={plan.brands}
          loading={bLoading}
        />
      </div>

      <div>
        <h2 className="font-display text-lg font-bold">Available plans</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PLAN_ORDER.map((id) => {
            const p = PLANS[id];
            const current = id === subscription?.plan;
            const isDowngrade = PLAN_ORDER.indexOf(id) < PLAN_ORDER.indexOf(subscription?.plan ?? "free");
            return (
              <div
                key={id}
                className={cn(
                  "flex flex-col rounded-2xl border p-6",
                  id === "pro" && !current ? "border-2 border-primary shadow-lift" : "border-border",
                )}
              >
                <h3 className="font-display font-bold">{p.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.note}</p>
                <p className="mt-4 font-display text-3xl font-extrabold">
                  {p.price}
                  <span className="text-sm font-medium text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-4 flex-1 space-y-2">
                  {[
                    `${formatLimit(p.testimonials)} testimonials`,
                    `${formatLimit(p.layouts)} layouts`,
                    `${formatLimit(p.publishedLayouts)} published layouts`,
                    `${formatLimit(p.brands)} brand${p.brands === 1 ? "" : "s"}`,
                    p.removeBranding ? "Remove Testimonially branding" : "Testimonially branding",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-5 w-full rounded-xl"
                  variant={current ? "outline" : id === "pro" ? "default" : "outline"}
                  disabled={current}
                  onClick={() => choose(id)}
                >
                  <CreditCard className="size-4" />
                  {current
                    ? "Current plan"
                    : isDowngrade
                      ? `Downgrade to ${p.name}`
                      : `Upgrade to ${p.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
