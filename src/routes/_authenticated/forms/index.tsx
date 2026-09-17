import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ClipboardList, Code2, Copy, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  copyToClipboard,
  formEmbedCode,
  formUrl,
  useBrands,
  useDeleteForm,
  useForms,
  useTestimonials,
} from "@/lib/data";
import { formatLimit, usePlan } from "@/lib/plans";
import { EmptyState, PageHeader } from "@/components/dashboard/DashboardShell";
import { SkeletonRows } from "@/components/dashboard/bits";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { UpgradeDialog } from "@/components/dashboard/UpgradeDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/forms/")({
  component: FormsPage,
  head: () => ({
    meta: [
      { title: "Collection forms — Testimonially" },
      {
        name: "description",
        content: "Create shareable forms that collect testimonials from your customers.",
      },
      { property: "og:title", content: "Collection forms — Testimonially" },
      {
        property: "og:description",
        content: "Create shareable forms that collect testimonials from your customers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function FormsPage() {
  const { user } = useAuth();
  const { data: forms, isLoading } = useForms(user?.id);
  const { data: brands } = useBrands(user?.id);
  const { data: testimonials } = useTestimonials(user?.id);
  const plan = usePlan(user?.id);
  const remove = useDeleteForm();
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const liveCount = (forms ?? []).filter((f) => f.status === "live").length;
  const atLimit = liveCount >= plan.forms;

  const submissionCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of testimonials ?? []) {
      if (t.form_id) map.set(t.form_id, (map.get(t.form_id) ?? 0) + 1);
    }
    return map;
  }, [testimonials]);

  const brandName = (id: string | null) =>
    (brands ?? []).find((b) => b.id === id)?.name ?? "No brand";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collection Forms"
        subtitle="Share a link and let customers submit their own testimonials."
        action={
          <Button asChild className="rounded-xl">
            <Link to="/forms/new">
              <Plus className="size-4" /> Create Form
            </Link>
          </Button>
        }
      />

      <p className="text-xs text-muted-foreground">
        {liveCount} of {formatLimit(plan.forms)} live forms used on the {plan.name} plan.
        {atLimit && (
          <button
            type="button"
            className="ml-1 font-medium text-primary hover:underline"
            onClick={() => setUpgradeOpen(true)}
          >
            Upgrade for more
          </button>
        )}
      </p>

      {isLoading ? (
        <div className="surface-card p-5">
          <SkeletonRows rows={3} />
        </div>
      ) : (forms ?? []).length === 0 ? (
        <div className="surface-card p-5">
          <EmptyState
            icon={ClipboardList}
            title="Create your first collection form"
            body="Send customers a link and their testimonials land straight in your dashboard."
            action={
              <Button asChild className="rounded-xl">
                <Link to="/forms/new">Create Form</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(forms ?? []).map((f) => {
            const live = f.status === "live";
            return (
              <div key={f.id} className="surface-card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display font-bold">{f.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {brandName(f.brand_id)} · {submissionCounts.get(f.id) ?? 0} submissions
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      live ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {live ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{f.headline}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Updated {f.updated_at ? format(new Date(f.updated_at), "MMM d, yyyy") : "—"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild className="rounded-xl">
                    <Link to="/forms/$id" params={{ id: f.id }}>
                      <Pencil className="size-3.5" /> Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={!live}
                    onClick={async () => {
                      await copyToClipboard(formUrl(f.slug));
                      toast.success("Form link copied");
                    }}
                  >
                    <Copy className="size-3.5" /> Copy link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={!live}
                    onClick={async () => {
                      await copyToClipboard(formEmbedCode(f.slug));
                      toast.success("Embed code copied");
                    }}
                  >
                    <Code2 className="size-3.5" /> Embed
                  </Button>
                  {live && (
                    <Button variant="ghost" size="sm" asChild className="rounded-xl">
                      <a href={`/f/${f.slug}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-3.5" /> Open
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-destructive hover:text-destructive"
                    onClick={() => setToDelete(f.id)}
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete form?"
        body="Are you sure you want to delete this collection form? The public link will stop working. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!toDelete) return;
          await remove.mutateAsync(toDelete);
          setToDelete(null);
          toast.success("Form deleted");
        }}
      />

      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        currentPlan={plan.id}
        reason={`The ${plan.name} plan is limited to ${formatLimit(plan.forms)} live forms.`}
      />
    </div>
  );
}
