import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Eye, LayoutGrid, Pencil, Plus, Trash2, Files } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  copyToClipboard,
  useDeleteLayout,
  useLayouts,
  useSaveLayout,
  useTestimonials,
  widgetUrl,
} from "@/lib/data";
import { mergeConfig, type LayoutRecord, type LayoutType } from "@/lib/widget";
import { EmptyState, PageHeader } from "@/components/dashboard/DashboardShell";
import { StatusBadge } from "@/components/dashboard/bits";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { TestimonialWidget } from "@/components/widget/TestimonialWidget";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/layouts/")({
  component: LayoutsPage,
  head: () => ({
    meta: [
      { title: "Testimonial layouts — Testimonially" },
      {
        name: "description",
        content: "Create and manage the testimonial widgets you embed on your website.",
      },
      { property: "og:title", content: "Testimonial layouts — Testimonially" },
      {
        property: "og:description",
        content: "Create and manage the testimonial widgets you embed on your website.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function LayoutsPage() {
  const { user } = useAuth();
  const { data: layouts, isLoading } = useLayouts(user?.id);
  const { data: testimonials } = useTestimonials(user?.id);
  const save = useSaveLayout(user?.id);
  const remove = useDeleteLayout();
  const [toDelete, setToDelete] = useState<LayoutRecord | null>(null);

  async function duplicate(layout: LayoutRecord) {
    try {
      await save.mutateAsync({
        values: {
          name: `${layout.name} (copy)`,
          type: layout.type,
          selected_testimonials: layout.selected_testimonials,
          configuration: layout.configuration,
          status: "draft",
        },
      });
      toast.success("Layout duplicated");
    } catch {
      toast.error("Could not duplicate layout");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonial Layouts"
        subtitle="Create beautiful testimonial widgets for your website."
        action={
          <Button asChild className="rounded-xl">
            <Link to="/layouts/new">
              <Plus className="size-4" /> Create Layout
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : !layouts?.length ? (
        <EmptyState
          icon={LayoutGrid}
          title="Create your first testimonial widget"
          description="Turn your testimonials into beautiful social proof for your website."
          action={
            <Button asChild className="rounded-xl">
              <Link to="/layouts/new">
                <Plus className="size-4" /> Create Layout
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {layouts.map((layout) => {
            const picked = layout.selected_testimonials
              .map((id) => (testimonials ?? []).find((t) => t.id === id))
              .filter(Boolean);
            return (
              <div key={layout.id} className="surface-card overflow-hidden">
                <div className="h-44 overflow-hidden border-b bg-muted/40">
                  <div className="pointer-events-none origin-top-left scale-[0.45] [width:222%]">
                    <TestimonialWidget
                      type={layout.type as LayoutType}
                      config={mergeConfig(layout.configuration)}
                      testimonials={picked as never}
                      viewportWidth={900}
                    />
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display font-bold">{layout.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {layout.selected_testimonials.length} testimonials · {layout.type} ·
                        updated{" "}
                        {new Date(layout.updated_at ?? Date.now()).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <StatusBadge status={layout.status} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="rounded-xl">
                      <Link to="/layouts/$id" params={{ id: layout.id }}>
                        <Pencil className="size-3.5" /> Edit
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="rounded-xl">
                      <Link to="/layouts/$id/preview" params={{ id: layout.id }}>
                        <Eye className="size-3.5" /> Preview
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-xl"
                      onClick={() => duplicate(layout)}
                    >
                      <Files className="size-3.5" /> Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-xl"
                      disabled={layout.status !== "published"}
                      onClick={async () => {
                        await copyToClipboard(widgetUrl(layout.public_slug));
                        toast.success("Widget URL copied");
                      }}
                    >
                      <Copy className="size-3.5" /> Copy URL
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-xl text-danger hover:text-danger"
                      onClick={() => setToDelete(layout)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete layout?"
        subtitle="Are you sure you want to delete this layout? Any website embedding it will stop showing testimonials. This action cannot be undone."
        confirmLabel="Delete"
        loading={remove.isPending}
        onConfirm={async () => {
          if (!toDelete) return;
          await remove.mutateAsync(toDelete.id);
          setToDelete(null);
          toast.success("Layout deleted");
        }}
      />
    </div>
  );
}
