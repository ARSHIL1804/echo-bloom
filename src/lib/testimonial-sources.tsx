import type { ComponentType, ReactNode } from "react";
import { FaAppStoreIos, FaFacebookF, FaGoogle, FaLinkedinIn, FaRedditAlien, FaYelp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { RiInstagramFill } from "react-icons/ri";
import { SiG2, SiGoogleplay, SiTrustpilot } from "react-icons/si";
import { PencilLine } from "lucide-react";

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
  icon: ComponentType<{ className?: string }>;
};

const TEXT_SOURCE: SourceMeta = {
  id: "text",
  label: "Text Testimonial",
  shortLabel: "Text",
  color: "#6366F1",
  icon: PencilLine,
};

function CapterraIcon({ className }: { className?: string }) {
  return <span className={`font-black leading-none ${className ?? ""}`}>C</span>;
}

export const TESTIMONIAL_SOURCES: SourceMeta[] = [
  TEXT_SOURCE,
  { id: "google", label: "Google", shortLabel: "Google", color: "#4285F4", icon: FaGoogle },
  { id: "facebook", label: "Facebook", shortLabel: "Facebook", color: "#1877F2", icon: FaFacebookF },
  { id: "twitter", label: "Twitter", shortLabel: "Twitter", color: "#111827", icon: FaXTwitter },
  { id: "linkedin", label: "LinkedIn", shortLabel: "LinkedIn", color: "#0A66C2", icon: FaLinkedinIn },
  { id: "instagram", label: "Instagram", shortLabel: "Instagram", color: "#E4405F", icon: RiInstagramFill },
  { id: "capterra", label: "Capterra", shortLabel: "Capterra", color: "#FF9D00", icon: CapterraIcon },
  { id: "trustpilot", label: "Trustpilot", shortLabel: "Trustpilot", color: "#00B67A", icon: SiTrustpilot },
  { id: "reddit", label: "Reddit", shortLabel: "Reddit", color: "#FF4500", icon: FaRedditAlien },
  { id: "yelp", label: "Yelp", shortLabel: "Yelp", color: "#D32323", icon: FaYelp },
  { id: "g2", label: "G2", shortLabel: "G2", color: "#FF492C", icon: SiG2 },
  { id: "app-store", label: "App Store", shortLabel: "App Store", color: "#0D96F6", icon: FaAppStoreIos },
  { id: "play-store", label: "Play Store", shortLabel: "Play Store", color: "#00A173", icon: SiGoogleplay },
];

const fallbackSource = TEXT_SOURCE;

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
  const Icon = meta.icon;
  const sizeClass = size === "sm" ? "size-5 text-[11px]" : "size-7 text-sm";
  const iconClass = size === "sm" ? "size-3.5" : "size-4";
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full bg-background ${sizeClass} ${className ?? ""}`}
      style={{ color: meta.color }}
      aria-hidden="true"
    >
      <Icon className={iconClass} />
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
