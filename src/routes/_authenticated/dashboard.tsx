import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import {
  Eye,
  LayoutGrid,
  MessageSquareQuote,
  Pencil,
  Plus,
  Radio,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  useDeleteTestimonial,
  useLayouts,
  useProfile,
  useTestimonials,
  widgetUrl,
} from "@/lib/data";
import { PageHeader, EmptyState } from "@/components/dashboard/DashboardShell";
import { Rating, SkeletonRows, StatCard, StatusBadge } from "@/components/dashboard/bits";
import { Button } from "@/components/ui/button";
import { TestimonialWidget } from "@/components/widget/TestimonialWidget";
import { mergeConfig } from "@/lib/widget";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardHome,
  head: () => ({
    meta: [
      { title: "Dashboard — Testimonially" },
      { name: "description", content: "Overview of your testimonials, layouts and live widgets." },
      { property: "og:title", content: "Dashboard — Testimonially" },
      {
        property: "og:description",
        content: "Overview of your testimonials, layouts and live widgets.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function DashboardHome() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: testimonials, isLoading: loadingT } = useTestimonials(user?.id);
  const { data: layouts, isLoading: loadingL } = useLayouts(user?.id);
  const remove = useDeleteTestimonial();
  const [toDelete, setToDelete] = useState<string | null>(null);

  const name = profile?.name || user?.email?.split("@")[0] || "there";
  const list = testimonials ?? [];
  const published = list.filter((t) => t.status === "published");
  const activeWidgets = (layouts ?? []).filter((l) => l.status === "published");

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting()}, ${name}`}
        subtitle="Here's what's happening with your testimonials."
        action={
          <Button asChild className="rounded-xl">
            <Link to="/testimonials/new">
              <Plus className="size-4" /> Add Testimonial
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Testimonials"
          value={list.length}
          icon={MessageSquareQuote}
          loading={loadingT}
        />
        <StatCard
          label="Published"
          value={published.length}
          icon={CheckCircle2}
          loading={loadingT}
        />
        <StatCard
          label="Layouts"
          value={(layouts ?? []).length}
          icon={LayoutGrid}
          loading={loadingL}
        />
        <StatCard
          label="Active Widgets"
          value={activeWidgets.length}
          icon={Radio}
          loading={loadingL}
        />
      </div>

      <section className="surface-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <h2 className="font-display text-base font-bold">Recent Testimonials</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/testimonials">View all</Link>
          </Button>
        </div>

        {loadingT ? (
          <div className="p-5">
            <SkeletonRows />
          </div>
        ) : list.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={MessageSquareQuote}
              title="No testimonials yet"
              body="Start collecting customer feedback and build your social proof."
              action={
                <Button asChild className="rounded-xl">
                  <Link to="/testimonials/new">Add Your First Testimonial</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Rating</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.slice(0, 6).map((t) => (
                  <tr key={t.id} className="border-t transition-colors hover:bg-muted/40">
                    <td className="px-5 py-3.5 font-medium">{t.customer_name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{t.company_name || "—"}</td>
                    <td className="px-5 py-3.5">
                      <Rating value={t.rating} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {t.created_at ? format(new Date(t.created_at), "MMM d, yyyy") : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild title="Edit">
                          <Link to="/testimonials/$id" params={{ id: t.id }}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View"
                          onClick={() => toast(t.customer_name, { description: t.content })}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setToDelete(t.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold">Active Layouts</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/layouts">Manage layouts</Link>
          </Button>
        </div>

        {loadingL ? (
          <SkeletonRows rows={2} />
        ) : (layouts ?? []).length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title="Create your first testimonial widget"
            body="Turn your testimonials into beautiful social proof for your website."
            action={
              <Button asChild className="rounded-xl">
                <Link to="/layouts/new">Create Layout</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(layouts ?? []).slice(0, 3).map((layout) => {
              const selected = (layout.selected_testimonials ?? [])
                .map((id) => list.find((t) => t.id === id))
                .filter(Boolean)
                .slice(0, 2) as typeof list;
              return (
                <Link
                  key={layout.id}
                  to="/layouts/$id"
                  params={{ id: layout.id }}
                  className="surface-card overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="h-40 overflow-hidden border-b bg-muted/40">
                    <div className="origin-top-left scale-[0.6]" style={{ width: "167%" }}>
                      <TestimonialWidget
                        type={layout.type}
                        config={mergeConfig(layout.configuration)}
                        testimonials={selected}
                        viewportWidth={900}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold">{layout.name}</p>
                      <StatusBadge status={layout.status} />
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {layout.status === "published"
                        ? widgetUrl(layout.public_slug)
                        : `${(layout.selected_testimonials ?? []).length} testimonials · ${layout.type}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete testimonial?"
        body="Are you sure you want to delete this testimonial? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!toDelete) return;
          await remove.mutateAsync(toDelete);
          setToDelete(null);
          toast.success("Testimonial deleted");
        }}
      />
    </div>
  );
}
