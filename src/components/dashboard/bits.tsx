import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const published = status === "published";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        published ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
      )}
    >
      <span className={cn("size-1.5 rounded-full", published ? "bg-success" : "bg-muted-foreground")} />
      {published ? "Published" : "Draft"}
    </span>
  );
}

export function Rating({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn("size-3.5", i <= value ? "fill-warning text-warning" : "text-border")}
        />
      ))}
    </span>
  );
}

export function RatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          className="rounded-md p-1 transition-transform hover:scale-110"
        >
          <Star
            className={cn("size-6", i <= value ? "fill-warning text-warning" : "text-border")}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">{value} of 5</span>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) {
  return (
    <div className="surface-card p-5 transition-shadow hover:shadow-lift">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      {loading ? (
        <div className="mt-4 h-8 w-16 animate-pulse rounded-md bg-muted" />
      ) : (
        <p className="mt-3 font-display text-3xl font-extrabold tracking-tight">{value}</p>
      )}
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
