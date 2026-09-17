import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import {
  avatarRadius,
  fontStack,
  initials,
  shadowMap,
  type LayoutType,
  type Testimonial,
  type WidgetConfig,
} from "@/lib/widget";

type Props = {
  type: LayoutType | string;
  config: WidgetConfig;
  testimonials: Testimonial[];
  /** Forces a narrower rendering (tablet/mobile preview). */
  viewportWidth?: number | undefined;
  showBranding?: boolean | undefined;
};

function Stars({ rating, config }: { rating: number; config: WidgetConfig }) {
  if (!config.rating.show) return null;
  return (
    <div className="flex shrink-0 items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={config.rating.size}
          style={{
            color: i <= rating ? config.colors.star : config.colors.border,
            fill: i <= rating ? config.colors.star : "transparent",
          }}
        />
      ))}
    </div>
  );
}

function Person({ t, config }: { t: Testimonial; config: WidgetConfig }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {config.avatar.show && (
        <div
          className="flex shrink-0 items-center justify-center overflow-hidden"
          style={{
            width: config.avatar.size,
            height: config.avatar.size,
            borderRadius: avatarRadius(config.avatar.shape),
            background: `${config.colors.accent}1f`,
            color: config.colors.accent,
            fontWeight: 600,
            fontSize: Math.max(11, config.avatar.size / 3),
          }}
        >
          {t.customer_avatar ? (
            <img
              src={t.customer_avatar}
              alt={t.customer_name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            initials(t.customer_name)
          )}
        </div>
      )}
      <div className="min-w-0">
        <div
          className="truncate"
          style={{
            color: config.colors.text,
            fontSize: config.typography.nameSize,
            fontWeight: 600,
          }}
        >
          {t.customer_name}
        </div>
        {(t.job_title || t.company_name) && (
          <div
            className="truncate"
            style={{ color: config.colors.secondaryText, fontSize: config.typography.companySize }}
          >
            {[t.job_title, t.company_name].filter(Boolean).join(" · ")}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({
  t,
  config,
  variant = "card",
}: {
  t: Testimonial;
  config: WidgetConfig;
  variant?: "card" | "plain";
}) {
  const body = (
    <>
      {config.rating.position === "top" && <Stars rating={t.rating} config={config} />}
      <p
        style={{
          color: config.colors.text,
          fontSize: config.typography.contentSize,
          lineHeight: config.typography.lineHeight,
          fontWeight: config.typography.fontWeight,
          margin: 0,
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {t.content}
      </p>
      <div
        className="flex min-w-0 flex-wrap items-center justify-between gap-3"
        style={{ marginTop: "auto", paddingTop: 4 }}
      >
        <Person t={t} config={config} />
        {config.rating.position === "bottom" && <Stars rating={t.rating} config={config} />}
      </div>
    </>
  );

  if (variant === "plain") {
    return (
      <div
        className="flex min-w-0 flex-col"
        style={{
          gap: 12,
          paddingBottom: config.card.padding * 0.7,
          borderBottom: `${config.card.borderWidth}px solid ${config.colors.border}`,
        }}
      >
        {body}
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-w-0 flex-col"
      style={{
        gap: 12,
        background: config.colors.card,
        border: `${config.card.borderWidth}px solid ${config.colors.border}`,
        borderRadius: config.card.radius,
        padding: config.card.padding,
        boxShadow: shadowMap[config.card.shadow],
      }}
    >
      {body}
    </div>
  );
}

function DotButton({
  active,
  label,
  onClick,
  config,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  config: WidgetConfig;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        width: active ? 20 : 8,
        height: 8,
        borderRadius: 9999,
        background: active ? config.colors.accent : config.colors.border,
        transition: "all .2s ease",
      }}
    />
  );
}

function ArrowButton({
  label,
  direction,
  onClick,
  config,
}: {
  label: string;
  direction: "prev" | "next";
  onClick: () => void;
  config: WidgetConfig;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        display: "grid",
        placeItems: "center",
        width: 36,
        height: 36,
        borderRadius: 9999,
        background: config.colors.card,
        border: `1px solid ${config.colors.border}`,
        color: config.colors.text,
      }}
    >
      <Icon size={18} />
    </button>
  );
}

function PoweredBy({ config }: { config: WidgetConfig }) {
  return (
    <a
      href="https://testimonially.lovable.app"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        maxWidth: "100%",
        alignItems: "center",
        gap: 5,
        marginTop: 18,
        color: config.colors.secondaryText,
        fontSize: 12,
        lineHeight: 1.2,
        textDecoration: "none",
      }}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        Powered by
      </span>
      <strong style={{ color: config.colors.accent, fontWeight: 800 }}>Testimonially</strong>
    </a>
  );
}

function compactConfig(config: WidgetConfig, compact: boolean): WidgetConfig {
  if (!compact) return config;
  return {
    ...config,
    typography: {
      ...config.typography,
      contentSize: Math.min(config.typography.contentSize, 14),
      nameSize: Math.min(config.typography.nameSize, 14),
      companySize: Math.min(config.typography.companySize, 12),
    },
    card: {
      ...config.card,
      padding: Math.min(config.card.padding, 16),
      spacing: Math.min(config.card.spacing, 14),
    },
    avatar: { ...config.avatar, size: Math.min(config.avatar.size, 36) },
    rating: { ...config.rating, size: Math.min(config.rating.size, 14) },
    layout: {
      ...config.layout,
      gap: Math.min(config.layout.gap, 14),
      padding: Math.min(config.layout.padding, 16),
    },
  };
}

export function TestimonialWidget({
  type,
  config,
  testimonials,
  viewportWidth,
  showBranding = false,
}: Props) {
  const [index, setIndex] = useState(0);
  const [measuredWidth, setMeasuredWidth] = useState<number | undefined>(viewportWidth);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const count = testimonials.length;
  const effectiveWidth = viewportWidth ?? measuredWidth;
  const compact = (effectiveWidth ?? 900) < 520;
  const displayConfig = useMemo(() => compactConfig(config, compact), [compact, config]);

  useEffect(() => {
    if (viewportWidth || typeof ResizeObserver === "undefined") return;
    const node = wrapperRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = entry?.contentRect.width;
      if (nextWidth) setMeasuredWidth(nextWidth);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [viewportWidth]);

  const columns = useMemo(() => {
    const base = Math.max(1, Math.min(4, displayConfig.layout.columns));
    if (!effectiveWidth) return base;
    if (effectiveWidth < 700) return 1;
    if (effectiveWidth < 1024) return Math.min(2, base);
    return base;
  }, [displayConfig.layout.columns, effectiveWidth]);

  const cycleLength = useMemo(() => {
    if (type === "multicarousel") {
      const rows = Math.max(1, Math.min(3, displayConfig.carousel.rows));
      return Math.max(1, Math.ceil(count / (columns * rows)));
    }
    return count;
  }, [type, columns, displayConfig.carousel.rows, count]);

  useEffect(() => {
    if (
      (type !== "carousel" && type !== "multicarousel" && type !== "toast") ||
      !displayConfig.carousel.autoplay ||
      cycleLength < 2
    ) {
      return;
    }
    const id = setInterval(
      () => setIndex((i) => (i + 1) % cycleLength),
      Math.max(1000, displayConfig.carousel.speed),
    );
    return () => clearInterval(id);
  }, [type, displayConfig.carousel.autoplay, displayConfig.carousel.speed, cycleLength]);

  useEffect(() => {
    if (index > cycleLength - 1) setIndex(0);
  }, [cycleLength, index]);

  const wrapperStyle: React.CSSProperties = {
    background: displayConfig.colors.background,
    fontFamily: fontStack(displayConfig.typography.fontFamily),
    padding: displayConfig.layout.padding,
    width: "100%",
    boxSizing: "border-box",
    overflowX: "hidden",
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: displayConfig.layout.maxWidth,
    marginInline: "auto",
    textAlign: displayConfig.layout.align === "center" ? "center" : "left",
  };

  if (count === 0) {
    return (
      <div ref={wrapperRef} style={wrapperStyle}>
        <div
          style={{
            ...innerStyle,
            color: displayConfig.colors.secondaryText,
            fontSize: 14,
            textAlign: "center",
            padding: compact ? 20 : 32,
            border: `1px dashed ${displayConfig.colors.border}`,
            borderRadius: displayConfig.card.radius,
            boxSizing: "border-box",
          }}
        >
          No testimonials selected yet.
        </div>
      </div>
    );
  }

  let content: React.ReactNode = null;

  if (type === "grid" || type === "minimal") {
    content = (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: displayConfig.layout.gap,
        }}
      >
        {testimonials.map((t) => (
          <Card key={t.id} t={t} config={displayConfig} variant={type === "minimal" ? "plain" : "card"} />
        ))}
      </div>
    );
  } else if (type === "masonry") {
    content = (
      <div style={{ columnCount: columns, columnGap: displayConfig.layout.gap }}>
        {testimonials.map((t) => (
          <div key={t.id} style={{ breakInside: "avoid", marginBottom: displayConfig.card.spacing }}>
            <Card t={t} config={displayConfig} />
          </div>
        ))}
      </div>
    );
  } else if (type === "list") {
    content = (
      <div style={{ display: "flex", flexDirection: "column", gap: displayConfig.card.spacing }}>
        {testimonials.map((t) => (
          <Card key={t.id} t={t} config={displayConfig} />
        ))}
      </div>
    );
  } else if (type === "featured") {
    const t = testimonials[index] ?? testimonials[0];
    if (t) {
      content = (
        <div
          style={{
            background: config.colors.card,
            border: `${displayConfig.card.borderWidth}px solid ${displayConfig.colors.border}`,
            borderRadius: displayConfig.card.radius,
            padding: displayConfig.card.padding * (compact ? 1.1 : 1.6),
            boxShadow: shadowMap[displayConfig.card.shadow],
            display: "flex",
            minWidth: 0,
            flexDirection: "column",
            gap: compact ? 14 : 20,
            alignItems: displayConfig.layout.align === "center" ? "center" : "flex-start",
          }}
        >
          <Quote size={compact ? 24 : 32} style={{ color: displayConfig.colors.accent }} />
          <Stars rating={t.rating} config={displayConfig} />
          <p
            style={{
              color: displayConfig.colors.text,
              fontSize: displayConfig.typography.contentSize * (compact ? 1.2 : 1.6),
              lineHeight: displayConfig.typography.lineHeight,
              fontWeight: 500,
              margin: 0,
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {t.content}
          </p>
          <Person t={t} config={displayConfig} />
          {count > 1 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {testimonials.map((item, i) => (
                <DotButton
                  key={item.id}
                  active={i === index}
                  label={`Show testimonial ${i + 1}`}
                  onClick={() => setIndex(i)}
                  config={displayConfig}
                />
              ))}
            </div>
          )}
        </div>
      );
    }
  } else if (type === "carousel") {
    const perView = columns;
    content = (
      <div style={{ position: "relative", minWidth: 0 }}>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              gap: displayConfig.layout.gap,
              transform: `translateX(calc(-${index} * (100% + ${displayConfig.layout.gap}px) / ${perView}))`,
              transition: "transform .5s cubic-bezier(.22,.61,.36,1)",
            }}
          >
            {testimonials.map((t) => (
              <div
                key={t.id}
                style={{
                  flex: `0 0 calc((100% - ${(perView - 1) * displayConfig.layout.gap}px) / ${perView})`,
                  minWidth: 0,
                }}
              >
                <Card t={t} config={displayConfig} />
              </div>
            ))}
          </div>
        </div>
        {displayConfig.carousel.arrows && count > perView && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <ArrowButton
              label="Previous"
              direction="prev"
              onClick={() => setIndex((i) => (i - 1 + count) % count)}
              config={displayConfig}
            />
            <ArrowButton
              label="Next"
              direction="next"
              onClick={() => setIndex((i) => (i + 1) % count)}
              config={displayConfig}
            />
          </div>
        )}
        {displayConfig.carousel.dots && count > 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 16 }}>
            {testimonials.map((t, i) => (
              <DotButton
                key={t.id}
                active={i === index}
                label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                config={displayConfig}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const average = count ? testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / count : 0;

  if (type === "wall") {
    content = (
      <div>
        {displayConfig.wall.showHeader && (
          <div
            style={{
              marginBottom: Math.max(compact ? 16 : 24, displayConfig.layout.padding),
              textAlign: displayConfig.layout.align === "center" ? "center" : "left",
            }}
          >
            <h2
              style={{
                color: displayConfig.colors.text,
                fontFamily: fontStack(displayConfig.typography.fontFamily),
                fontSize: Math.max(compact ? 20 : 24, displayConfig.typography.contentSize * (compact ? 1.55 : 2.1)),
                fontWeight: 700,
                lineHeight: 1.15,
                margin: 0,
                overflowWrap: "anywhere",
              }}
            >
              {displayConfig.wall.headline}
            </h2>
            {displayConfig.wall.showSummary && displayConfig.rating.show && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 10,
                  justifyContent: displayConfig.layout.align === "center" ? "center" : "flex-start",
                  marginTop: 12,
                }}
              >
                <Stars rating={Math.round(average)} config={displayConfig} />
                <span style={{ color: displayConfig.colors.secondaryText, fontSize: compact ? 12 : 14 }}>
                  {average.toFixed(1)} average from {count} review{count === 1 ? "" : "s"}
                </span>
              </div>
            )}
          </div>
        )}
        <div style={{ columnCount: columns, columnGap: displayConfig.layout.gap }}>
          {testimonials.map((t) => (
            <div key={t.id} style={{ breakInside: "avoid", marginBottom: displayConfig.layout.gap }}>
              <Card t={t} config={displayConfig} />
            </div>
          ))}
        </div>
      </div>
    );
  } else if (type === "multicarousel") {
    const perView = Math.max(1, columns);
    const rows = Math.max(1, Math.min(3, displayConfig.carousel.rows));
    const perSlide = perView * rows;
    const slides: Testimonial[][] = [];
    for (let i = 0; i < count; i += perSlide) slides.push(testimonials.slice(i, i + perSlide));
    const slideCount = slides.length;
    const slideIndex = Math.min(index, slideCount - 1);
    content = (
      <div style={{ position: "relative", minWidth: 0 }}>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              gap: displayConfig.layout.gap,
              transform: `translateX(calc(-${slideIndex} * (100% + ${displayConfig.layout.gap}px)))`,
              transition: "transform .5s cubic-bezier(.22,.61,.36,1)",
            }}
          >
            {slides.map((slide, si) => (
              <div key={si} style={{ flex: "0 0 100%", minWidth: 0 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))`,
                    gap: displayConfig.layout.gap,
                  }}
                >
                  {slide.map((t) => (
                    <Card key={t.id} t={t} config={displayConfig} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {displayConfig.carousel.arrows && slideCount > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <ArrowButton
              label="Previous"
              direction="prev"
              onClick={() => setIndex((i) => (i - 1 + slideCount) % slideCount)}
              config={displayConfig}
            />
            <ArrowButton
              label="Next"
              direction="next"
              onClick={() => setIndex((i) => (i + 1) % slideCount)}
              config={displayConfig}
            />
          </div>
        )}
        {displayConfig.carousel.dots && slideCount > 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 16 }}>
            {slides.map((_, si) => (
              <DotButton
                key={si}
                active={si === slideIndex}
                label={`Go to slide ${si + 1}`}
                onClick={() => setIndex(si)}
                config={displayConfig}
              />
            ))}
          </div>
        )}
      </div>
    );
  } else if (type === "marquee") {
    const rows = Math.max(1, Math.min(2, displayConfig.marquee.rows));
    const duration = Math.max(10, displayConfig.marquee.speed);
    const cardWidth = Math.max(220, Math.min(320, (effectiveWidth ?? 360) - displayConfig.layout.padding * 2));
    const chunks: Testimonial[][] = [];
    for (let i = 0; i < rows; i++) chunks.push(testimonials.filter((_, ti) => ti % rows === i));
    content = (
      <div>
        <style>{`.testimonially-marquee-pause:hover .testimonially-marquee-track { animation-play-state: paused; } @keyframes testimonially-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        <div
          className={displayConfig.marquee.pauseOnHover ? "testimonially-marquee-pause" : undefined}
          style={{ display: "flex", flexDirection: "column", gap: displayConfig.layout.gap }}
        >
          {chunks.map((row, ri) => (
            <div key={ri} style={{ overflow: "hidden" }}>
              <div
                className="testimonially-marquee-track"
                style={{
                  display: "flex",
                  gap: displayConfig.layout.gap,
                  width: "max-content",
                  animation: `testimonially-marquee ${duration}s linear infinite`,
                  animationDirection: ri % 2 === 1 ? "reverse" : "normal",
                }}
              >
                {[...row, ...row].map((t, ci) => (
                  <div key={`${t.id}-${ci}`} style={{ flex: `0 0 ${cardWidth}px`, maxWidth: cardWidth }}>
                    <Card t={t} config={displayConfig} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (type === "badge") {
    content = (
      <div style={{ display: "flex", justifyContent: displayConfig.layout.align === "center" ? "center" : "flex-start" }}>
        <div
          style={{
            display: "inline-flex",
            maxWidth: "100%",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
            background: displayConfig.colors.card,
            border: `${displayConfig.card.borderWidth}px solid ${displayConfig.colors.border}`,
            borderRadius: 9999,
            padding: compact ? "9px 13px" : "10px 18px",
            boxShadow: shadowMap[displayConfig.card.shadow],
          }}
        >
          {displayConfig.badge.showLabel && (
            <span style={{ color: displayConfig.colors.text, fontWeight: 700, fontSize: Math.max(13, displayConfig.typography.contentSize) }}>
              {average.toFixed(1)} / 5
            </span>
          )}
          <Stars rating={Math.round(average)} config={displayConfig} />
          <span style={{ color: displayConfig.colors.secondaryText, fontSize: 13 }}>
            {count} review{count === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    );
  } else if (type === "toast") {
    const t = testimonials[index] ?? testimonials[0];
    if (t) {
      const pos = displayConfig.toast.position;
      const corner: React.CSSProperties =
        pos === "bottom-right"
          ? { right: 16, bottom: 16 }
          : pos === "bottom-left"
            ? { left: 16, bottom: 16 }
            : pos === "top-right"
              ? { right: 16, top: 16 }
              : { left: 16, top: 16 };
      content = (
        <div style={{ position: "relative", minHeight: compact ? 240 : 300, width: "100%" }}>
          <div
            style={{
              position: "absolute",
              ...corner,
              width: Math.min(340, Math.max(240, (effectiveWidth ?? 360) - 32)),
              maxWidth: "calc(100% - 32px)",
              background: displayConfig.colors.card,
              border: `${displayConfig.card.borderWidth}px solid ${displayConfig.colors.border}`,
              borderRadius: displayConfig.card.radius,
              padding: compact ? 14 : 18,
              boxShadow: shadowMap.lg,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              transition: "opacity .4s ease",
            }}
          >
            <Stars rating={t.rating} config={displayConfig} />
            <p
              style={{
                color: displayConfig.colors.text,
                fontSize: displayConfig.typography.contentSize,
                lineHeight: displayConfig.typography.lineHeight,
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {t.content}
            </p>
            <div className="flex min-w-0 items-center gap-2.5" style={{ marginTop: 2 }}>
              {displayConfig.toast.showAvatar && displayConfig.avatar.show && (
                <div
                  className="flex shrink-0 items-center justify-center overflow-hidden"
                  style={{
                    width: displayConfig.avatar.size,
                    height: displayConfig.avatar.size,
                    borderRadius: avatarRadius(displayConfig.avatar.shape),
                    background: `${displayConfig.colors.accent}1f`,
                    color: displayConfig.colors.accent,
                    fontWeight: 600,
                    fontSize: Math.max(11, displayConfig.avatar.size / 3),
                  }}
                >
                  {t.customer_avatar ? (
                    <img src={t.customer_avatar} alt={t.customer_name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    initials(t.customer_name)
                  )}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate" style={{ color: displayConfig.colors.text, fontSize: displayConfig.typography.nameSize, fontWeight: 600 }}>
                  {t.customer_name}
                </div>
                {(t.job_title || t.company_name) && (
                  <div className="truncate" style={{ color: displayConfig.colors.secondaryText, fontSize: displayConfig.typography.companySize }}>
                    {[t.job_title, t.company_name].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div ref={wrapperRef} style={wrapperStyle}>
      <div style={innerStyle}>
        {content}
        {showBranding && <PoweredBy config={displayConfig} />}
      </div>
    </div>
  );
}
