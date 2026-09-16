import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg bg-primary font-display text-sm font-extrabold text-primary-foreground shadow-glow",
        className,
      )}
      aria-hidden
    >
      T
    </span>
  );
}

export function Logo({
  className,
  to = "/",
  showWordmark = true,
}: {
  className?: string;
  to?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link to={to} className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWordmark && (
        <span className="font-display text-[17px] font-extrabold tracking-tight text-foreground">
          Testimonially
        </span>
      )}
    </Link>
  );
}
