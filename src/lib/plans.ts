import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
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
};

export function useSubscription(userId?: string) {
  return useQuery({
    queryKey: ["subscription", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Subscription> => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("user_id, plan, status, current_period_end")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as Subscription;
      return { user_id: userId!, plan: "free", status: "active", current_period_end: null };
    },
  });
}

/** Current plan limits for the signed-in user. Defaults to Free. */
export function usePlan(userId?: string): PlanLimits {
  const { data } = useSubscription(userId);
  return PLANS[data?.plan ?? "free"];
}

export function formatLimit(n: number): string {
  return n === Infinity ? "Unlimited" : String(n);
}

export function planLabel(plan: PlanId): string {
  return PLANS[plan]?.name ?? "Free";
}

/**
 * Opens Paddle checkout for a paid plan.
 * Wired up once Paddle is enabled for the project (needs the Paddle client token
 * and price IDs). Until then, upgrades surface a friendly notice.
 */
export function openCheckout(planId: PlanId): void {
  // TODO(paddle): replace with Paddle.js overlay checkout once payments are enabled:
  // Paddle.Checkout.open({ items: [{ priceId, quantity: 1 }] })
  toast.message(`${PLANS[planId].name} plan selected`, {
    description:
      "Checkout is being connected. You'll be able to complete your upgrade here shortly.",
  });
}
