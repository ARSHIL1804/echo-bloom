import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useBrands, useDeleteBrand, useSaveBrand, type Brand } from "@/lib/data";
import { formatLimit, usePlan } from "@/lib/plans";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { UpgradeDialog } from "@/components/dashboard/UpgradeDialog";
import { ColorField, FontField } from "@/components/dashboard/controls";
import { cn } from "@/lib/utils";
import { fontStack, initials } from "@/lib/widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/brand")({
  component: BrandPage,
  head: () => ({
    meta: [
      { title: "Brand — Testimonially" },
      {
        name: "description",
        content: "Set your brand colors, fonts, and details so every widget matches your site.",
      },
      { property: "og:title", content: "Brand — Testimonially" },
      {
        property: "og:description",
        content: "Set your brand colors, fonts, and details so every widget matches your site.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Values = Omit<Brand, "id" | "user_id" | "created_at" | "updated_at">;

const empty: Values = {
  name: "",
  website: "",
  logo: "",
  description: "",
  primary_color: "#6366F1",
  secondary_color: "#111827",
  text_color: "#111827",
  background_color: "#F8FAFC",
  font_family: "Inter",
  heading_font: "Plus Jakarta Sans",
  body_font: "Inter",
};

function toValues(brand: Brand): Values {
  return {
    name: brand.name ?? "",
    website: brand.website ?? "",
    logo: brand.logo ?? "",
    description: brand.description ?? "",
    primary_color: brand.primary_color,
    secondary_color: brand.secondary_color,
    text_color: brand.text_color,
    background_color: brand.background_color,
    font_family: brand.font_family,
    heading_font: brand.heading_font,
    body_font: brand.body_font,
  };
}

function BrandPage() {
  const { user } = useAuth();
  const { data: brands, isLoading } = useBrands(user?.id);
  const plan = usePlan(user?.id);
  const saveBrand = useSaveBrand(user?.id);
  const deleteBrand = useDeleteBrand();

  const list = brands ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [values, setValues] = useState<Values>(empty);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const active = list.find((b) => b.id === selectedId) ?? list[0];
  const activeId = active?.id;

  useEffect(() => {
    if (activeId) setValues(toValues(active!));
    else setValues(empty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function submit() {
    if (!values.name.trim()) { toast.error("Your brand needs a name"); return; }
    try {
      const result = await saveBrand.mutateAsync({
        ...(activeId ? { id: activeId } : {}),
        values: values as never,
      });
      if (!activeId && result) setSelectedId(result.id);
      toast.success("Brand saved successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your brand");
    }
  }

  function addBrand() {
    if (list.length >= plan.brands) {
      setUpgradeOpen(true);
      return;
    }
    setSelectedId(null);
    setValues(empty);
  }

  async function handleDelete() {
    if (!activeId) return;
    try {
      await deleteBrand.mutateAsync(activeId);
      setConfirmDelete(false);
      setSelectedId(null);
      toast.success("Brand deleted");
    } catch {
      toast.error("Could not delete brand");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand"
        subtitle="Your brand details, colors, and fonts — reusable across every widget."
        action={
          <Button className="rounded-xl" onClick={submit} disabled={saveBrand.isPending}>
            {saveBrand.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {activeId ? "Save Brand" : "Create Brand"}
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {list.map((brand) => (
          <button
            key={brand.id}
            type="button"
            onClick={() => setSelectedId(brand.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              brand.id === activeId
                ? "border-primary bg-primary-soft text-primary"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {brand.logo ? (
              <img src={brand.logo} alt="" className="size-4 rounded object-cover" />
            ) : (
              <span
                className="grid size-4 place-items-center rounded-full text-[8px] font-bold text-white"
                style={{ backgroundColor: brand.primary_color }}
              >
                {initials(brand.name || "?")}
              </span>
            )}
            {brand.name || "Untitled brand"}
          </button>
        ))}
        <button
          type="button"
          onClick={addBrand}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="size-3.5" /> Add brand
          <span className="text-xs opacity-70">
            {list.length}/{formatLimit(plan.brands)}
          </span>
        </button>
 {activeId && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto rounded-xl text-danger hover:text-danger"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-3.5" /> Delete brand
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <section className="surface-card space-y-4 p-6">
            <h2 className="font-display font-bold">Brand info</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="brand-name">Brand name</Label>
                <Input
                  id="brand-name"
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Acme Inc."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brand-website">Website URL</Label>
                <Input
                  id="brand-website"
                  value={values.website ?? ""}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://acme.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand-logo">Logo URL</Label>
              <Input
                id="brand-logo"
                value={values.logo ?? ""}
                onChange={(e) => set("logo", e.target.value)}
                placeholder="https://acme.com/logo.png"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand-description">Description</Label>
              <Textarea
                id="brand-description"
                value={values.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="What your company does, in a sentence."
              />
            </div>
          </section>

          <section className="surface-card space-y-4 p-6">
            <h2 className="font-display font-bold">Brand colors</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                label="Primary"
                value={values.primary_color}
                onChange={(v) => set("primary_color", v)}
              />
              <ColorField
                label="Secondary"
                value={values.secondary_color}
                onChange={(v) => set("secondary_color", v)}
              />
              <ColorField
                label="Text"
                value={values.text_color}
                onChange={(v) => set("text_color", v)}
              />
              <ColorField
                label="Background"
                value={values.background_color}
                onChange={(v) => set("background_color", v)}
              />
            </div>
          </section>

          <section className="surface-card space-y-4 p-6">
            <h2 className="font-display font-bold">Brand typography</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <FontField
                label="Font family"
                value={values.font_family}
                onChange={(v) => set("font_family", v)}
              />
              <FontField
                label="Heading font"
                value={values.heading_font}
                onChange={(v) => set("heading_font", v)}
              />
              <FontField
                label="Body font"
                value={values.body_font}
                onChange={(v) => set("body_font", v)}
              />
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="surface-card overflow-hidden">
            <div className="border-b px-5 py-3.5">
              <h2 className="font-display text-sm font-bold">Live preview</h2>
            </div>
            <div
              className="space-y-5 p-6"
              style={{ backgroundColor: values.background_color, color: values.text_color }}
            >
              <div className="flex items-center gap-3">
                {values.logo ? (
                  <img
                    src={values.logo}
                    alt={`${values.name || "Brand"} logo`}
                    className="size-11 rounded-xl object-cover"
                  />
                ) : (
                  <span
                    className="grid size-11 place-items-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: values.primary_color }}
                  >
                    {initials(values.name || "Brand")}
                  </span>
                )}
                <div className="min-w-0">
                  <p
                    className="truncate text-lg font-bold"
                    style={{ fontFamily: fontStack(values.heading_font) }}
                  >
                    {values.name || "Your brand"}
                  </p>
                  {values.website && (
                    <p
                      className="truncate text-xs"
                      style={{ color: values.secondary_color, opacity: 0.75 }}
                    >
                      {values.website}
                    </p>
                  )}
                </div>
              </div>

              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: fontStack(values.body_font), color: values.secondary_color }}
              >
                {values.description || "A short description of your company appears here."}
              </p>

              <div
                className="rounded-2xl border p-4"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: fontStack(values.body_font), color: values.text_color }}
                >
                  “This is how a testimonial card looks with your brand styling applied.”
                </p>
                <p
                  className="mt-3 text-xs font-semibold"
                  style={{ fontFamily: fontStack(values.heading_font), color: values.text_color }}
                >
                  Jamie Rivera
                  <span className="ml-1 font-normal" style={{ color: values.secondary_color }}>
                    · Northwind
                  </span>
                </p>
              </div>

              <button
                type="button"
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                style={{
                  backgroundColor: values.primary_color,
                  fontFamily: fontStack(values.heading_font),
                }}
              >
                Primary button
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete brand?"
        body={`Are you sure you want to delete "${active?.name ?? "this brand"}"? Layouts using it will keep working without brand styling. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        currentPlan={plan.id}
        reason={`The ${plan.name} plan includes ${formatLimit(plan.brands)} brand${plan.brands === 1 ? "" : "s"}. Upgrade to manage more brands.`}
      />
    </div>
  );
}
