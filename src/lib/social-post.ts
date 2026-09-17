import type { Testimonial } from "./widget";
import { fontStack, initials } from "./widget";

export type SocialPreset = {
  id: string;
  label: string;
  hint: string;
  width: number;
  height: number;
};

export const SOCIAL_PRESETS: SocialPreset[] = [
  { id: "instagram-post", label: "Instagram post", hint: "1:1 · 1080×1080", width: 1080, height: 1080 },
  { id: "instagram-story", label: "Instagram story", hint: "9:16 · 1080×1920", width: 1080, height: 1920 },
  { id: "x-post", label: "X post", hint: "16:9 · 1600×900", width: 1600, height: 900 },
  { id: "linkedin-post", label: "LinkedIn post", hint: "1.91:1 · 1200×627", width: 1200, height: 627 },
  { id: "facebook-post", label: "Facebook post", hint: "1.91:1 · 1200×630", width: 1200, height: 630 },
  { id: "pinterest-pin", label: "Pinterest pin", hint: "2:3 · 1000×1500", width: 1000, height: 1500 },
];

export type PostTheme = {
  id: string;
  label: string;
  background: string;
  card: string;
  text: string;
  muted: string;
  accent: string;
};

export type SocialPostOverrides = {
  background: string;
  card: string;
  text: string;
  muted: string;
  accent: string;
  quoteSize: number;
  nameSize: number;
};

export function postThemes(primary: string): PostTheme[] {
  return [
    { id: "light", label: "Light", background: "#F8FAFC", card: "#FFFFFF", text: "#111827", muted: "#6B7280", accent: primary },
    { id: "dark", label: "Dark", background: "#111827", card: "#1F2937", text: "#F9FAFB", muted: "#9CA3AF", accent: primary },
    { id: "brand", label: "Brand", background: primary, card: "#FFFFFF", text: "#111827", muted: "#6B7280", accent: primary },
    { id: "minimal", label: "Minimal", background: "#FFFFFF", card: "#FFFFFF", text: "#111827", muted: "#6B7280", accent: primary },
  ];
}

export function defaultsForTheme(theme: PostTheme): SocialPostOverrides {
  return {
    background: theme.background,
    card: theme.card,
    text: theme.text,
    muted: theme.muted,
    accent: theme.accent,
    quoteSize: 58,
    nameSize: 38,
  };
}

export type RenderOptions = {
  testimonial: Testimonial;
  preset: SocialPreset;
  theme: PostTheme;
  headingFont: string;
  bodyFont: string;
  showRating: boolean;
  showBrandName: boolean;
  showBrandLogo: boolean;
  showTestimoniallyBranding: boolean;
  brandName?: string | undefined;
  brandLogo?: string | null | undefined;
  overrides?: Partial<SocialPostOverrides> | undefined;
};

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const spikes = 5;
  const outer = size / 2;
  const inner = outer * 0.42;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function loadImage(src?: string | null): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = window.setTimeout(() => resolve(null), 2500);
    img.crossOrigin = "anonymous";
    img.onload = () => {
      window.clearTimeout(timeout);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timeout);
      resolve(null);
    };
    img.src = src;
  });
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string, size: number, weight: number) {
  let next = size;
  while (next > size * 0.65) {
    ctx.font = `${weight} ${Math.round(next)}px ${font}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    next -= 2;
  }
  return next;
}

/** Draws the social post onto the given canvas at full export resolution. */
export async function renderSocialPost(canvas: HTMLCanvasElement, options: RenderOptions) {
  const { preset, theme, testimonial } = options;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = preset.width;
  canvas.height = preset.height;

  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      /* fonts are best effort */
    }
  }

  const brandLogo = options.showBrandLogo ? await loadImage(options.brandLogo) : null;

  const colors = { ...theme, ...(options.overrides ?? {}) };
  const W = preset.width;
  const H = preset.height;
  const scale = Math.min(W, H) / 1080;
  const pad = Math.round(Math.min(W, H) * 0.075);

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, W, H);

  const cardX = pad;
  const cardY = pad;
  const cardW = W - pad * 2;
  const cardH = H - pad * 2;

  if (colors.card !== colors.background) {
    ctx.save();
    ctx.shadowColor = "rgba(17,24,39,0.18)";
    ctx.shadowBlur = 60 * scale;
    ctx.shadowOffsetY = 24 * scale;
    ctx.fillStyle = colors.card;
    roundedRect(ctx, cardX, cardY, cardW, cardH, 48 * scale);
    ctx.fill();
    ctx.restore();
  }

  const innerPad = Math.round(Math.min(cardW, cardH) * 0.1);
  const contentX = cardX + innerPad;
  const contentW = cardW - innerPad * 2;

  ctx.fillStyle = colors.accent;
  ctx.globalAlpha = 0.18;
  ctx.font = `700 ${Math.round(190 * scale)}px ${options.headingFont}`;
  ctx.textBaseline = "top";
  ctx.fillText("“", contentX, cardY + innerPad - 40 * scale);
  ctx.globalAlpha = 1;

  const quote = testimonial.content ?? "";
  let fontSize = Math.round((options.overrides?.quoteSize ?? 58) * scale);
  const minFont = Math.round(22 * scale);
  let lines: string[] = [];
  let lineHeight = 0;
  const footerHeight = (options.showTestimoniallyBranding ? 245 : 205) * scale;
  const quoteTop = cardY + innerPad + 130 * scale;
  const available = cardY + cardH - innerPad - footerHeight - quoteTop;

  while (fontSize >= minFont) {
    ctx.font = `600 ${fontSize}px ${options.bodyFont}`;
    lines = wrapText(ctx, quote, contentW);
    lineHeight = fontSize * 1.36;
    if (lines.length * lineHeight <= available) break;
    fontSize -= 2;
  }
  ctx.font = `600 ${fontSize}px ${options.bodyFont}`;
  ctx.fillStyle = colors.text;
  let y = quoteTop;
  for (const line of lines) {
    ctx.fillText(line, contentX, y);
    y += lineHeight;
  }

  let footerY = cardY + cardH - innerPad - 118 * scale;
  if (options.showTestimoniallyBranding) footerY -= 34 * scale;
  if (options.showRating && testimonial.rating > 0) {
    const starSize = 40 * scale;
    const gap = 12 * scale;
    ctx.fillStyle = colors.accent;
    for (let i = 0; i < testimonial.rating; i++) {
      drawStar(ctx, contentX + starSize / 2 + i * (starSize + gap), footerY - 40 * scale, starSize);
    }
  } else {
    footerY += 30 * scale;
  }

  const avatarSize = 96 * scale;
  const avatarX = contentX;
  const avatarY = footerY + 10 * scale;
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 ${Math.round(avatarSize * 0.38)}px ${options.headingFont}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials(testimonial.customer_name || "?"), avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 2 * scale);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const textX = avatarX + avatarSize + 28 * scale;
  const meta = [testimonial.job_title, testimonial.company_name].filter(Boolean).join(" · ");
  const nameSize = fitText(ctx, testimonial.customer_name || "", contentW - avatarSize - 30 * scale, options.headingFont, Math.round((options.overrides?.nameSize ?? 38) * scale), 700);
  ctx.fillStyle = colors.text;
  ctx.font = `700 ${Math.round(nameSize)}px ${options.headingFont}`;
  ctx.fillText(testimonial.customer_name || "", textX, avatarY + 12 * scale);
  if (meta) {
    ctx.fillStyle = colors.muted;
    ctx.font = `500 ${Math.round(30 * scale)}px ${options.bodyFont}`;
    ctx.fillText(meta, textX, avatarY + 62 * scale);
  }

  if (options.showBrandName && options.brandName) {
    const rightX = cardX + cardW - innerPad;
    const logoSize = 42 * scale;
    ctx.textAlign = "right";
    ctx.fillStyle = colors.muted;
    ctx.font = `600 ${Math.round(26 * scale)}px ${options.bodyFont}`;
    ctx.fillText(options.brandName, rightX, avatarY + 36 * scale);
    ctx.textAlign = "left";
    if (brandLogo) {
      const lx = rightX - ctx.measureText(options.brandName).width - logoSize - 14 * scale;
      if (lx > textX + 80 * scale) {
        ctx.save();
        roundedRect(ctx, lx, avatarY + 24 * scale, logoSize, logoSize, 10 * scale);
        ctx.clip();
        ctx.drawImage(brandLogo, lx, avatarY + 24 * scale, logoSize, logoSize);
        ctx.restore();
      }
    }
  }

  if (options.showTestimoniallyBranding) {
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    ctx.font = `600 ${Math.round(22 * scale)}px ${options.bodyFont}`;
    ctx.fillStyle = colors.muted;
    const label = "Powered by ";
    const brand = "Testimonially";
    const brandW = ctx.measureText(brand).width;
    const yPos = cardY + cardH - Math.max(18 * scale, innerPad * 0.45);
    const xRight = cardX + cardW - innerPad;
    ctx.fillText(label, xRight - brandW, yPos);
    ctx.fillStyle = colors.accent;
    ctx.font = `800 ${Math.round(22 * scale)}px ${options.bodyFont}`;
    ctx.fillText(brand, xRight, yPos);
    ctx.textAlign = "left";
  }
}

export function fontFor(name: string | null | undefined, fallback: string) {
  return fontStack(name || fallback);
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}

export async function copyCanvasToClipboard(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
  if (!blob) throw new Error("Could not create image");
  const clipboard = navigator.clipboard as Clipboard & { write?: (items: ClipboardItem[]) => Promise<void> };
  if (!clipboard.write || typeof ClipboardItem === "undefined") {
    throw new Error("Your browser cannot copy images");
  }
  await clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

export function slugifyName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "testimonial";
}
