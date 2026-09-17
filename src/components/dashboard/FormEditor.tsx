import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, Code2, Copy, Globe, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  copyToClipboard,
  formEmbedCode,
  formUrl,
  mergeFormFields,
  useBrands,
  useForms,
  useSaveForm,
  type CollectionForm,
  type FormFields,
} from "@/lib/data";
import { formatLimit, usePlan } from "@/lib/plans";
import { fontStack, initials } from "@/lib/widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SwitchField } from "./controls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FIELD_ROWS: { key: keyof FormFields; label: string; requiredKey?: keyof FormFields }[] = [
  { key: "email", label: "Email address", requiredKey: "emailRequired" },
  { key: "photo", label: "Photo URL" },
  { key: "company", label: "Company name", requiredKey: "companyRequired" },
  { key: "jobTitle", label: "Job title" },
  { key: "rating", label: "Star rating" },
];

export function FormEditor({ form }: { form?: CollectionForm }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: brands } = useBrands(user?.id);
  const { data: forms } = useForms(user?.id);
  const plan = usePlan(user?.id);
  const save = useSaveForm(user?.id);

  const [name, setName] = useState(form?.name ?? "Testimonial collection form");
  const [brandId, setBrandId] = useState(form?.brand_id ?? "");
  const [headline, setHeadline] = useState(form?.headline ?? "Share your experience");
  const [intro, setIntro] = useState(
    form?.intro ?? "We would love to hear how things are going. It only takes a minute.",
  );
  const [thankYou, setThankYou] = useState(
    form?.thank_you ?? "Thank you! Your testimonial has been received.",
  );
  const [fields, setFields] = useState<FormFields>(mergeFormFields(form?.fields));
  const [autoPublish, setAutoPublish] = useState(form?.auto_publish ?? false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState<"draft" | "live" | null>(null);
  const [liveSlug, setLiveSlug] = useState<string | null>(
    form?.status === "live" ? form.slug : null,
  );

  const touch = () => setDirty(true);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const brand = (brands ?? []).find((b) => b.id === brandId);
  const bg = brand?.background_color ?? "#F8FAFC";
  const primary = brand?.primary_color ?? "#6366F1";
  const text = brand?.text_color ?? "#111827";
  const headingFont = fontStack(brand?.heading_font ?? "Plus Jakarta Sans");
  const bodyFont = fontStack(brand?.body_font ?? "Inter");

  const liveCount = (forms ?? []).filter((f) => f.status === "live" && f.id !== form?.id).length;

  function setField<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    touch();
  }

  async function handleSave(mode: "draft" | "live") {
    if (!name.trim()) {
      toast.error("Give your form a name");
      return;
    }
    if (!brandId) {
      toast.error("Pick the brand this form belongs to");
      return;
    }
    if (mode === "live" && form?.status !== "live" && liveCount >= plan.forms) {
      toast.error(
        `The ${plan.name} plan allows ${formatLimit(plan.forms)} live form${plan.forms === 1 ? "" : "s"}. Upgrade in Billing for more.`,
      );
      return;
    }
    setSaving(mode);
    try {
      const result = await save.mutateAsync({
        ...(form ? { id: form.id } : {}),
        values: {
          name: name.trim(),
          brand_id: brandId,
          headline: headline.trim(),
          intro: intro.trim(),
          thank_you: thankYou.trim(),
          fields: fields as unknown as CollectionForm["fields"],
          auto_publish: autoPublish,
          status: mode === "live" ? "live" : (form?.status ?? "draft"),
        },
      });
      setDirty(false);
      if (mode === "live") {
        setLiveSlug(result.slug);
        toast.success("Your collection form is now live");
      } else {
        toast.success("Form saved");
      }
      if (!form) navigate({ to: "/forms/$id", params: { id: result.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save form");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Label htmlFor="form-name" className="text-xs text-muted-foreground">
            Form name
          </Label>
          <Input
            id="form-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              touch();
            }}
            className="mt-1 h-11 max-w-sm border-0 bg-transparent px-0 font-display text-2xl font-bold shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {dirty && (
            <span className="hidden self-center text-xs text-muted-foreground sm:inline">
              Unsaved changes
            </span>
          )}
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => handleSave("draft")}
            disabled={!!saving}
          >
            {saving === "draft" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save
          </Button>
          <Button className="rounded-xl" onClick={() => handleSave("live")} disabled={!!saving}>
            {saving === "live" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Globe className="size-4" />
            )}
            Save &amp; Make Live
          </Button>
        </div>
      </div>

      {liveSlug && (
        <div className="surface-card flex flex-wrap items-center justify-between gap-3 border-success/30 bg-success/5 p-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-success">
              <Check className="size-4" /> Your collection form is live
            </p>
            <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
              {formUrl(liveSlug)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={async () => {
                await copyToClipboard(formUrl(liveSlug));
                toast.success("Form link copied");
              }}
            >
              <Copy className="size-4" /> Copy link
            </Button>
            <Button variant="ghost" size="sm" asChild className="rounded-xl">
              <a href={`/f/${liveSlug}`} target="_blank" rel="noreferrer">
                Open form
              </a>
            </Button>
          </div>
        </div>
      )}

      {liveSlug && (
        <section className="surface-card space-y-3 p-5">
          <div>
            <h2 className="font-display text-sm font-bold">Embed this form on your website</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Paste this snippet wherever you want the form to appear. It resizes to the space you
              give it and keeps your brand styling.
            </p>
          </div>
          <pre className="overflow-x-auto rounded-xl bg-muted/60 p-4 text-xs leading-relaxed">
            <code>{formEmbedCode(liveSlug)}</code>
          </pre>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={async () => {
              await copyToClipboard(formEmbedCode(liveSlug));
              toast.success("Embed code copied");
            }}
          >
            <Code2 className="size-4" /> Copy embed code
          </Button>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-4">
          <section className="surface-card space-y-4 p-5">
            <h2 className="font-display text-sm font-bold">Brand</h2>
            {(brands ?? []).length === 0 ? (
              <p className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
                Create a brand first.{" "}
                <Link to="/brand" className="font-medium text-primary hover:underline">
                  Go to Brand
                </Link>
              </p>
            ) : (
              <Select
                value={brandId}
                onValueChange={(v) => {
                  setBrandId(v);
                  touch();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {(brands ?? []).map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              The form uses this brand's colors and fonts, and submissions are tagged with it.
            </p>
          </section>

          <section className="surface-card space-y-4 p-5">
            <h2 className="font-display text-sm font-bold">Content</h2>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Headline</Label>
              <Input
                value={headline}
                onChange={(e) => {
                  setHeadline(e.target.value);
                  touch();
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Intro text</Label>
              <Textarea
                rows={3}
                value={intro}
                onChange={(e) => {
                  setIntro(e.target.value);
                  touch();
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Thank-you message</Label>
              <Textarea
                rows={2}
                value={thankYou}
                onChange={(e) => {
                  setThankYou(e.target.value);
                  touch();
                }}
              />
            </div>
          </section>

          <section className="surface-card space-y-3 p-5">
            <h2 className="font-display text-sm font-bold">Fields to ask for</h2>
            <p className="text-xs text-muted-foreground">
              Name and the testimonial message are always asked and required.
            </p>
            {FIELD_ROWS.map((row) => (
              <div key={row.key} className="rounded-xl border p-3">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <span className="text-sm font-medium">{row.label}</span>
                  <Checkbox
                    checked={!!fields[row.key]}
                    onCheckedChange={(v) => setField(row.key, !!v)}
                  />
                </label>
                {row.requiredKey && fields[row.key] && (
                  <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox
                      checked={!!fields[row.requiredKey]}
                      onCheckedChange={(v) => setField(row.requiredKey!, !!v)}
                    />
                    Required
                  </label>
                )}
              </div>
            ))}
          </section>

          <section className="surface-card space-y-3 p-5">
            <h2 className="font-display text-sm font-bold">Approval</h2>
            <SwitchField
              label="Publish submissions automatically"
              checked={autoPublish}
              onChange={(v) => {
                setAutoPublish(v);
                touch();
              }}
            />
            <p className="text-xs text-muted-foreground">
              Off by default: submissions arrive as drafts in Testimonials so you can approve them
              first.
            </p>
          </section>
        </div>

        <div className="xl:sticky xl:top-6">
          <div className="surface-card overflow-hidden">
            <div className="border-b px-5 py-3">
              <p className="font-display text-sm font-bold">Preview</p>
            </div>
            <div className="p-6" style={{ background: bg, fontFamily: bodyFont }}>
              <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  {brand?.logo ? (
                    <img src={brand.logo} alt="" className="size-9 rounded-lg object-contain" />
                  ) : (
                    <span
                      className="grid size-9 place-items-center rounded-lg text-sm font-bold text-white"
                      style={{ background: primary }}
                    >
                      {initials(brand?.name ?? "Brand")}
                    </span>
                  )}
                  <span className="text-sm font-semibold" style={{ color: text }}>
                    {brand?.name ?? "Your brand"}
                  </span>
                </div>
                <h3
                  className="mt-5 text-xl font-bold"
                  style={{ color: text, fontFamily: headingFont }}
                >
                  {headline || "Share your experience"}
                </h3>
                <p className="mt-1.5 text-sm" style={{ color: "#6B7280" }}>
                  {intro}
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    "Your name",
                    ...(fields.email ? ["Email address"] : []),
                    ...(fields.company ? ["Company"] : []),
                    ...(fields.jobTitle ? ["Job title"] : []),
                    ...(fields.photo ? ["Photo URL"] : []),
                  ].map((label) => (
                    <div key={label}>
                      <p className="text-xs font-medium" style={{ color: text }}>
                        {label}
                      </p>
                      <div className="mt-1 h-9 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]" />
                    </div>
                  ))}
                  {fields.rating && (
                    <div>
                      <p className="text-xs font-medium" style={{ color: text }}>
                        Your rating
                      </p>
                      <p className="mt-1 text-lg" style={{ color: primary }}>
                        ★★★★★
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium" style={{ color: text }}>
                      Your testimonial
                    </p>
                    <div className="mt-1 h-24 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]" />
                  </div>
                </div>
                <div
                  className="mt-5 grid h-10 place-items-center rounded-xl text-sm font-semibold text-white"
                  style={{ background: primary }}
                >
                  Submit testimonial
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
