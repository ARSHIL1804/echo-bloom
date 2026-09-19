import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PlanId = "free" | "pro";

export type PlanLimits = {
  id: PlanId;
  name: string;
  price: string;
  note: string;
  /** Max testimonials. Infinity = unlimited. */
  testimonials: number;
  /** Max total layouts. Infinity = unlimited. */
  layouts: number;
  /** Max simultaneously published layouts. Infinity = unlimited. */
  publishedLayouts: number;
  /** Max brands. Infinity = unlimited. */
  brands: number;
  /** Max collection forms. Infinity = unlimited. */
  forms: number;
  /** Email campaigns allowed per calendar month. */
  campaignsPerMonth: number;
  /** Max recipients (emails) per campaign. */
  emailsPerCampaign: number;
  /** Free plan shows the "Powered by Testimonially" badge on public widgets. */
  removeBranding: boolean;
};

export const PLANS: Record<PlanId, PlanLimits> = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    note: "For users trying the product",
    testimonials: 10,
    layouts: Infinity,
    publishedLayouts: 2,
    brands: 1,
    forms: 1,
    campaignsPerMonth: 0,
    emailsPerCampaign: 0,
    removeBranding: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$29",
    note: "For SaaS companies and growing businesses",
    testimonials: Infinity,
    layouts: Infinity,
    publishedLayouts: Infinity,
    brands: Infinity,
    forms: Infinity,
    campaignsPerMonth: 3,
    emailsPerCampaign: 500,
    removeBranding: true,
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro"];

/** Legacy plan values (starter/agency) map onto the current two tiers. */
export function normalizePlan(value: string | null | undefined): PlanId {
  if (value === "pro" || value === "starter" || value === "agency") return "pro";
  return "free";
}

export type Subscription = {
  user_id: string;
  plan: PlanId;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

/** Statuses where a paid plan is still usable right now. */
const USABLE_STATUSES = new Set(["active", "trialing", "past_due"]);

/**
 * The plan the user can actually use right now.
 * A cancelled Pro plan keeps working until the paid period ends; after that
 * date it falls back to Free even if no webhook arrived.
 */
export function effectivePlan(sub?: Subscription | null): PlanId {
  if (!sub) return "free";
  const plan = normalizePlan(sub.plan);
  if (plan === "free") return "free";
  if (USABLE_STATUSES.has(sub.status)) return "pro";
  if (sub.status === "canceled" || sub.cancel_at_period_end) {
    const end = sub.current_period_end ? new Date(sub.current_period_end).getTime() : 0;
    return end > Date.now() ? "pro" : "free";
  }
  return "free";
}

/** True when Pro is active but set to stop renewing at the end of the period. */
export function isCancelPending(sub?: Subscription | null): boolean {
  if (!sub) return false;
  return effectivePlan(sub) === "pro" && (sub.cancel_at_period_end || sub.status === "canceled");
}

export function useSubscription(userId?: string) {
  return useQuery({
    queryKey: ["subscription", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Subscription> => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("user_id, plan, status, current_period_end, cancel_at_period_end")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        const row = data as {
          user_id: string;
          plan: string;
          status: string;
          current_period_end: string | null;
          cancel_at_period_end: boolean | null;
        };
        return {
          ...row,
          plan: normalizePlan(row.plan),
          cancel_at_period_end: row.cancel_at_period_end ?? false,
        };
      }
      return {
        user_id: userId!,
        plan: "free",
        status: "active",
        current_period_end: null,
        cancel_at_period_end: false,
      };
    },
  });
}

/** Current plan limits for the signed-in user. Defaults to Free. */
export function usePlan(userId?: string): PlanLimits {
  const { data } = useSubscription(userId);
  return PLANS[effectivePlan(data)];
}

export function formatLimit(n: number): string {
  return n === Infinity ? "Unlimited" : String(n);
}

export function planLabel(plan: PlanId): string {
  return PLANS[plan]?.name ?? "Free";
}

/** Checkout lives in `@/lib/checkout` (Polar hosted checkout + customer portal). */
