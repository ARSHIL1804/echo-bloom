import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Mail, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useBrands, useForms } from "@/lib/data";
import { usePlan } from "@/lib/plans";
import {
  campaignsThisMonth,
  useCampaigns,
  useDeleteCampaign,
  useSaveCampaign,
  type Campaign,
} from "@/lib/campaigns";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { UpgradeDialog } from "@/components/dashboard/UpgradeDialog";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/campaigns/")({
  component: CampaignsPage,
  head: () => ({
    meta: [
      { title: "Email campaigns — Testimonially" },
      {
        name: "description",
        content: "Ask customers for reviews by email and track every response.",
      },
      { property: "og:title", content: "Email campaigns — Testimonially" },
      {
        property: "og:description",
        content: "Ask customers for reviews by email and track every response.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const statusTone: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-primary-soft text-primary",
  running: "bg-success/10 text-success",
  completed: "bg-muted text-muted-foreground",
  paused: "bg-warning/10 text-warning",
};

function CampaignsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const plan = usePlan(user?.id);
  const { data: campaigns, isLoading } = useCampaigns(user?.id);
  const { data: brands } = useBrands(user?.id);
  const { data: forms } = useForms(user?.id);
  const save = useSaveCampaign(user?.id);
  const remove = useDeleteCampaign();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Campaign | null>(null);
  const [creating, setCreating] = useState(false);

  const usedThisMonth = campaignsThisMonth(campaigns);
  const canCreate = plan.campaignsPerMonth > usedThisMonth;

  async function createCampaign() {
    if (!canCreate) {
      setUpgradeOpen(true);
      return;
    }
    setCreating(true);
    try {
      const liveForm = (forms ?? []).find((f) => f.status === "live") ?? (forms ?? [])[0];
      const campaign = await save.mutateAsync({
        values: {
          name: "New campaign",
          brand_id: brands?.[0]?.id ?? null,
          form_id: liveForm?.id ?? null,
        },
      });
      navigate({ to: "/campaigns/$id", params: { id: campaign.id } });
    } catch {
      toast.error("Could not create the campaign.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        subtitle="Email your customers for reviews and track every response."
        action={
          <Button className="rounded-xl" onClick={createCampaign} disabled={creating}>
            {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            New campaign
          </Button>
        }
      />

      {plan.campaignsPerMonth === 0 ? (
        <div className="surface-card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Sparkles className="size-6" />
          </span>
          <h2 className="font-display text-lg font-bold">Campaigns are a Pro feature</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Upgrade to Pro to run 3 email campaigns every month with up to 500 recipients each — each
            person gets their own review link.
          </p>
          <Button className="mt-2 rounded-xl" onClick={() => setUpgradeOpen(true)}>
            Upgrade to Pro
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {usedThisMonth} of {plan.campaignsPerMonth} campaigns used this month ·{" "}
          {plan.emailsPerCampaign} recipients per campaign
        </p>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (campaigns ?? []).length === 0 ? (
        plan.campaignsPerMonth > 0 && (
          <div className="surface-card flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Mail className="size-6" />
            </span>
            <h2 className="font-display text-lg font-bold">No campaigns yet</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Upload your customer list, write one email, and collect testimonials on autopilot.
            </p>
            <Button className="mt-2 rounded-xl" onClick={createCampaign}>
              Create your first campaign
            </Button>
          </div>
        )
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(campaigns ?? []).map((c) => (
            <div key={c.id} className="surface-card flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to="/campaigns/$id"
                    params={{ id: c.id }}
                    className="font-display font-bold hover:text-primary"
                  >
                    <span className="break-words">{c.name}</span>
                  </Link>
                  <p className="mt-1 break-words text-xs text-muted-foreground">{c.subject}</p>
                </div>
                <Badge className={statusTone[c.status] ?? statusTone['draft']} variant="secondary">
                  {c.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Starts {new Date(c.start_date).toLocaleDateString()}</span>
                {c.end_date && <span>Ends {new Date(c.end_date).toLocaleDateString()}</span>}
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline" className="rounded-lg">
                  <Link to="/campaigns/$id" params={{ id: c.id }}>
                    Open
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-lg text-destructive"
                  onClick={() => setToDelete(c)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        currentPlan={plan.id}
        reason={
          plan.campaignsPerMonth === 0
            ? "Email campaigns are included in Pro."
            : `Your plan includes ${plan.campaignsPerMonth} campaigns per month.`
        }
      />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete this campaign?"
        body="Recipients and their delivery history will be removed. Testimonials already collected stay."
        confirmLabel="Delete campaign"
        onConfirm={async () => {
          if (!toDelete) return;
          await remove.mutateAsync(toDelete.id);
          setToDelete(null);
          toast.success("Campaign deleted");
        }}
      />
    </div>
  );
}
