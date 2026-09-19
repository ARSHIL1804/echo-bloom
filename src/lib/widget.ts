import type { TestimonialSourceId } from "./testimonial-sources";

export type LayoutType =
  | "grid"
  | "carousel"
  | "masonry"
  | "featured"
  | "list"
  | "minimal"
  | "wall"
  | "multicarousel"
  | "marquee"
  | "badge"
  | "toast";

export type Testimonial = {
  id: string;
  user_id?: string;
  brand_id?: string | null;
  form_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  customer_avatar?: string | null;
  company_name?: string | null;
  company_logo?: string | null;
  job_title?: string | null;
  content: string;
  rating: number;
  source?: TestimonialSourceId | string;
  status: "published" | "draft" | string;
  created_at?: string;
  updated_at?: string;
};

export type WidgetConfig = {
  colors: {
    background: string;
    card: string;
    text: string;
    secondaryText: string;
    accent: string;
    border: string;
    star: string;
  };
  typography: {
    fontFamily: string;
    contentSize: number;
    nameSize: number;
    companySize: number;
    lineHeight: number;
    fontWeight: number;
  };
  card: {
    radius: number;
    borderWidth: number;
    shadow: "none" | "sm" | "md" | "lg";
    padding: number;
    spacing: number;
  };
  avatar: {
    show: boolean;
    size: number;
    shape: "circle" | "rounded" | "square";
  };
  rating: {
    show: boolean;
    size: number;
    position: "top" | "bottom";
  };
  layout: {
    columns: number;
    gap: number;
    maxWidth: number;
    align: "left" | "center";
    padding: number;
  };
  carousel: {
    autoplay: boolean;
    speed: number;
    arrows: boolean;
    dots: boolean;
    rows: number;
  };
  wall: {
    showHeader: boolean;
    headline: string;
    showSummary: boolean;
  };
  marquee: {
    rows: number;
    speed: number;
    pauseOnHover: boolean;
  };
  badge: {
    showLabel: boolean;
  };
  toast: {
    position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    showAvatar: boolean;
  };
  branding: {
    /** Show the "Powered by Testimonially" footer. Always on for Free plans. */
    show: boolean;
  };
};

export type WidgetTheme = "light" | "dark";

export type ThemedWidgetConfig = {
  version: 2;
  themes: Record<WidgetTheme, WidgetConfig>;
};

export const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Poppins",
  "Plus Jakarta Sans",
  "DM Sans",
  "System UI",
] as const;

export const LAYOUT_TYPES: { type: LayoutType; name: string; description: string }[] = [
  { type: "grid", name: "Grid", description: "Cards arranged in a responsive grid." },
  { type: "carousel", name: "Carousel", description: "Horizontal testimonial slider." },
  { type: "masonry", name: "Masonry", description: "Pinterest-style masonry cards." },
  { type: "featured", name: "Featured", description: "One large highlighted testimonial." },
  { type: "list", name: "List", description: "Simple vertical testimonial list." },
  { type: "minimal", name: "Minimal", description: "Very minimal testimonial design." },
  {
    type: "wall",
    name: "Wall of Love",
    description: "A public wall page of your best testimonials.",
  },
  {
    type: "multicarousel",
    name: "Multi-row",
    description: "Carousel showing several rows of cards per slide.",
  },
  { type: "marquee", name: "Marquee", description: "Endless auto-scrolling rows of testimonials." },
  { type: "badge", name: "Badge", description: "Compact average-rating badge for footers." },
  { type: "toast", name: "Floating toast", description: "Small popup card cycling testimonials." },
];

export const defaultConfig: WidgetConfig = {
  colors: {
    background: "#F8FAFC",
    card: "#FFFFFF",
    text: "#111827",
    secondaryText: "#6B7280",
    accent: "#6366F1",
    border: "#E5E7EB",
    star: "#F59E0B",
  },
  typography: {
    fontFamily: "Inter",
    contentSize: 15,
    nameSize: 15,
    companySize: 13,
    lineHeight: 1.65,
    fontWeight: 400,
  },
  card: { radius: 16, borderWidth: 1, shadow: "sm", padding: 24, spacing: 20 },
  avatar: { show: true, size: 44, shape: "circle" },
  rating: { show: true, size: 16, position: "top" },
  layout: { columns: 3, gap: 20, maxWidth: 1100, align: "left", padding: 32 },
  carousel: { autoplay: true, speed: 4000, arrows: true, dots: true, rows: 2 },
  wall: { showHeader: true, headline: "Loved by customers", showSummary: true },
  marquee: { rows: 2, speed: 40, pauseOnHover: true },
  badge: { showLabel: true },
  toast: { position: "bottom-right", showAvatar: true },
  branding: { show: true },
};

export const defaultDarkConfig: WidgetConfig = {
  ...defaultConfig,
  colors: {
    background: "#111827",
    card: "#1F2937",
    text: "#F9FAFB",
    secondaryText: "#9CA3AF",
    accent: "#818CF8",
    border: "#374151",
    star: "#FBBF24",
  },
};

function isThemedConfig(value: unknown): value is Partial<ThemedWidgetConfig> & {
  themes: Partial<Record<WidgetTheme, unknown>>;
} {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { themes?: unknown };
  return !!candidate.themes && typeof candidate.themes === "object";
}

export function mergeConfig(raw: unknown, theme: WidgetTheme = "light"): WidgetConfig {
  const selected = isThemedConfig(raw) ? raw.themes[theme] : theme === "light" ? raw : undefined;
  const fallback = theme === "dark" ? defaultDarkConfig : defaultConfig;
  const value = (selected ?? {}) as Partial<WidgetConfig>;
  return {
    colors: { ...fallback.colors, ...(value.colors ?? {}) },
    typography: { ...fallback.typography, ...(value.typography ?? {}) },
    card: { ...fallback.card, ...(value.card ?? {}) },
    avatar: { ...fallback.avatar, ...(value.avatar ?? {}) },
    rating: { ...fallback.rating, ...(value.rating ?? {}) },
    layout: { ...fallback.layout, ...(value.layout ?? {}) },
    carousel: { ...fallback.carousel, ...(value.carousel ?? {}) },
    wall: { ...fallback.wall, ...(value.wall ?? {}) },
    marquee: { ...fallback.marquee, ...(value.marquee ?? {}) },
    badge: { ...fallback.badge, ...(value.badge ?? {}) },
    toast: { ...fallback.toast, ...(value.toast ?? {}) },
    branding: { ...fallback.branding, ...(value.branding ?? {}) },
  };
}

export function mergeThemedConfig(raw: unknown): ThemedWidgetConfig {
  return {
    version: 2,
    themes: {
      light: mergeConfig(raw, "light"),
      dark: mergeConfig(raw, "dark"),
    },
  };
}

export const shadowMap: Record<WidgetConfig["card"]["shadow"], string> = {
  none: "none",
  sm: "0 1px 3px rgba(17,24,39,0.06), 0 1px 2px -1px rgba(17,24,39,0.05)",
  md: "0 6px 18px -8px rgba(17,24,39,0.15)",
  lg: "0 20px 40px -18px rgba(17,24,39,0.25)",
};

export function fontStack(font: string) {
  if (font === "System UI") return "ui-sans-serif, system-ui, sans-serif";
  return `"${font}", ui-sans-serif, system-ui, sans-serif`;
}

export function avatarRadius(shape: WidgetConfig["avatar"]["shape"]) {
  if (shape === "circle") return "9999px";
  if (shape === "rounded") return "10px";
  return "0px";
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export type LayoutRecord = {
  id: string;
  user_id?: string;
  brand_id?: string | null;
  name: string;
  type: LayoutType | string;
  selected_testimonials: string[];
  configuration: unknown;
  status: string;
  public_slug: string;
  created_at?: string;
  updated_at?: string;
};
