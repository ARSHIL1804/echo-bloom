import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useBrands } from "@/lib/data";
import {
  SOCIAL_PRESETS,
  copyCanvasToClipboard,
  downloadCanvas,
  fontFor,
  postThemes,
  renderSocialPost,
  slugifyName,
} from "@/lib/social-post";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SwitchField } from "./controls";
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [presetId, setPresetId] = useState(SOCIAL_PRESETS[0]!.id);
  const [themeId, setThemeId] = useState("light");
  const [showRating, setShowRating] = useState(true);
  const [showBrandName, setShowBrandName] = useState(true);
  const [rendering, setRendering] = useState(false);

  const brand = (brands ?? []).find((b) => b.id === testimonial?.brand_id) ?? (brands ?? [])[0];
  const themes = useMemo(() => postThemes(brand?.primary_color ?? "#6366F1"), [brand]);
  const preset = SOCIAL_PRESETS.find((p) => p.id === presetId) ?? SOCIAL_PRESETS[0]!;
  const theme = themes.find((t) => t.id === themeId) ?? themes[0]!;

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
      brandName: brand?.name,
    }).finally(() => {
      if (!cancelled) setRendering(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, testimonial, preset, theme, brand, showRating, showBrandName]);

  const filename = `${slugifyName(testimonial?.customer_name ?? "testimonial")}-${preset.id}.png`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display">Create social post</DialogTitle>
          <DialogDescription>
            Turn this testimonial into a ready-to-post image for any platform.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Platform &amp; size</p>
              <div className="grid gap-1.5">
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
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                      t.id === themeId ? "border-primary bg-primary/5" : "hover:bg-muted/60",
                    )}
                  >
                    <span
                      className="size-4 rounded-full border"
                      style={{ background: t.background }}
                    />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 rounded-xl border p-3">
              <SwitchField label="Show star rating" checked={showRating} onChange={setShowRating} />
              <SwitchField
                label="Show brand name"
                checked={showBrandName}
                onChange={setShowBrandName}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid place-items-center rounded-2xl border bg-muted/40 p-4">
              <div className="relative w-full max-w-[360px]">
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
                    toast.error(
                      error instanceof Error ? error.message : "Could not copy the image",
                    );
                  }
                }}
              >
                <Copy className="size-4" /> Copy image
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Exported at {preset.width}×{preset.height} px — the recommended size for{" "}
              {preset.label}.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
