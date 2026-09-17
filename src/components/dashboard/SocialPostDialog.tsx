import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useBrands } from "@/lib/data";
import { formatLimit, usePlan } from "@/lib/plans";
import {
  SOCIAL_PRESETS,
  copyCanvasToClipboard,
  defaultsForTheme,
  downloadCanvas,
  fontFor,
  postThemes,
  renderSocialPost,
  slugifyName,
  type SocialPostOverrides,
} from "@/lib/social-post";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ColorField, SliderField, SwitchField } from "./controls";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/lib/widget";

export function SocialPostDialog({
  testimonial,
  open,
  onOpenChange,
}: {
  testimonial: Testimonial | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const { data: brands } = useBrands(user?.id);
  const plan = usePlan(user?.id);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [presetId, setPresetId] = useState(SOCIAL_PRESETS[0]?.id ?? "instagram-post");
  const [themeId, setThemeId] = useState("light");
  const [showRating, setShowRating] = useState(true);
  const [showBrandName, setShowBrandName] = useState(true);
  const [showBrandLogo, setShowBrandLogo] = useState(true);
  const [showTestimoniallyBranding, setShowTestimoniallyBranding] = useState(true);
  const [overrides, setOverrides] = useState<SocialPostOverrides>(() =>
    defaultsForTheme(postThemes("#6366F1")[0]!),
  );
  const [rendering, setRendering] = useState(false);

  const brand = (brands ?? []).find((b) => b.id === testimonial?.brand_id) ?? (brands ?? [])[0];
  const themes = useMemo(() => postThemes(brand?.primary_color ?? "#6366F1"), [brand]);
  const preset = SOCIAL_PRESETS.find((p) => p.id === presetId) ?? SOCIAL_PRESETS[0]!;
  const theme = themes.find((t) => t.id === themeId) ?? themes[0]!;
  const canRemoveBranding = plan.removeBranding;

  useEffect(() => {
    setOverrides(defaultsForTheme(theme));
  }, [theme]);

  useEffect(() => {
    if (!open) return;
    setShowTestimoniallyBranding(!canRemoveBranding);
  }, [open, canRemoveBranding]);

  const setOverride = <K extends keyof SocialPostOverrides>(key: K, value: SocialPostOverrides[K]) =>
    setOverrides((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (!open || !testimonial) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    setRendering(true);
    void renderSocialPost(canvas, {
      testimonial,
      preset,
      theme,
      headingFont: fontFor(brand?.heading_font, "Plus Jakarta Sans"),
      bodyFont: fontFor(brand?.body_font, "Inter"),
      showRating,
      showBrandName,
      showBrandLogo,
      showTestimoniallyBranding,
      brandName: brand?.name,
      brandLogo: brand?.logo,
      overrides,
    }).finally(() => {
      if (!cancelled) setRendering(false);
    });
    return () => {
      cancelled = true;
    };
  }, [
    open,
    testimonial,
    preset,
    theme,
    brand,
    showRating,
    showBrandName,
    showBrandLogo,
    showTestimoniallyBranding,
    overrides,
  ]);

  const filename = `${slugifyName(testimonial?.customer_name ?? "testimonial")}-${preset.id}.png`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl p-4 sm:max-w-4xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-display">Create social post</DialogTitle>
          <DialogDescription>
            Turn this testimonial into a ready-to-post image for any platform.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Platform &amp; size</p>
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
                {SOCIAL_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPresetId(p.id)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left transition-colors",
                      p.id === presetId
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/40 hover:bg-muted/60",
                    )}
                  >
                    <span className="block text-sm font-medium">{p.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{p.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Style</p>
              <div className="grid grid-cols-2 gap-1.5">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setThemeId(t.id)}
                    className={cn(
                      "flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                      t.id === themeId ? "border-primary bg-primary/5" : "hover:bg-muted/60",
                    )}
                  >
                    <span className="size-4 shrink-0 rounded-full border" style={{ background: t.background }} />
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border p-3">
              <SwitchField label="Show star rating" checked={showRating} onChange={setShowRating} />
              <SwitchField label="Show brand name" checked={showBrandName} onChange={setShowBrandName} />
              <SwitchField label="Show brand logo" checked={showBrandLogo} onChange={setShowBrandLogo} />
              <SwitchField
                label="Show Testimonially branding"
                checked={showTestimoniallyBranding}
                onChange={canRemoveBranding ? setShowTestimoniallyBranding : () => setShowTestimoniallyBranding(true)}
              />
              {!canRemoveBranding && (
                <p className="text-xs text-muted-foreground">
                  The {plan.name} plan includes Testimonially branding. Upgrade to remove it.
                </p>
              )}
            </div>

            <div className="space-y-3 rounded-xl border p-3">
              <ColorField label="Background" value={overrides.background} onChange={(v) => setOverride("background", v)} />
              <ColorField label="Card" value={overrides.card} onChange={(v) => setOverride("card", v)} />
              <ColorField label="Text" value={overrides.text} onChange={(v) => setOverride("text", v)} />
              <ColorField label="Accent" value={overrides.accent} onChange={(v) => setOverride("accent", v)} />
              <SliderField
                label="Quote size"
                value={overrides.quoteSize}
                min={34}
                max={76}
                step={1}
                suffix="px"
                onChange={(v) => setOverride("quoteSize", v)}
              />
              <SliderField
                label="Name size"
                value={overrides.nameSize}
                min={26}
                max={48}
                step={1}
                suffix="px"
                onChange={(v) => setOverride("nameSize", v)}
              />
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <div className="grid place-items-center rounded-2xl border bg-muted/40 p-3 sm:p-4">
              <div className="relative w-full max-w-[420px]">
                <canvas
                  ref={canvasRef}
                  className="h-auto w-full rounded-xl shadow-sm"
                  aria-label="Social post preview"
                />
                {rendering && (
                  <div className="absolute inset-0 grid place-items-center rounded-xl bg-background/40">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                className="rounded-xl"
                onClick={() => {
                  if (!canvasRef.current) return;
                  downloadCanvas(canvasRef.current, filename);
                  toast.success("Post image downloaded");
                }}
              >
                <Download className="size-4" /> Download PNG
              </Button>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={async () => {
                  if (!canvasRef.current) return;
                  try {
                    await copyCanvasToClipboard(canvasRef.current);
                    toast.success("Image copied to clipboard");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Could not copy the image");
                  }
                }}
              >
                <Copy className="size-4" /> Copy image
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Exported at {preset.width}×{preset.height} px — the recommended size for {preset.label}.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
