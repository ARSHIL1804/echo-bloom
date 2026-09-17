import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RatingInput } from "@/components/dashboard/bits";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useBrands } from "@/lib/data";
import { SourceIcon, TESTIMONIAL_SOURCES, normalizeSource } from "@/lib/testimonial-sources";
import type { Testimonial } from "@/lib/widget";

export type TestimonialFormValues = {
  customer_name: string;
  customer_email: string;
  customer_avatar: string;
  company_name: string;
  company_logo: string;
  job_title: string;
  content: string;
  rating: number;
  status: "published" | "draft";
  brand_id: string;
  source: string;
};

export function emptyValues(): TestimonialFormValues {
  return {
    customer_name: "",
    customer_email: "",
    customer_avatar: "",
    company_name: "",
    company_logo: "",
    job_title: "",
    content: "",
    rating: 5,
    status: "published",
    brand_id: "",
    source: "text",
  };
}

export function toFormValues(t: Testimonial): TestimonialFormValues {
  return {
    customer_name: t.customer_name ?? "",
    customer_email: t.customer_email ?? "",
    customer_avatar: t.customer_avatar ?? "",
    company_name: t.company_name ?? "",
    company_logo: t.company_logo ?? "",
    job_title: t.job_title ?? "",
    content: t.content ?? "",
    rating: t.rating ?? 5,
    status: (t.status === "published" ? "published" : "draft") as "published" | "draft",
    brand_id: t.brand_id ?? "",
    source: normalizeSource(t.source),
  };
}

/** Convert form values into a database-ready record. */
export function toRecord(values: TestimonialFormValues): Partial<Testimonial> {
  const { brand_id, ...rest } = values;
  return { ...rest, source: normalizeSource(rest.source), brand_id: brand_id || null };
}

export function TestimonialForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: TestimonialFormValues;
  submitLabel: string;
  onSubmit: (values: TestimonialFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const { data: brands } = useBrands(user?.id);
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof TestimonialFormValues>(key: K, value: TestimonialFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!values.customer_name.trim()) next['customer_name'] = "Customer name is required";
    if (!values.content.trim()) next['content'] = "Testimonial content is required";
    if (values.customer_email && !/^\S+@\S+\.\S+$/.test(values.customer_email))
      next['customer_email'] = "Enter a valid email";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="surface-card p-6">
        <h2 className="font-display text-base font-bold">Customer Information</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Customer name</Label>
            <Input
              id="customer_name"
              value={values.customer_name}
              onChange={(e) => set("customer_name", e.target.value)}
              placeholder="Sarah Whitfield"
            />
            {errors['customer_name'] && (
              <p className="text-xs text-destructive">{errors['customer_name']}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer_email">Customer email</Label>
            <Input
              id="customer_email"
              value={values.customer_email}
              onChange={(e) => set("customer_email", e.target.value)}
              placeholder="sarah@northwind.com"
            />
            {errors['customer_email'] && (
              <p className="text-xs text-destructive">{errors['customer_email']}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer_avatar">Customer photo URL</Label>
            <Input
              id="customer_avatar"
              value={values.customer_avatar}
              onChange={(e) => set("customer_avatar", e.target.value)}
              placeholder="https://…/avatar.jpg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job_title">Job title</Label>
            <Input
              id="job_title"
              value={values.job_title}
              onChange={(e) => set("job_title", e.target.value)}
              placeholder="Head of Growth"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_name">Company name</Label>
            <Input
              id="company_name"
              value={values.company_name}
              onChange={(e) => set("company_name", e.target.value)}
              placeholder="Northwind"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand_id">Brand</Label>
            <Select
              value={values.brand_id || "none"}
              onValueChange={(v) => set("brand_id", v === "none" ? "" : v)}
            >
              <SelectTrigger id="brand_id">
                <SelectValue placeholder="No brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No brand</SelectItem>
                {(brands ?? []).map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Used to filter testimonials when building widgets.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select value={values.source} onValueChange={(v) => set("source", normalizeSource(v))}>
              <SelectTrigger id="source">
                <SelectValue placeholder="Text Testimonial" />
              </SelectTrigger>
              <SelectContent>
                {TESTIMONIAL_SOURCES.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    <span className="flex min-w-0 items-center gap-2">
                      <SourceIcon source={source.id} size="sm" />
                      <span className="truncate">{source.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_logo">Company logo URL</Label>
            <Input
              id="company_logo"
              value={values.company_logo}
              onChange={(e) => set("company_logo", e.target.value)}
              placeholder="https://…/logo.svg"
            />
          </div>
        </div>
      </section>

      <section className="surface-card p-6">
        <h2 className="font-display text-base font-bold">Testimonial</h2>
        <div className="mt-5 space-y-2">
          <Label htmlFor="content">What did your customer say?</Label>
          <Textarea
            id="content"
            rows={6}
            value={values.content}
            onChange={(e) => set("content", e.target.value)}
            placeholder="We shipped social proof across our whole marketing site in an afternoon…"
          />
          {errors['content'] && <p className="text-xs text-destructive">{errors['content']}</p>}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-6">
          <h2 className="font-display text-base font-bold">Rating</h2>
          <div className="mt-4">
            <RatingInput value={values.rating} onChange={(v) => set("rating", v)} />
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="font-display text-base font-bold">Status</h2>
          <RadioGroup
            className="mt-4 gap-3"
            value={values.status}
            onValueChange={(v) => set("status", v as "published" | "draft")}
          >
            {[
              ["published", "Published", "Visible in your widgets."],
              ["draft", "Draft", "Saved but hidden from widgets."],
            ].map(([value, label, hint]) => (
              <label
                key={value}
                className="flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors hover:bg-muted/50"
              >
                <RadioGroupItem value={value!} className="mt-0.5" />
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-muted-foreground">{hint}</span>
                </span>
              </label>
            ))}
          </RadioGroup>
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" className="rounded-xl" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" className="rounded-xl" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
