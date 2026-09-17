import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  Copy,
  GripVertical,
  Loader2,
  Monitor,
  Search,
  Smartphone,
  Tablet,
  Globe,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  copyToClipboard,
  useBrands,
  useLayouts,
  useSaveLayout,
  useTestimonials,
  widgetUrl,
} from "@/lib/data";
import { formatLimit, usePlan } from "@/lib/plans";
import {
  LAYOUT_TYPES,
  defaultConfig,
  mergeConfig,
  type LayoutRecord,
  type LayoutType,
  type WidgetConfig,
} from "@/lib/widget";
import { TestimonialWidget } from "@/components/widget/TestimonialWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ColorField, FontField, OptionField, SliderField, SwitchField } from "./controls";
import { cn } from "@/lib/utils";

const devices = [
  { key: "desktop", label: "Desktop", icon: Monitor, width: 0 },
  { key: "tablet", label: "Tablet", icon: Tablet, width: 820 },
  { key: "mobile", label: "Mobile", icon: Smartphone, width: 390 },
] as const;

type DeviceKey = (typeof devices)[number]["key"];

export function LayoutEditor({ layout }: { layout?: LayoutRecord }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: testimonials } = useTestimonials(user?.id);
  const { data: layouts } = useLayouts(user?.id);
  const { data: brands } = useBrands(user?.id);
  const plan = usePlan(user?.id);
  const save = useSaveLayout(user?.id);
  const publishedCount = (layouts ?? []).filter((l) => l.status === "published").length;

  const [name, setName] = useState(layout?.name ?? "My testimonial widget");
  const [type, setType] = useState<LayoutType>((layout?.type as LayoutType) ?? "grid");
  const [selected, setSelected] = useState<string[]>(layout?.selected_testimonials ?? []);
  const [config, setConfig] = useState<WidgetConfig>(mergeConfig(layout?.configuration));
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const [search, setSearch] = useState("");
  const [brandId, setBrandId] = useState<string>(layout?.brand_id ?? "");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(
    layout?.status === "published" ? layout.public_slug : null,
  );

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const all = testimonials ?? [];
  const touch = () => setDirty(true);

  function update<K extends keyof WidgetConfig>(section: K, values: Partial<WidgetConfig[K]>) {
    setConfig((c) => ({ ...c, [section]: { ...c[section], ...values } }));
    touch();
  }

  const selectedTestimonials = useMemo(
    () =>
      selected
        .map((id) => all.find((t) => t.id === id))
        .filter(Boolean) as typeof all,
    [selected, all],
  );

  const previewTestimonials = selectedTestimonials.length ? selectedTestimonials : [];

  const filtered = useMemo(() => {
    let rows = all;
    if (brandId) rows = rows.filter((t) => t.brand_id === brandId);
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((t) =>
      [t.customer_name, t.company_name, t.content].filter(Boolean).some((v) =>
        v!.toLowerCase().includes(q),
      ),
    );
  }, [all, search, brandId]);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    touch();
  }

  function reorder(targetId: string) {
    if (!dragId || dragId === targetId) return;
    setSelected((s) => {
      const next = [...s];
      const from = next.indexOf(dragId);
      const to = next.indexOf(targetId);
      if (from === -1 || to === -1) return s;
      const [moved] = next.splice(from, 1);
      if (moved) next.splice(to, 0, moved);
      return next;
    });
    touch();
  }

  async function handleSave(mode: "draft" | "publish") {
    if (!name.trim()) { toast.error("Give your layout a name"); return; }
    if (mode === "publish" && layout?.status !== "published" && publishedCount >= plan.publishedLayouts) {
      toast.error(
        `The ${plan.name} plan allows ${formatLimit(plan.publishedLayouts)} published layouts. Upgrade in Billing to publish more.`,
      );
      return;
    }
    setSaving(mode);
    try {
      const result = await save.mutateAsync({
        ...(layout ? { id: layout.id } : {}),
        values: {
          name: name.trim(),
          type,
          brand_id: brandId || null,
          selected_testimonials: selected,
          configuration: config as unknown as LayoutRecord["configuration"],
          status: mode === "publish" ? "published" : layout?.status ?? "draft",
        },
      });
      setDirty(false);
      if (mode === "publish") {
        setPublishedSlug(result.public_slug);
        toast.success("Your testimonial widget is now live");
      } else {
        toast.success("Layout saved");
      }
      if (!layout) navigate({ to: "/layouts/$id", params: { id: result.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save layout");
    } finally {
      setSaving(null);
    }
  }

  const deviceWidth = devices.find((d) => d.key === device)!.width;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Label htmlFor="layout-name" className="text-xs text-muted-foreground">
            Layout name
          </Label>
          <Input
            id="layout-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              touch();
            }}
            className="mt-1 h-11 max-w-sm border-0 bg-transparent px-0 font-display text-2xl font-bold shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {dirty && (
            <span className="hidden self-center text-xs text-muted-foreground sm:inline">
              Unsaved changes
            </span>
          )}
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => handleSave("draft")}
            disabled={!!saving}
          >
            {saving === "draft" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save
          </Button>
          <Button className="rounded-xl" onClick={() => handleSave("publish")} disabled={!!saving}>
            {saving === "publish" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Globe className="size-4" />
            )}
            Save &amp; Publish
          </Button>
        </div>
      </div>

      {publishedSlug && (
        <div className="surface-card flex flex-wrap items-center justify-between gap-3 border-success/30 bg-success/5 p-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-success">
              <Check className="size-4" /> Your testimonial widget is live
            </p>
            <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
              {widgetUrl(publishedSlug)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={async () => {
                await copyToClipboard(widgetUrl(publishedSlug));
                toast.success("Widget URL copied");
              }}
            >
              <Copy className="size-4" /> Copy URL
            </Button>
            {layout && (
              <Button variant="ghost" size="sm" asChild className="rounded-xl">
                <Link to="/layouts/$id/preview" params={{ id: layout.id }}>
                  Open preview
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        {/* Configuration */}
        <div className="space-y-4">
          <section className="surface-card p-5">
            <h2 className="font-display text-sm font-bold">Layout type</h2>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {LAYOUT_TYPES.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => {
                    setType(option.type);
                    touch();
                  }}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all hover:border-primary/50",
                    type === option.type ? "border-primary bg-primary-soft" : "bg-card",
                  )}
                >
                  <Thumbnail type={option.type} active={type === option.type} />
                  <p className="mt-2.5 text-sm font-semibold">{option.name}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-bold">Select Testimonials</h2>
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => {
                  const ids = filtered.map((t) => t.id);
                  const allPicked = ids.length > 0 && ids.every((id) => selected.includes(id));
                  setSelected(
                    allPicked
                      ? selected.filter((id) => !ids.includes(id))
                      : [...selected, ...ids.filter((id) => !selected.includes(id))],
                  );
                  touch();
                }}
              >
                {filtered.length > 0 && filtered.every((t) => selected.includes(t.id))
                  ? "Clear all"
                  : "Select all"}
              </button>
            </div>
            {(brands ?? []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[{ id: "", name: "All brands" }, ...(brands ?? [])].map((b) => (
                  <button
                    key={b.id || "all"}
                    type="button"
                    onClick={() => {
                      setBrandId(b.id);
                      touch();
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      brandId === b.id
                        ? "border-primary bg-primary-soft text-primary"
                        : "hover:bg-muted/60",
                    )}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search testimonials"
                className="pl-9"
              />
            </div>

            {all.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
                No testimonials yet.{" "}
                <Link to="/testimonials/new" className="font-medium text-primary hover:underline">
                  Add one first
                </Link>
                .
              </p>
            ) : (
              <div className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
                {filtered.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
                No testimonials match this brand or search.
              </p>
            ) : null}
            {filtered.map((t) => {
                  const isSelected = selected.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      draggable={isSelected}
                      onDragStart={() => setDragId(t.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        reorder(t.id);
                        setDragId(null);
                      }}
                      className={cn(
                        "flex items-start gap-2.5 rounded-xl border p-2.5 transition-colors",
                        isSelected ? "border-primary/40 bg-primary-soft/50" : "hover:bg-muted/50",
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggle(t.id)}
                        className="mt-0.5"
                        aria-label={`Select ${t.customer_name}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{t.customer_name}</p>
                          {isSelected && (
                            <span className="rounded bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                              #{selected.indexOf(t.id) + 1}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {t.company_name || "—"} · {t.content}
                        </p>
                      </div>
                      {isSelected && (
                        <GripVertical className="mt-0.5 size-4 shrink-0 cursor-grab text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">
              Drag selected testimonials to change their display order.
            </p>
          </section>

          <section className="surface-card p-5">
            <h2 className="font-display text-sm font-bold">Customization</h2>
            <Accordion type="multiple" defaultValue={["colors"]} className="mt-2">
              <AccordionItem value="colors">
                <AccordionTrigger className="text-sm">Colors</AccordionTrigger>
                <AccordionContent className="grid grid-cols-2 gap-3">
                  <ColorField
                    label="Background"
                    value={config.colors.background}
                    onChange={(v) => update("colors", { background: v })}
                  />
                  <ColorField
                    label="Card background"
                    value={config.colors.card}
                    onChange={(v) => update("colors", { card: v })}
                  />
                  <ColorField
                    label="Text"
                    value={config.colors.text}
                    onChange={(v) => update("colors", { text: v })}
                  />
                  <ColorField
                    label="Secondary text"
                    value={config.colors.secondaryText}
                    onChange={(v) => update("colors", { secondaryText: v })}
                  />
                  <ColorField
                    label="Accent"
                    value={config.colors.accent}
                    onChange={(v) => update("colors", { accent: v })}
                  />
                  <ColorField
                    label="Border"
                    value={config.colors.border}
                    onChange={(v) => update("colors", { border: v })}
                  />
                  <ColorField
                    label="Star"
                    value={config.colors.star}
                    onChange={(v) => update("colors", { star: v })}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="typography">
                <AccordionTrigger className="text-sm">Typography</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FontField
                    label="Font family"
                    value={config.typography.fontFamily}
                    onChange={(v) => update("typography", { fontFamily: v })}
                  />
                  <SliderField
                    label="Testimonial size"
                    value={config.typography.contentSize}
                    min={11}
                    max={26}
                    suffix="px"
                    onChange={(v) => update("typography", { contentSize: v })}
                  />
                  <SliderField
                    label="Customer name size"
                    value={config.typography.nameSize}
                    min={11}
                    max={24}
                    suffix="px"
                    onChange={(v) => update("typography", { nameSize: v })}
                  />
                  <SliderField
                    label="Company size"
                    value={config.typography.companySize}
                    min={10}
                    max={20}
                    suffix="px"
                    onChange={(v) => update("typography", { companySize: v })}
                  />
                  <SliderField
                    label="Line height"
                    value={config.typography.lineHeight}
                    min={1.1}
                    max={2.2}
                    step={0.05}
                    onChange={(v) => update("typography", { lineHeight: v })}
                  />
                  <OptionField
                    label="Font weight"
                    value={String(config.typography.fontWeight)}
                    options={[
                      { value: "400", label: "Regular" },
                      { value: "500", label: "Medium" },
                      { value: "600", label: "Semibold" },
                    ]}
                    onChange={(v) => update("typography", { fontWeight: Number(v) })}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="card">
                <AccordionTrigger className="text-sm">Card styling</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <SliderField
                    label="Border radius"
                    value={config.card.radius}
                    min={0}
                    max={36}
                    suffix="px"
                    onChange={(v) => update("card", { radius: v })}
                  />
                  <SliderField
                    label="Border width"
                    value={config.card.borderWidth}
                    min={0}
                    max={4}
                    suffix="px"
                    onChange={(v) => update("card", { borderWidth: v })}
                  />
                  <OptionField
                    label="Shadow"
                    value={config.card.shadow}
                    options={[
                      { value: "none", label: "None" },
                      { value: "sm", label: "Subtle" },
                      { value: "md", label: "Medium" },
                      { value: "lg", label: "Large" },
                    ]}
                    onChange={(v) => update("card", { shadow: v as WidgetConfig["card"]["shadow"] })}
                  />
                  <SliderField
                    label="Card padding"
                    value={config.card.padding}
                    min={8}
                    max={56}
                    suffix="px"
                    onChange={(v) => update("card", { padding: v })}
                  />
                  <SliderField
                    label="Card spacing"
                    value={config.card.spacing}
                    min={0}
                    max={56}
                    suffix="px"
                    onChange={(v) => update("card", { spacing: v })}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="avatar">
                <AccordionTrigger className="text-sm">Avatar</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <SwitchField
                    label="Show avatar"
                    checked={config.avatar.show}
                    onChange={(v) => update("avatar", { show: v })}
                  />
                  <SliderField
                    label="Avatar size"
                    value={config.avatar.size}
                    min={24}
                    max={80}
                    suffix="px"
                    onChange={(v) => update("avatar", { size: v })}
                  />
                  <OptionField
                    label="Avatar shape"
                    value={config.avatar.shape}
                    options={[
                      { value: "circle", label: "Circle" },
                      { value: "rounded", label: "Rounded" },
                      { value: "square", label: "Square" },
                    ]}
                    onChange={(v) =>
                      update("avatar", { shape: v as WidgetConfig["avatar"]["shape"] })
                    }
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="rating">
                <AccordionTrigger className="text-sm">Rating</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <SwitchField
                    label="Show rating"
                    checked={config.rating.show}
                    onChange={(v) => update("rating", { show: v })}
                  />
                  <SliderField
                    label="Star size"
                    value={config.rating.size}
                    min={10}
                    max={30}
                    suffix="px"
                    onChange={(v) => update("rating", { size: v })}
                  />
                  <ColorField
                    label="Star color"
                    value={config.colors.star}
                    onChange={(v) => update("colors", { star: v })}
                  />
                  <OptionField
                    label="Rating position"
                    value={config.rating.position}
                    options={[
                      { value: "top", label: "Above testimonial" },
                      { value: "bottom", label: "Below testimonial" },
                    ]}
                    onChange={(v) =>
                      update("rating", { position: v as WidgetConfig["rating"]["position"] })
                    }
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="layout">
                <AccordionTrigger className="text-sm">Layout</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <SliderField
                    label="Columns"
                    value={config.layout.columns}
                    min={1}
                    max={4}
                    onChange={(v) => update("layout", { columns: v })}
                  />
                  <SliderField
                    label="Gap"
                    value={config.layout.gap}
                    min={0}
                    max={64}
                    suffix="px"
                    onChange={(v) => update("layout", { gap: v })}
                  />
                  <SliderField
                    label="Maximum width"
                    value={config.layout.maxWidth}
                    min={400}
                    max={1600}
                    step={20}
                    suffix="px"
                    onChange={(v) => update("layout", { maxWidth: v })}
                  />
                  <OptionField
                    label="Alignment"
                    value={config.layout.align}
                    options={[
                      { value: "left", label: "Left" },
                      { value: "center", label: "Center" },
                    ]}
                    onChange={(v) =>
                      update("layout", { align: v as WidgetConfig["layout"]["align"] })
                    }
                  />
                  <SliderField
                    label="Padding"
                    value={config.layout.padding}
                    min={0}
                    max={80}
                    suffix="px"
                    onChange={(v) => update("layout", { padding: v })}
                  />
                </AccordionContent>
              </AccordionItem>

              {(type === "wall") && (
                <AccordionItem value="wall">
                  <AccordionTrigger className="text-sm">Wall of Love</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <SwitchField
                      label="Show header"
                      checked={config.wall.showHeader}
                      onChange={(v) => update("wall", { showHeader: v })}
                    />
                    <div className="space-y-1.5">
                      <Label htmlFor="wall-headline" className="text-xs text-muted-foreground">
                        Headline
                      </Label>
                      <Input
                        id="wall-headline"
                        value={config.wall.headline}
                        onChange={(e) => update("wall", { headline: e.target.value })}
                        placeholder="Loved by customers"
                      />
                    </div>
                    <SwitchField
                      label="Show rating summary"
                      checked={config.wall.showSummary}
                      onChange={(v) => update("wall", { showSummary: v })}
                    />
                  </AccordionContent>
                </AccordionItem>
              )}

              {(type === "carousel" || type === "multicarousel") && (
                <AccordionItem value="carousel">
                  <AccordionTrigger className="text-sm">Carousel</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {type === "multicarousel" && (
                      <SliderField
                        label="Rows"
                        value={config.carousel.rows}
                        min={1}
                        max={3}
                        onChange={(v) => update("carousel", { rows: v })}
                      />
                    )}
                    <SwitchField
                      label="Autoplay"
                      checked={config.carousel.autoplay}
                      onChange={(v) => update("carousel", { autoplay: v })}
                    />
                    <SliderField
                      label="Autoplay speed"
                      value={config.carousel.speed}
                      min={1000}
                      max={10000}
                      step={500}
                      suffix="ms"
                      onChange={(v) => update("carousel", { speed: v })}
                    />
                    <SwitchField
                      label="Show arrows"
                      checked={config.carousel.arrows}
                      onChange={(v) => update("carousel", { arrows: v })}
                    />
                    <SwitchField
                      label="Show dots"
                      checked={config.carousel.dots}
                      onChange={(v) => update("carousel", { dots: v })}
                    />
                  </AccordionContent>
                </AccordionItem>
              )}

              {type === "marquee" && (
                <AccordionItem value="marquee">
                  <AccordionTrigger className="text-sm">Marquee</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <SliderField
                      label="Rows"
                      value={config.marquee.rows}
                      min={1}
                      max={2}
                      onChange={(v) => update("marquee", { rows: v })}
                    />
                    <SliderField
                      label="Scroll duration"
                      value={config.marquee.speed}
                      min={10}
                      max={120}
                      step={5}
                      suffix="s"
                      onChange={(v) => update("marquee", { speed: v })}
                    />
                    <SwitchField
                      label="Pause on hover"
                      checked={config.marquee.pauseOnHover}
                      onChange={(v) => update("marquee", { pauseOnHover: v })}
                    />
                  </AccordionContent>
                </AccordionItem>
              )}

              {type === "badge" && (
                <AccordionItem value="badge">
                  <AccordionTrigger className="text-sm">Badge</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <SwitchField
                      label="Show rating score"
                      checked={config.badge.showLabel}
                      onChange={(v) => update("badge", { showLabel: v })}
                    />
                  </AccordionContent>
                </AccordionItem>
              )}

              {type === "toast" && (
                <AccordionItem value="toast">
                  <AccordionTrigger className="text-sm">Floating toast</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <OptionField
                      label="Position"
                      value={config.toast.position}
                      options={[
                        { value: "bottom-right", label: "Bottom right" },
                        { value: "bottom-left", label: "Bottom left" },
                        { value: "top-right", label: "Top right" },
                        { value: "top-left", label: "Top left" },
                      ]}
                      onChange={(v) =>
                        update("toast", { position: v as WidgetConfig["toast"]["position"] })
                      }
                    />
                    <SwitchField
                      label="Show avatar"
                      checked={config.toast.showAvatar}
                      onChange={(v) => update("toast", { showAvatar: v })}
                    />
                    <SwitchField
                      label="Auto-rotate"
                      checked={config.carousel.autoplay}
                      onChange={(v) => update("carousel", { autoplay: v })}
                    />
                    <SliderField
                      label="Rotation speed"
                      value={config.carousel.speed}
                      min={1000}
                      max={10000}
                      step={500}
                      suffix="ms"
                      onChange={(v) => update("carousel", { speed: v })}
                    />
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="branding">
                <AccordionTrigger className="text-sm">Branding</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <SwitchField
                    label="Show Testimonially branding"
                    checked={brandingVisible}
                    disabled={!plan.removeBranding}
                    onChange={(v) => update("branding", { show: v })}
                  />
                  {!plan.removeBranding && (
                    <div className="rounded-xl bg-primary-soft p-3 text-xs text-foreground">
                      <p>Hiding the “Powered by Testimonially” badge is a Pro feature.</p>
                      <Button
                        size="sm"
                        className="mt-2 rounded-lg"
                        onClick={() => setUpgradeOpen(true)}
                      >
                        Upgrade to Pro
                      </Button>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                setConfig(defaultConfig);
                touch();
              }}
            >
              Reset to defaults
            </Button>
          </section>
        </div>

        {/* Live preview */}
        <div className="space-y-3">
          <div className="surface-card sticky top-4 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
              <h2 className="font-display text-sm font-bold">Preview</h2>
              <div className="flex gap-1 rounded-xl bg-muted p-1">
                {devices.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDevice(d.key)}
                    title={d.label}
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
                className="w-full overflow-hidden rounded-xl border bg-card transition-all"
                style={deviceWidth ? { maxWidth: deviceWidth } : undefined}
              >
                <TestimonialWidget
                  type={type}
                  config={config}
                  testimonials={previewTestimonials}
                  viewportWidth={deviceWidth || undefined}
                  showBranding={brandingVisible}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Thumbnail({ type, active }: { type: LayoutType; active: boolean }) {
  const bar = cn("rounded-sm", active ? "bg-primary/60" : "bg-muted-foreground/25");
  if (type === "grid")
    return (
      <div className="grid h-12 grid-cols-3 gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className={bar} />
        ))}
      </div>
    );
  if (type === "carousel")
    return (
      <div className="flex h-12 items-stretch gap-1">
        <span className={cn(bar, "flex-[2]")} />
        <span className={cn(bar, "flex-[2]")} />
        <span className={cn(bar, "flex-[0.6] opacity-50")} />
      </div>
    );
  if (type === "masonry")
    return (
      <div className="grid h-12 grid-cols-3 gap-1">
        <span className={cn(bar, "row-span-2")} />
        <span className={bar} />
        <span className={cn(bar, "row-span-2")} />
        <span className={bar} />
      </div>
    );
  if (type === "featured") return <div className={cn(bar, "h-12 w-full")} />;
  if (type === "list")
    return (
      <div className="flex h-12 flex-col gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className={cn(bar, "flex-1")} />
        ))}
      </div>
    );
  if (type === "wall")
    return (
      <div className="flex h-12 flex-col gap-1">
        <span className={cn(bar, "h-2 w-2/3")} />
        <div className="grid flex-1 grid-cols-2 gap-1">
          <span className={bar} />
          <span className={cn(bar, "row-span-2")} />
          <span className={bar} />
        </div>
      </div>
    );
  if (type === "multicarousel")
    return (
      <div className="grid h-12 grid-cols-3 grid-rows-2 gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className={bar} />
        ))}
      </div>
    );
  if (type === "marquee")
    return (
      <div className="flex h-12 flex-col justify-center gap-1.5 overflow-hidden">
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className={cn(bar, "h-4 w-6 shrink-0")} />
          ))}
        </div>
        <div className="-ml-3 flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className={cn(bar, "h-4 w-6 shrink-0 opacity-70")} />
          ))}
        </div>
      </div>
    );
  if (type === "badge")
    return (
      <div className="flex h-12 items-center justify-center gap-1.5">
        <span className={cn(bar, "size-3 rounded-full")} />
        <span className={cn(bar, "h-1.5 w-10")} />
        <span className={cn(bar, "h-1.5 w-6")} />
      </div>
    );
  if (type === "toast")
    return (
      <div className="relative h-12 overflow-hidden rounded-md bg-muted/40">
        <span
          className={cn(
            "absolute bottom-1 right-1 h-6 w-10 rounded-sm",
            active ? "bg-primary/60" : "bg-muted-foreground/25",
          )}
        />
      </div>
    );
  return (
    <div className="flex h-12 flex-col justify-center gap-1.5">
      {Array.from({ length: 3 }).map((_, i) => (
        <span key={i} className={cn(bar, "h-1.5", i === 2 && "w-2/3")} />
      ))}
    </div>
  );
}
