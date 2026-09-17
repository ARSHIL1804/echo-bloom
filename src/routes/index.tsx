import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Globe,
  LayoutGrid,
  Menu,
  MessageSquareQuote,
  Palette,
  Rocket,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/marketing/Footer";
import { TestimonialWidget } from "@/components/widget/TestimonialWidget";
import { demoTestimonials } from "@/lib/demo-data";
import { defaultConfig, mergeConfig } from "@/lib/widget";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Testimonially — Turn customer feedback into social proof" },
      {
        name: "description",
        content:
          "Collect, manage, customize and showcase your best customer testimonials anywhere on your website. Every layout gets a public URL and embed code.",
      },
      {
        property: "og:title",
        content: "Testimonially — Turn customer feedback into social proof",
      },
      {
        property: "og:description",
        content:
          "Collect, manage, customize and showcase your best customer testimonials anywhere on your website.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

type AccentTone = "sky" | "teal" | "lime" | "indigo";

const toneClass: Record<AccentTone, string> = {
  sky: "bg-sky-soft text-sky",
  teal: "bg-teal-soft text-teal",
  lime: "bg-lime-soft text-lime",
  indigo: "bg-primary-soft text-primary",
};

const features: {
  icon: React.ComponentType<{ className?: string }>;
  tone: AccentTone;
  title: string;
  body: string;
}[] = [
  {
    icon: MessageSquareQuote,
    tone: "sky",
    title: "Collect Testimonials",
    body: "Add and manage customer testimonials from one centralized dashboard.",
  },
  {
    icon: LayoutGrid,
    tone: "teal",
    title: "Beautiful Layouts",
    body: "Choose from multiple professionally designed testimonial layouts.",
  },
  {
    icon: Palette,
    tone: "lime",
    title: "Full Customization",
    body: "Customize colors, fonts, typography, spacing, borders, and other visual properties.",
  },
  {
    icon: Globe,
    tone: "indigo",
    title: "Instant Publishing",
    body: "Every layout gets its own public URL that can be used directly on a website.",
  },
  {
    icon: Sparkles,
    tone: "sky",
    title: "Multiple Layouts",
    body: "Create different testimonial widgets for different websites, pages, or campaigns.",
  },
  {
    icon: Settings2,
    tone: "teal",
    title: "Simple Management",
    body: "Edit, delete, reorder, and control which testimonials appear in each layout.",
  },
];

const steps = [
  {
    n: "01",
    tone: "sky",
    title: "Add testimonials",
    body: "Add your customer feedback and social proof.",
  },
  {
    n: "02",
    tone: "teal",
    title: "Design your widget",
    body: "Select a layout and customize its appearance.",
  },
  {
    n: "03",
    tone: "lime",
    title: "Publish anywhere",
    body: "Copy your public URL and use the testimonial widget on your website.",
  },
] as const;

const showcase = [
  { type: "grid", tone: "sky", name: "Grid", body: "Multiple testimonial cards displayed in a responsive grid." },
  {
    type: "carousel",
    tone: "teal",
    name: "Carousel",
    body: "Testimonials displayed inside a horizontally scrolling carousel.",
  },
  {
    type: "featured",
    tone: "lime",
    name: "Single Featured",
    body: "One large highlighted testimonial.",
  },
  { type: "masonry", tone: "indigo", name: "Masonry", body: "Pinterest-style testimonial layout." },
  {
    type: "minimal",
    tone: "sky",
    name: "Compact List",
    body: "Simple testimonial list suitable for sidebars or product pages.",
  },
  {
    type: "wall",
    tone: "teal",
    name: "Wall of Love",
    body: "A public wall page of all your best testimonials, with a branded header.",
  },
  {
    type: "multicarousel",
    tone: "lime",
    name: "Multi-row Carousel",
    body: "A carousel showing several rows of cards in every slide.",
  },
  {
    type: "marquee",
    tone: "indigo",
    name: "Marquee",
    body: "Endless auto-scrolling rows of testimonials — great for heroes.",
  },
  {
    type: "badge",
    tone: "sky",
    name: "Rating Badge",
    body: "A compact average-rating badge for footers, headers and pricing pages.",
  },
  {
    type: "toast",
    tone: "teal",
    name: "Floating Toast",
    body: "A small popup card in the corner that cycles through testimonials.",
  },
] as const;

const plans = [
  {
    name: "Free",
    price: "$0",
    note: "For users trying the product",
    features: [
      "20 testimonials",
      "2 published layouts",
      "1 brand",
      "1 collection form",
      "All basic layouts",
      "Basic customization",
      "Public widget URL",
      "Embed code",
      "Testimonially branding",
      "Community support",
    ],
  },
  {
    name: "Starter",
    price: "$9",
    note: "For indie hackers, creators and small businesses",
    features: [
      "100 testimonials",
      "10 layouts",
      "1 brand",
      "3 collection forms",
      "All layouts",
      "Full color customization",
      "Typography customization",
      "Custom fonts",
      "Remove Testimonially branding",
      "Custom widget URL",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    note: "For SaaS companies and growing businesses",
    highlight: true,
    features: [
      "Unlimited testimonials",
      "Unlimited layouts",
      "3 brands",
      "Unlimited collection forms",
      "Advanced customization",
      "Advanced widget styling",
      "Custom domain",
      "Analytics",
      "Multiple embed options",
      "API access",
      "Webhooks",
      "Priority support",
      "Remove branding",
    ],
  },
  {
    name: "Agency",
    price: "$49",
    note: "For agencies & freelancers",
    features: [
      "Unlimited testimonials",
      "Unlimited layouts",
      "10 brands",
      "Unlimited collection forms",
      "Unlimited widgets",
      "Custom domains",
      "White-label",
      "API",
      "Webhooks",
      "Client workspaces",
      "Team members",
      "Advanced analytics",
      "Priority support",
    ],
  },
];

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild className="rounded-xl">
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
        <button
          className="grid size-10 place-items-center rounded-lg border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>
      {open && (
        <div className="border-t bg-card md:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Landing() {
  const heroConfig = mergeConfig({
    card: { ...defaultConfig.card, padding: 20, radius: 14, shadow: "md" },
    layout: { ...defaultConfig.layout, columns: 1, padding: 0, gap: 14, maxWidth: 460 },
    typography: { ...defaultConfig.typography, contentSize: 14 },
    colors: { ...defaultConfig.colors, background: "transparent" },
  });

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute -top-40 left-1/3 size-[38rem] -translate-x-1/2 rounded-full bg-sky-soft blur-3xl" />
        <div className="pointer-events-none absolute -top-24 left-2/3 size-[30rem] -translate-x-1/2 rounded-full bg-primary-soft blur-3xl" />
        <div className="container-page relative grid items-center gap-14 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-transparent bg-sky-soft px-3 py-1.5 text-xs font-medium text-sky">
              <Sparkles className="size-3.5" />
              Collect testimonials. Build trust. Convert more.
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
              Turn customer feedback into beautiful social proof.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Collect, manage, customize, and showcase your best customer testimonials anywhere on
              your website.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="rounded-xl">
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-xl">
                <a href="#showcase">View Demo</a>
              </Button>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              No credit card required · Free plan forever
            </p>
          </div>

          <div className="relative">
            <div className="surface-card p-5 shadow-lift">
              <div className="mb-4 flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-destructive/70" />
                <span className="size-2.5 rounded-full bg-warning/70" />
                <span className="size-2.5 rounded-full bg-success/70" />
                <span className="ml-2 truncate text-xs text-muted-foreground">
                  /widget/abc123 — live
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TestimonialWidget
                  type="grid"
                  config={heroConfig}
                  testimonials={demoTestimonials.slice(0, 2)}
                />
                <div className="flex flex-col gap-4">
                  <TestimonialWidget
                    type="featured"
                    config={mergeConfig({
                      ...heroConfig,
                      typography: { ...heroConfig.typography, contentSize: 13 },
                      layout: { ...heroConfig.layout, padding: 0 },
                    })}
                    testimonials={[demoTestimonials[4]!]}
                  />
                  <TestimonialWidget
                    type="minimal"
                    config={mergeConfig({
                      ...heroConfig,
                      layout: { ...heroConfig.layout, padding: 0, columns: 1 },
                    })}
                    testimonials={[demoTestimonials[5]!]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-sky">Features</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Everything you need to ship social proof
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="surface-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div
                  className={`grid size-10 place-items-center rounded-xl ${toneClass[f.tone]}`}
                >
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-b bg-card py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-teal">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              From feedback to live widget in minutes
            </h2>
          </div>
          <div className="relative mt-12 grid gap-5 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-12 hidden border-t border-dashed md:block" />
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-xl border bg-background p-6">
                <span
                  className={`grid size-10 place-items-center rounded-xl font-display text-sm font-bold ${toneClass[s.tone]}`}
                >
                  {s.n}
                </span>
                <h3 className="mt-5 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section id="showcase" className="border-b py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-lime">Layouts</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              A widget style for every page
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every layout is fully customizable and responsive out of the box.
            </p>
          </div>
          <div className="mt-12 space-y-6">
            {showcase.map((s) => (
              <div key={s.name} className="surface-card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-6 py-4">
                  <div>
                    <h3 className="text-sm font-semibold">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.body}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${toneClass[s.tone]}`}
                  >
                    {s.type}
                  </span>
                </div>
                <div className="bg-background">
                  <TestimonialWidget
                    type={s.type}
                    config={mergeConfig({
                      layout: {
                        ...defaultConfig.layout,
                        columns: s.type === "featured" ? 1 : 3,
                        maxWidth: 1000,
                      },
                    })}
                    testimonials={demoTestimonials.slice(0, s.type === "featured" ? 3 : 6)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Landing testimonials */}
      <section className="border-b bg-card py-20">
        <div className="container-page">
          <h2 className="max-w-2xl font-display text-3xl font-bold sm:text-4xl">
            Loved by teams building great products
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {demoTestimonials.map((t) => (
              <figure key={t.id} className="rounded-xl border bg-background p-6">
                <div className="flex gap-0.5 text-warning">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Sparkles key={i} className="size-3.5" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-foreground">
                  “{t.content}”
                </blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{t.customer_name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {t.job_title} · {t.company_name}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">Pricing</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Pricing that grows with you
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start free. Upgrade when your social proof does.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.highlight
                    ? "relative rounded-2xl border-2 border-primary bg-card p-7 shadow-lift"
                    : "surface-card p-7"
                }
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.note}</p>
                <p className="mt-5 font-display text-4xl font-extrabold">
                  {plan.price}
                  <span className="text-base font-medium text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={plan.highlight ? "default" : "outline"}
                  className="mt-7 w-full rounded-xl"
                >
                  <Link to="/register">Get started</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-14 text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(55% 70% at 50% 0%, color-mix(in oklab, var(--sky) 28%, transparent), transparent 70%), radial-gradient(45% 60% at 85% 100%, color-mix(in oklab, var(--teal) 22%, transparent), transparent 70%)",
              }}
            />
            <div className="relative">
              <Rocket className="mx-auto size-8 text-background" />
              <h2 className="mt-6 font-display text-3xl font-bold text-background sm:text-4xl">
                Start building trust today
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-background/70">
                Create your first testimonial widget in under five minutes.
              </p>
              <Button size="lg" variant="secondary" asChild className="mt-8 rounded-xl">
                <Link to="/register">
                  Get Started Free <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
