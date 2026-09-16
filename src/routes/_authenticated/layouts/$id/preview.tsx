import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Code2, Copy, Globe, Loader2, Monitor, Pencil, Smartphone, Tablet } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  copyToClipboard,
  embedCode,
  useLayout,
  useSaveLayout,
  useTestimonials,
  widgetUrl,
} from "@/lib/data";
import { mergeConfig, type LayoutType } from "@/lib/widget";
import { TestimonialWidget } from "@/components/widget/TestimonialWidget";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { StatusBadge } from "@/components/dashboard/bits";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const devices = [
  { key: "desktop", label: "Desktop", icon: Monitor, width: 0 },
  { key: "tablet", label: "Tablet", icon: Tablet, width: 820 },
  { key: "mobile", label: "Mobile", icon: Smartphone, width: 390 },
] as const;

export const Route = createFileRoute("/_authenticated/layouts/$id/preview")({
  component: PreviewPage,
  head: () => ({
    meta: [
      { title: "Layout preview — Testimonially" },
      {
        name: "description",
        content: "Preview your testimonial widget and copy its public URL or embed code.",
      },
      { property: "og:title", content: "Layout preview — Testimonially" },
      {
        property: "og:description",
        content: "Preview your testimonial widget and copy its public URL or embed code.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function PreviewPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { data: layout, isLoading } = useLayout(id);
  const { data: testimonials } = useTestimonials(user?.id);
  const save = useSaveLayout(user?.id);
  const [device, setDevice] = useState<(typeof devices)[number]["key"]>("desktop");

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="surface-card p-10 text-center">
        <p className="text-sm text-muted-foreground">This layout no longer exists.</p>
      </div>
    );
  }

  const published = layout.status === "published";
  const picked = layout.selected_testimonials
    .map((tid) => (testimonials ?? []).find((t) => t.id === tid))
    .filter(Boolean);
  const width = devices.find((d) => d.key === device)!.width;

  async function togglePublish() {
    if (!published && publishedCount >= plan.publishedLayouts) {
      toast.error(
        `The ${plan.name} plan allows ${formatLimit(plan.publishedLayouts)} published layouts. Upgrade in Billing to publish more.`,
      );
      return;
    }
    await save.mutateAsync({
      id: layout!.id,
      values: { status: published ? "draft" : "published" },
    });
    toast.success(published ? "Widget unpublished" : "Your testimonial widget is now live");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={layout.name}
        subtitle="Preview your widget, copy its public URL, and embed it on your site."
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/layouts/$id" params={{ id: layout.id }}>
                <Pencil className="size-4" /> Edit Layout
              </Link>
            </Button>
            <Button
              className="rounded-xl"
              variant={published ? "outline" : "default"}
              onClick={togglePublish}
              disabled={save.isPending}
            >
              {save.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Globe className="size-4" />
              )}
              {published ? "Unpublish" : "Publish"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="surface-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-sm font-bold">Preview</h2>
              <StatusBadge status={layout.status} />
            </div>
            <div className="flex gap-1 rounded-xl bg-muted p-1">
              {devices.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  title={d.label}
                  onClick={() => setDevice(d.key)}
                  className={cn(
                    "grid size-8 place-items-center rounded-lg transition-colors",
                    device === d.key
                      ? "bg-card text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <d.icon className="size-4" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center overflow-x-auto bg-muted/40 p-4">
            <div
              className="w-full overflow-hidden rounded-xl border bg-card"
              style={width ? { maxWidth: width } : undefined}
            >
              <TestimonialWidget
                type={layout.type as LayoutType}
                config={mergeConfig(layout.configuration)}
                testimonials={picked as never}
                viewportWidth={width || undefined}
              />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <section className="surface-card p-5">
            <h2 className="font-display text-sm font-bold">Public URL</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {published
                ? "Anyone with this link can view your widget — no login needed."
                : "Publish this layout to activate its public link."}
            </p>
            <p className="mt-3 truncate rounded-xl border bg-muted/50 px-3 py-2 font-mono text-xs">
              {widgetUrl(layout.public_slug)}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full rounded-xl"
              disabled={!published}
              onClick={async () => {
                await copyToClipboard(widgetUrl(layout.public_slug));
                toast.success("Widget URL copied");
              }}
            >
              <Copy className="size-4" /> Copy URL
            </Button>
          </section>

          <section className="surface-card p-5">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold">
              <Code2 className="size-4" /> Embed code
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Paste this snippet into your website's HTML where the testimonials should appear.
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl border bg-muted/50 p-3 text-[11px] leading-relaxed">
              {embedCode(layout.public_slug)}
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full rounded-xl"
              disabled={!published}
              onClick={async () => {
                await copyToClipboard(embedCode(layout.public_slug));
                toast.success("Embed code copied");
              }}
            >
              <Copy className="size-4" /> Copy Embed Code
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
