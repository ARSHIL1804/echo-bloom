import type { ReactNode } from "react";

export const TESTIMONIAL_SOURCE_IDS = [
  "text",
  "google",
  "facebook",
  "twitter",
  "linkedin",
  "instagram",
  "capterra",
  "trustpilot",
  "reddit",
  "yelp",
  "g2",
  "app-store",
  "play-store",
] as const;

export type TestimonialSourceId = (typeof TESTIMONIAL_SOURCE_IDS)[number];

type SourceMeta = {
  id: TestimonialSourceId;
  label: string;
  shortLabel: string;
  color: string;
  icon: string;
};

export const TESTIMONIAL_SOURCES: SourceMeta[] = [
  { id: "text", label: "Text Testimonial", shortLabel: "Text", color: "#6366F1", icon: "T" },
  { id: "google", label: "Google", shortLabel: "Google", color: "#4285F4", icon: "G" },
  { id: "facebook", label: "Facebook", shortLabel: "Facebook", color: "#1877F2", icon: "f" },
  { id: "twitter", label: "Twitter", shortLabel: "Twitter", color: "#111827", icon: "𝕏" },
  { id: "linkedin", label: "LinkedIn", shortLabel: "LinkedIn", color: "#0A66C2", icon: "in" },
  { id: "instagram", label: "Instagram", shortLabel: "Instagram", color: "#E4405F", icon: "◎" },
  { id: "capterra", label: "Capterra", shortLabel: "Capterra", color: "#FF9D00", icon: "C" },
  { id: "trustpilot", label: "Trustpilot", shortLabel: "Trustpilot", color: "#00B67A", icon: "★" },
  { id: "reddit", label: "Reddit", shortLabel: "Reddit", color: "#FF4500", icon: "r" },
  { id: "yelp", label: "Yelp", shortLabel: "Yelp", color: "#D32323", icon: "Y" },
  { id: "g2", label: "G2", shortLabel: "G2", color: "#FF492C", icon: "G2" },
  { id: "app-store", label: "App Store", shortLabel: "App Store", color: "#0D96F6", icon: "A" },
  { id: "play-store", label: "Play Store", shortLabel: "Play Store", color: "#00A173", icon: "▶" },
];

const fallbackSource = TESTIMONIAL_SOURCES[0];

export function normalizeSource(value: unknown): TestimonialSourceId {
  if (typeof value === "string" && TESTIMONIAL_SOURCE_IDS.includes(value as TestimonialSourceId)) {
    return value as TestimonialSourceId;
  }
  return "text";
}

export function sourceMeta(value: unknown): SourceMeta {
  return TESTIMONIAL_SOURCES.find((source) => source.id === normalizeSource(value)) ?? fallbackSource;
}

export function SourceIcon({
  source,
  className,
  size = "md",
}: {
  source: unknown;
  className?: string;
  size?: "sm" | "md";
}): ReactNode {
  const meta = sourceMeta(source);
  const sizeClass = size === "sm" ? "size-5 text-[10px]" : "size-7 text-xs";
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-bold text-primary-foreground ${sizeClass} ${className ?? ""}`}
      style={{ backgroundColor: meta.color }}
      aria-hidden="true"
    >
      {meta.icon}
    </span>
  );
}

export function SourcePill({ source }: { source: unknown }) {
  const meta = sourceMeta(source);
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
      <SourceIcon source={source} size="sm" />
      <span className="truncate">{meta.shortLabel}</span>
    </span>
  );
}
