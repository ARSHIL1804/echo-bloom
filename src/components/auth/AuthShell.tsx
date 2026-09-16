import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Quote } from "lucide-react";
import { Logo } from "@/components/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
      </div>
      <div className="relative hidden overflow-hidden border-l bg-card lg:block">
        <div className="pointer-events-none absolute -right-20 top-1/4 size-[30rem] rounded-full bg-primary-soft blur-3xl" />
        <div className="relative flex h-full flex-col justify-center gap-6 px-14">
          <Quote className="size-10 text-primary" />
          <p className="font-display text-2xl font-bold leading-snug">
            “We shipped social proof across our whole marketing site in an afternoon.”
          </p>
          <p className="text-sm text-muted-foreground">Sarah Whitfield · Head of Growth, Northwind</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["124", "Testimonials"],
              ["6", "Layouts"],
              ["18%", "More conversion"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border bg-background p-4">
                <p className="font-display text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
