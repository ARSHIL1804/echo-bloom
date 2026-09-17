import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Save, Send, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useBrands, useForms } from "@/lib/data";
import { usePlan } from "@/lib/plans";
import {
  parseRecipientFile,
  recipientStats,
  useAddRecipients,
  useCampaign,
  useDeleteRecipient,
  useRecipients,
  useSaveCampaign,
  type Campaign,
} from "@/lib/campaigns";
import { sendCampaignBatch } from "@/lib/campaigns.functions";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/campaigns/$id")({
  component: CampaignDetail,
  head: () => ({
    meta: [
      { title: "Campaign — Testimonially" },
      { name: "description", content: "Edit your review request campaign and its recipients." },
      { property: "og:title", content: "Campaign — Testimonially" },
      {
        property: "og:description",
        content: "Edit your review request campaign and its recipients.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const NONE = "__none__";

function CampaignDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const plan = usePlan(user?.id);
  const { data: campaign, isLoading } = useCampaign(id);
  const { data: recipients } = useRecipients(id);
  const { data: brands } = useBrands(user?.id);
  const { data: forms } = useForms(user?.id);
  const save = useSaveCampaign(user?.id);
  const addRecipients = useAddRecipients(id, user?.id);
  const removeRecipient = useDeleteRecipient();
  const send = useServerFn(sendCampaignBatch);
  const fileRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<Partial<Campaign>>({});
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (campaign) setValues(campaign);
  }, [campaign]);

  const stats = recipientStats(recipients);
  const linkedForm = (forms ?? []).find((f) => f.id === values.form_id);

  async function handleSave() {
    setSaving(true);
    try {
      await save.mutateAsync({
        id,
        values: {
          name: (values.name ?? "").trim() || "Untitled campaign",
          subject: (values.subject ?? "").trim() || "Would you share your experience?",
          message: values.message ?? "",
          brand_id: values.brand_id ?? null,
          form_id: values.form_id ?? null,
          start_date: values.start_date ?? new Date().toISOString().slice(0, 10),
          end_date: values.end_date || null,
          reminder_days: Number(values.reminder_days ?? 0),
          status: values.status ?? "draft",
        },
      });
      toast.success("Campaign saved");
    } catch {
      toast.error("Could not save the campaign.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const parsed = await parseRecipientFile(file);
      const remaining = plan.emailsPerCampaign - stats.total;
      if (remaining <= 0) {
        toast.error(`Your plan allows ${plan.emailsPerCampaign} recipients per campaign.`);
        return;
      }
      const rows = parsed.valid.slice(0, remaining);
      if (!rows.length) {
        toast.error("No valid email addresses found in that file.");
        return;
      }
      await addRecipients.mutateAsync(rows);
      const notes = [
        `${rows.length} recipient${rows.length === 1 ? "" : "s"} added`,
        parsed.duplicates ? `${parsed.duplicates} duplicate${parsed.duplicates === 1 ? "" : "s"} skipped` : "",
        parsed.invalid.length ? `${parsed.invalid.length} invalid skipped` : "",
        parsed.valid.length > rows.length ? `${parsed.valid.length - rows.length} over your plan limit` : "",
      ].filter(Boolean);
      toast.success(notes.join(" · "));
    } catch {
      toast.error("Could not read that file. Use an Excel or CSV file with name and email columns.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSend(reminders: boolean) {
    setSending(true);
    try {
      const result = await send({ data: { campaignId: id, reminders } });
      if (result.sent > 0) toast.success(result.message);
      else toast.message(result.message);
    } catch {
      toast.error("Could not send right now. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="surface-card p-10 text-center">
        <p className="text-sm text-muted-foreground">This campaign no longer exists.</p>
        <Button asChild variant="outline" className="mt-4 rounded-xl">
          <Link to="/campaigns">Back to campaigns</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 rounded-lg">
        <Link to="/campaigns">
          <ArrowLeft className="size-4" />
          Campaigns
        </Link>
      </Button>

      <PageHeader
        title={values.name || "Campaign"}
        subtitle="One email per customer, each with their own review link."
        action={
          <Button className="rounded-xl" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Recipients", value: stats.total },
          { label: "Emails sent", value: stats.sent },
          { label: "Responded", value: stats.responded },
          { label: "Response rate", value: `${stats.rate}%` },
        ].map((s) => (
          <div key={s.label} className="surface-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <section className="surface-card space-y-4 p-6">
          <h2 className="font-display text-sm font-bold">Email</h2>
          <div className="space-y-1.5">
            <Label htmlFor="name">Campaign name</Label>
            <Input
              id="name"
              value={values.name ?? ""}
              maxLength={120}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject line</Label>
            <Input
              id="subject"
              value={values.subject ?? ""}
              maxLength={160}
              onChange={(e) => setValues((v) => ({ ...v, subject: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={8}
              value={values.message ?? ""}
              maxLength={4000}
              onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Use <code>{"{{name}}"}</code> for the customer's name and <code>{"{{link}}"}</code>{" "}
              for their personal review link (added at the end if you leave it out).
            </p>
          </div>
        </section>

        <div className="space-y-6">
          <section className="surface-card space-y-4 p-6">
            <h2 className="font-display text-sm font-bold">Settings</h2>
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Select
                value={values.brand_id ?? NONE}
                onValueChange={(v) => setValues((s) => ({ ...s, brand_id: v === NONE ? null : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No brand</SelectItem>
                  {(brands ?? []).map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name || "Untitled brand"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Collection form</Label>
              <Select
                value={values.form_id ?? NONE}
                onValueChange={(v) => setValues((s) => ({ ...s, form_id: v === NONE ? null : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick a form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No form</SelectItem>
                  {(forms ?? []).map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} {f.status === "live" ? "" : "(draft)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {linkedForm && linkedForm.status !== "live" && (
                <p className="text-xs text-warning">Make this form live before sending.</p>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="start">Start date</Label>
                <Input
                  id="start"
                  type="date"
                  value={values.start_date ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end">End date</Label>
                <Input
                  id="end"
                  type="date"
                  value={values.end_date ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reminder">Reminder after (days)</Label>
              <Input
                id="reminder"
                type="number"
                min={0}
                max={60}
                value={values.reminder_days ?? 0}
                onChange={(e) =>
                  setValues((v) => ({ ...v, reminder_days: Number(e.target.value) || 0 }))
                }
              />
              <p className="text-xs text-muted-foreground">0 means no reminder email.</p>
            </div>
          </section>

          <section className="surface-card space-y-3 p-6">
            <h2 className="font-display text-sm font-bold">Send</h2>
            <Button className="w-full rounded-xl" onClick={() => handleSend(false)} disabled={sending}>
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Send to pending recipients
            </Button>
            {(values.reminder_days ?? 0) > 0 && (
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => handleSend(true)}
                disabled={sending}
              >
                Send reminders
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Emails go out from your own sending domain. Set one up in Cloud → Emails if you
              haven't yet.
            </p>
          </section>
        </div>
      </div>

      <section className="surface-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-sm font-bold">Recipients</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.total} of {plan.emailsPerCampaign} allowed on your plan
            </p>
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
              }}
            />
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Upload Excel / CSV
            </Button>
          </div>
        </div>

        {stats.total === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Upload a spreadsheet with <strong>name</strong> and <strong>email</strong> columns to add
            your customers.
          </p>
        ) : (
          <ul className="mt-5 divide-y">
            {(recipients ?? []).map((r) => (
              <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.name || r.email}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.email}</p>
                  {r.error && <p className="mt-0.5 text-xs text-destructive">{r.error}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{r.status}</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${r.email}`}
                    onClick={() => removeRecipient.mutate(r.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
