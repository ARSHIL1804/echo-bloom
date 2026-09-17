import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CampaignStatus = "draft" | "scheduled" | "running" | "completed" | "paused";

export type Campaign = {
  id: string;
  user_id: string;
  brand_id: string | null;
  form_id: string | null;
  name: string;
  subject: string;
  message: string;
  start_date: string;
  end_date: string | null;
  reminder_days: number;
  status: CampaignStatus | string;
  created_at?: string;
  updated_at?: string;
};

export type RecipientStatus = "pending" | "sent" | "failed" | "responded" | "unsubscribed";

export type CampaignRecipient = {
  id: string;
  campaign_id: string;
  user_id: string;
  name: string;
  email: string;
  token: string;
  status: RecipientStatus | string;
  error: string | null;
  sent_at: string | null;
  reminded_at: string | null;
  responded_at: string | null
};

/* ---------------- queries ---------------- */

export function useCampaigns(userId?: string) {
  return useQuery({
    queryKey: ["campaigns", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Campaign[]> => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Campaign[];
    },
  });
}

export function useCampaign(id?: string) {
  return useQuery({
    queryKey: ["campaign", id],
    enabled: !!id,
    queryFn: async (): Promise<Campaign | null> => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as Campaign | null;
    },
  });
}

export function useRecipients(campaignId?: string) {
  return useQuery({
    queryKey: ["campaign-recipients", campaignId],
    enabled: !!campaignId,
    queryFn: async (): Promise<CampaignRecipient[]> => {
      const { data, error } = await supabase
        .from("campaign_recipients")
        .select("*")
        .eq("campaign_id", campaignId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CampaignRecipient[];
    },
  });
}

/* ---------------- mutations ---------------- */

export function useSaveCampaign(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: Partial<Campaign>;
    }): Promise<Campaign> => {
      if (id) {
        const { data, error } = await supabase
          .from("campaigns")
          .update(values as never)
          .eq("id", id)
          .select("*")
          .single();
        if (error) throw error;
        return data as unknown as Campaign;
      }
      const { data, error } = await supabase
        .from("campaigns")
        .insert({ ...values, user_id: userId! } as never)
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as Campaign;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaign"] });
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useAddRecipients(campaignId?: string, userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows: { name: string; email: string }[]) => {
      if (!rows.length) return 0;
      const { error } = await supabase.from("campaign_recipients").upsert(
        rows.map((r) => ({
          campaign_id: campaignId!,
          user_id: userId!,
          name: r.name,
          email: r.email,
        })) as never,
        { onConflict: "campaign_id,email", ignoreDuplicates: true },
      );
      if (error) throw error;
      return rows.length;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaign-recipients"] }),
  });
}

export function useDeleteRecipient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaign_recipients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaign-recipients"] }),
  });
}

/* ---------------- helpers ---------------- */

export type ParsedRecipients = {
  valid: { name: string; email: string }[];
  invalid: { row: number; value: string }[];
  duplicates: number;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Parses an uploaded .xlsx/.xls/.csv file into recipients (name + email). */
export async function parseRecipientFile(file: File): Promise<ParsedRecipients> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const book = XLSX.read(buffer, { type: "array" });
  const sheetName = book.SheetNames[0];
  const sheet = sheetName ? book.Sheets[sheetName] : undefined;
  if (!sheet) return { valid: [], invalid: [], duplicates: 0 };
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  const valid: { name: string; email: string }[] = [];
  const invalid: { row: number; value: string }[] = [];
  const seen = new Set<string>();
  let duplicates = 0;

  rows.forEach((row, index) => {
    const entries = Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), String(v).trim()] as const);
    const email =
      entries.find(([k]) => k.includes("email") || k.includes("mail"))?.[1] ??
      entries.find(([, v]) => EMAIL_RE.test(v))?.[1] ??
      "";
    const name = entries.find(([k]) => k.includes("name"))?.[1] ?? "";

    if (!EMAIL_RE.test(email)) {
      if (email || name) invalid.push({ row: index + 2, value: email || name });
      return;
    }
    const key = email.toLowerCase();
    if (seen.has(key)) {
      duplicates += 1;
      return;
    }
    seen.add(key);
    valid.push({ name: name.slice(0, 120), email: key.slice(0, 200) });
  });

  return { valid, invalid, duplicates };
}

/** Campaigns created in the current calendar month (for plan limits). */
export function campaignsThisMonth(campaigns: Campaign[] | undefined): number {
  const now = new Date();
  return (campaigns ?? []).filter((c) => {
    if (!c.created_at) return false;
    const d = new Date(c.created_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
}

/** Personal review link for a recipient. */
export function reviewLink(formSlug: string, token: string) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/f/${formSlug}?r=${token}`;
}

export function recipientStats(recipients: CampaignRecipient[] | undefined) {
  const list = recipients ?? [];
  const sent = list.filter((r) => r.status !== "pending").length;
  const responded = list.filter((r) => r.status === "responded").length;
  const failed = list.filter((r) => r.status === "failed").length;
  return {
    total: list.length,
    sent,
    responded,
    failed,
    rate: sent ? Math.round((responded / sent) * 100) : 0,
  };
}
