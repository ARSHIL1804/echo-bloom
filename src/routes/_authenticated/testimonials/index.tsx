import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Eye, MessageSquareQuote, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useDeleteTestimonial, useTestimonials } from "@/lib/data";
import { EmptyState, PageHeader } from "@/components/dashboard/DashboardShell";
import { Rating, SkeletonRows, StatusBadge } from "@/components/dashboard/bits";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Testimonial } from "@/lib/widget";

export const Route = createFileRoute("/_authenticated/testimonials/")({
  component: TestimonialsPage,
  head: () => ({
    meta: [
      { title: "Testimonials — Testimonially" },
      { name: "description", content: "Manage all of your customer testimonials in one place." },
      { property: "og:title", content: "Testimonials — Testimonially" },
      {
        property: "og:description",
        content: "Manage all of your customer testimonials in one place.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

const PAGE_SIZE = 8;

function TestimonialsPage() {
  const { user } = useAuth();
  const { data, isLoading } = useTestimonials(user?.id);
  const remove = useDeleteTestimonial();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [rating, setRating] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [preview, setPreview] = useState<Testimonial | null>(null);

  const filtered = useMemo(() => {
    let rows = [...(data ?? [])];
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((t) =>
        [t.customer_name, t.company_name, t.content, t.job_title]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q)),
      );
    }
    if (status !== "all") rows = rows.filter((t) => t.status === status);
    if (rating !== "all") rows = rows.filter((t) => t.rating === Number(rating));
    rows.sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "name") return a.customer_name.localeCompare(b.customer_name);
      const at = new Date(a.created_at ?? 0).getTime();
      const bt = new Date(b.created_at ?? 0).getTime();
      return sort === "oldest" ? at - bt : bt - at;
    });
    return rows;
  }, [data, search, status, rating, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials"
        subtitle="Manage all of your customer testimonials."
        action={
          <Button asChild className="rounded-xl">
            <Link to="/testimonials/new">
              <Plus className="size-4" /> Add Testimonial
            </Link>
          </Button>
        }
      />

      <div className="surface-card overflow-hidden">
        <div className="grid gap-3 border-b p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search testimonials"
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger>
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              {[5, 4, 3, 2, 1].map((r) => (
                <SelectItem key={r} value={String(r)}>
                  {r} star{r > 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="rating">Highest rating</SelectItem>
              <SelectItem value="name">Customer name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="p-5">
            <SkeletonRows rows={5} />
          </div>
        ) : (data ?? []).length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={MessageSquareQuote}
              title="No testimonials yet"
              body="Start collecting customer feedback and build your social proof."
              action={
                <Button asChild className="rounded-xl">
                  <Link to="/testimonials/new">Add Your First Testimonial</Link>
                </Button>
              }
            />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            No testimonials match your filters.
          </p>
        ) : (
          <>
            {/* Table on larger screens */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Testimonial</th>
                    <th className="px-5 py-3 font-medium">Company</th>
                    <th className="px-5 py-3 font-medium">Rating</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Created</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} className="border-t transition-colors hover:bg-muted/40">
                      <td className="px-5 py-3.5 font-medium">{t.customer_name}</td>
                      <td className="max-w-[280px] truncate px-5 py-3.5 text-muted-foreground">
                        {t.content}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{t.company_name || "—"}</td>
                      <td className="px-5 py-3.5">
                        <Rating value={t.rating} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {t.created_at ? format(new Date(t.created_at), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Preview" onClick={() => setPreview(t)}>
                            <Eye className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild title="Edit">
                            <Link to="/testimonials/$id" params={{ id: t.id }}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setToDelete(t.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards on mobile */}
            <div className="divide-y md:hidden">
              {rows.map((t) => (
                <div key={t.id} className="space-y-3 p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{t.customer_name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[t.job_title, t.company_name].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{t.content}</p>
                  <div className="flex items-center justify-between">
                    <Rating value={t.rating} />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setPreview(t)}>
                        <Eye className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to="/testimonials/$id" params={{ id: t.id }}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setToDelete(t.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-sm">
              <p className="text-muted-foreground">
                Showing {(current - 1) * PAGE_SIZE + 1}–
                {Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={current <= 1}
                  onClick={() => setPage(current - 1)}
                >
                  Previous
                </Button>
                <span className="text-muted-foreground">
                  Page {current} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={current >= totalPages}
                  onClick={() => setPage(current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete testimonial?"
        body="Are you sure you want to delete this testimonial? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!toDelete) return;
          await remove.mutateAsync(toDelete);
          setToDelete(null);
          toast.success("Testimonial deleted");
        }}
      />

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{preview?.customer_name}</DialogTitle>
            <DialogDescription>
              {[preview?.job_title, preview?.company_name].filter(Boolean).join(" · ")}
            </DialogDescription>
          </DialogHeader>
          <Rating value={preview?.rating ?? 0} />
          <p className="text-sm leading-relaxed">{preview?.content}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
