import { useEffect, useMemo, useState } from "react";
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
};

function Stars({ rating, config }: { rating: number; config: WidgetConfig }) {
  if (!config.rating.show) return null;
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
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
    <div className="flex items-center gap-3">
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
        }}
      >
        {t.content}
      </p>
      <div
        className="flex items-center justify-between gap-3"
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
        className="flex flex-col"
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
      className="flex h-full flex-col"
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

export function TestimonialWidget({ type, config, testimonials, viewportWidth }: Props) {
  const [index, setIndex] = useState(0);
  const count = testimonials.length;

  const columns = useMemo(() => {
    const base = Math.max(1, Math.min(4, config.layout.columns));
    if (!viewportWidth) return base;
    if (viewportWidth < 640) return 1;
    if (viewportWidth < 1024) return Math.min(2, base);
    return base;
  }, [config.layout.columns, viewportWidth]);

  const cycleLength = useMemo(() => {
    if (type === "multicarousel") {
      const perView = Math.max(1, Math.min(4, config.layout.columns));
      const rows = Math.max(1, Math.min(3, config.carousel.rows));
      return Math.max(1, Math.ceil(count / (perView * rows)));
    }
    return count;
  }, [type, config.layout.columns, config.carousel.rows, count]);

  useEffect(() => {
    if ((type !== "carousel" && type !== "toast") || !config.carousel.autoplay || cycleLength < 2)
      return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % cycleLength),
      Math.max(1000, config.carousel.speed),
    );
    return () => clearInterval(id);
  }, [type, config.carousel.autoplay, config.carousel.speed, cycleLength]);

  useEffect(() => {
    if (index > cycleLength - 1) setIndex(0);
  }, [cycleLength, index]);

  const wrapperStyle: React.CSSProperties = {
    background: config.colors.background,
    fontFamily: fontStack(config.typography.fontFamily),
    padding: config.layout.padding,
    width: "100%",
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: config.layout.maxWidth,
    marginInline: "auto",
    textAlign: config.layout.align === "center" ? "center" : "left",
  };

  if (count === 0) {
    return (
      <div style={wrapperStyle}>
        <div
          style={{
            ...innerStyle,
            color: config.colors.secondaryText,
            fontSize: 14,
            textAlign: "center",
            padding: 32,
            border: `1px dashed ${config.colors.border}`,
            borderRadius: config.card.radius,
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
          gap: config.layout.gap,
        }}
      >
        {testimonials.map((t) => (
          <Card key={t.id} t={t} config={config} variant={type === "minimal" ? "plain" : "card"} />
        ))}
      </div>
    );
  } else if (type === "masonry") {
    content = (
      <div
        style={{
          columnCount: columns,
          columnGap: config.layout.gap,
        }}
      >
        {testimonials.map((t) => (
          <div key={t.id} style={{ breakInside: "avoid", marginBottom: config.card.spacing }}>
            <Card t={t} config={config} />
          </div>
        ))}
      </div>
    );
  } else if (type === "list") {
    content = (
      <div style={{ display: "flex", flexDirection: "column", gap: config.card.spacing }}>
        {testimonials.map((t) => (
          <Card key={t.id} t={t} config={config} />
        ))}
      </div>
    );
  } else if (type === "featured") {
    const t = (testimonials[index] ?? testimonials[0])!;
    content = (
      <div
        style={{
          background: config.colors.card,
          border: `${config.card.borderWidth}px solid ${config.colors.border}`,
          borderRadius: config.card.radius,
          padding: config.card.padding * 1.6,
          boxShadow: shadowMap[config.card.shadow],
          display: "flex",
          flexDirection: "column",
          gap: 20,
          alignItems: config.layout.align === "center" ? "center" : "flex-start",
        }}
      >
        <Quote size={32} style={{ color: config.colors.accent }} />
        <Stars rating={t.rating} config={config} />
        <p
          style={{
            color: config.colors.text,
            fontSize: config.typography.contentSize * 1.6,
            lineHeight: config.typography.lineHeight,
            fontWeight: 500,
            margin: 0,
          }}
        >
          {t.content}
        </p>
        <Person t={t} config={config} />
        {count > 1 && (
          <div style={{ display: "flex", gap: 8 }}>
            {testimonials.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => setIndex(i)}
                style={{
                  width: i === index ? 20 : 8,
                  height: 8,
                  borderRadius: 9999,
                  background: i === index ? config.colors.accent : config.colors.border,
                  transition: "all .2s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  } else if (type === "carousel") {
    const perView = columns;
    content = (
      <div style={{ position: "relative" }}>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              gap: config.layout.gap,
              transform: `translateX(calc(-${index} * (100% + ${config.layout.gap}px) / ${perView}))`,
              transition: "transform .5s cubic-bezier(.22,.61,.36,1)",
            }}
          >
            {testimonials.map((t) => (
              <div
                key={t.id}
                style={{
                  flex: `0 0 calc((100% - ${(perView - 1) * config.layout.gap}px) / ${perView})`,
                }}
              >
                <Card t={t} config={config} />
              </div>
            ))}
          </div>
        </div>
        {config.carousel.arrows && count > perView && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => setIndex((i) => (i - 1 + count) % count)}
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
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => setIndex((i) => (i + 1) % count)}
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
              <ChevronRight size={18} />
            </button>
          </div>
        )}
        {config.carousel.dots && count > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                style={{
                  width: i === index ? 20 : 8,
                  height: 8,
                  borderRadius: 9999,
                  background: i === index ? config.colors.accent : config.colors.border,
                  transition: "all .2s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const average = count
    ? testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / count
    : 0;

  if (type === "wall") {
    content = (
      <div>
        {config.wall.showHeader && (
          <div
            style={{
              marginBottom: Math.max(24, config.layout.padding),
              textAlign: config.layout.align === "center" ? "center" : "left",
            }}
          >
            <h2
              style={{
                color: config.colors.text,
                fontFamily: fontStack(config.typography.fontFamily),
                fontSize: Math.max(24, config.typography.contentSize * 2.1),
                fontWeight: 700,
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              {config.wall.headline}
            </h2>
            {config.wall.showSummary && config.rating.show && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  justifyContent: config.layout.align === "center" ? "center" : "flex-start",
                  marginTop: 12,
                }}
              >
                <Stars rating={Math.round(average)} config={config} />
                <span style={{ color: config.colors.secondaryText, fontSize: 14 }}>
                  {average.toFixed(1)} average from {count} review{count === 1 ? "" : "s"}
                </span>
              </div>
            )}
          </div>
        )}
        <div style={{ columnCount: columns, columnGap: config.layout.gap }}>
          {testimonials.map((t) => (
            <div key={t.id} style={{ breakInside: "avoid", marginBottom: config.layout.gap }}>
              <Card t={t} config={config} />
            </div>
          ))}
        </div>
      </div>
    );
  } else if (type === "multicarousel") {
    const perView = Math.max(1, columns);
    const rows = Math.max(1, Math.min(3, config.carousel.rows));
    const perSlide = perView * rows;
    const slides: Testimonial[][] = [];
    for (let i = 0; i < count; i += perSlide) slides.push(testimonials.slice(i, i + perSlide));
    const slideCount = slides.length;
    const slideIndex = Math.min(index, slideCount - 1);
    content = (
      <div style={{ position: "relative" }}>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              gap: config.layout.gap,
              transform: `translateX(calc(-${slideIndex} * (100% + ${config.layout.gap}px)))`,
              transition: "transform .5s cubic-bezier(.22,.61,.36,1)",
            }}
          >
            {slides.map((slide, si) => (
              <div key={si} style={{ flex: "0 0 100%", minWidth: 0 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))`,
                    gap: config.layout.gap,
                  }}
                >
                  {slide.map((t) => (
                    <Card key={t.id} t={t} config={config} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {config.carousel.arrows && slideCount > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => setIndex((i) => (i - 1 + slideCount) % slideCount)}
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
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => setIndex((i) => (i + 1) % slideCount)}
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
              <ChevronRight size={18} />
            </button>
          </div>
        )}
        {config.carousel.dots && slideCount > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
            {slides.map((_, si) => (
              <button
                key={si}
                type="button"
                aria-label={`Go to slide ${si + 1}`}
                onClick={() => setIndex(si)}
                style={{
                  width: si === slideIndex ? 20 : 8,
                  height: 8,
                  borderRadius: 9999,
                  background: si === slideIndex ? config.colors.accent : config.colors.border,
                  transition: "all .2s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  } else if (type === "marquee") {
    const rows = Math.max(1, Math.min(2, config.marquee.rows));
    const duration = Math.max(10, config.marquee.speed);
    const chunks: Testimonial[][] = [];
    for (let i = 0; i < rows; i++) {
      chunks.push(testimonials.filter((_, ti) => ti % rows === i));
    }
    content = (
      <div>
        <style>{`.testimonially-marquee-pause:hover .testimonially-marquee-track { animation-play-state: paused; } @keyframes testimonially-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        <div
          className={config.marquee.pauseOnHover ? "testimonially-marquee-pause" : undefined}
          style={{ display: "flex", flexDirection: "column", gap: config.layout.gap }}
        >
          {chunks.map((row, ri) => (
            <div key={ri} style={{ overflow: "hidden" }}>
              <div
                className="testimonially-marquee-track"
                style={{
                  display: "flex",
                  gap: config.layout.gap,
                  width: "max-content",
                  animation: `testimonially-marquee ${duration}s linear infinite`,
                  animationDirection: ri % 2 === 1 ? "reverse" : "normal",
                }}
              >
                {[...row, ...row].map((t, ci) => (
                  <div key={`${t.id}-${ci}`} style={{ flex: "0 0 320px", maxWidth: 320 }}>
                    <Card t={t} config={config} />
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
      <div
        style={{
          display: "flex",
          justifyContent: config.layout.align === "center" ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: config.colors.card,
            border: `${config.card.borderWidth}px solid ${config.colors.border}`,
            borderRadius: 9999,
            padding: "10px 18px",
            boxShadow: shadowMap[config.card.shadow],
          }}
        >
          {config.badge.showLabel && (
            <span
              style={{
                color: config.colors.text,
                fontWeight: 700,
                fontSize: Math.max(13, config.typography.contentSize),
              }}
            >
              {average.toFixed(1)} / 5
            </span>
          )}
          <Stars rating={Math.round(average)} config={config} />
          <span style={{ color: config.colors.secondaryText, fontSize: 13 }}>
            {count} review{count === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    );
  } else if (type === "toast") {
    const t = (testimonials[index] ?? testimonials[0])!;
    const pos = config.toast.position;
    const corner: React.CSSProperties =
      pos === "bottom-right"
        ? { right: 16, bottom: 16 }
        : pos === "bottom-left"
          ? { left: 16, bottom: 16 }
          : pos === "top-right"
            ? { right: 16, top: 16 }
            : { left: 16, top: 16 };
    content = (
      <div style={{ position: "relative", minHeight: 300, width: "100%" }}>
        <div
          style={{
            position: "absolute",
            ...corner,
            width: 340,
            maxWidth: "calc(100% - 32px)",
            background: config.colors.card,
            border: `${config.card.borderWidth}px solid ${config.colors.border}`,
            borderRadius: config.card.radius,
            padding: 18,
            boxShadow: shadowMap.lg,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            transition: "opacity .4s ease",
          }}
        >
          <Stars rating={t.rating} config={config} />
          <p
            style={{
              color: config.colors.text,
              fontSize: config.typography.contentSize,
              lineHeight: config.typography.lineHeight,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {t.content}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
            {config.toast.showAvatar && config.avatar.show && (
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
        </div>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <div style={innerStyle}>{content}</div>
    </div>
  );
}
