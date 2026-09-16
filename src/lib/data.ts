import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LayoutRecord, Testimonial } from "./widget";

export type Brand = {
  id: string;
  user_id: string;
  name: string;
  website: string | null;
  logo: string | null;
  description: string | null;
  primary_color: string;
  secondary_color: string;
  text_color: string;
  background_color: string;
  font_family: string;
  heading_font: string;
  body_font: string;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
};

/* ---------------- profile ---------------- */

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useUpdateProfile(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<Profile>) => {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId!, ...values } as never)
        .eq("id", userId!);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

/* ---------------- brand ---------------- */

export function useBrands(userId?: string) {
  return useQuery({
    queryKey: ["brands", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Brand[]> => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Brand[];
    },
  });
}

export function useBrand(userId?: string) {
  return useQuery({
    queryKey: ["brand", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Brand | null> => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as Brand | null;
    },
  });
}

export function useSaveBrand(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: Partial<Brand>;
    }): Promise<Brand> => {
      if (id) {
        const { data, error } = await supabase
          .from("brands")
          .update(values as never)
          .eq("id", id)
          .select("*")
          .single();
        if (error) throw error;
        return data as Brand;
      }
      const { data, error } = await supabase
        .from("brands")
        .insert({ ...values, user_id: userId! } as never)
        .select("*")
        .single();
      if (error) throw error;
      return data as Brand;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      qc.invalidateQueries({ queryKey: ["brand"] });
    },
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("brands").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      qc.invalidateQueries({ queryKey: ["brand"] });
    },
  });
}

/* ---------------- testimonials ---------------- */

export function useTestimonials(userId?: string) {
  return useQuery({
    queryKey: ["testimonials", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Testimonial[]> => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Testimonial[];
    },
  });
}

export function useTestimonial(id?: string) {
  return useQuery({
    queryKey: ["testimonial", id],
    enabled: !!id,
    queryFn: async (): Promise<Testimonial | null> => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as Testimonial | null;
    },
  });
}

export function useSaveTestimonial(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Partial<Testimonial> }) => {
      if (id) {
        const { error } = await supabase
          .from("testimonials")
          .update(values as never)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("testimonials")
          .insert({ ...values, user_id: userId! } as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testimonials"] });
      qc.invalidateQueries({ queryKey: ["testimonial"] });
    },
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
}

/* ---------------- layouts ---------------- */

export function useLayouts(userId?: string) {
  return useQuery({
    queryKey: ["layouts", userId],
    enabled: !!userId,
    queryFn: async (): Promise<LayoutRecord[]> => {
      const { data, error } = await supabase
        .from("layouts")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LayoutRecord[];
    },
  });
}

export function useLayout(id?: string) {
  return useQuery({
    queryKey: ["layout", id],
    enabled: !!id,
    queryFn: async (): Promise<LayoutRecord | null> => {
      const { data, error } = await supabase.from("layouts").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as LayoutRecord | null;
    },
  });
}

export function useSaveLayout(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: Partial<LayoutRecord>;
    }): Promise<LayoutRecord> => {
      if (id) {
        const { data, error } = await supabase
          .from("layouts")
          .update(values as never)
          .eq("id", id)
          .select("*")
          .single();
        if (error) throw error;
        return data as LayoutRecord;
      }
      const { data, error } = await supabase
        .from("layouts")
        .insert({ ...values, user_id: userId! } as never)
        .select("*")
        .single();
      if (error) throw error;
      return data as LayoutRecord;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["layouts"] });
      qc.invalidateQueries({ queryKey: ["layout"] });
    },
  });
}

export function useDeleteLayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("layouts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["layouts"] }),
  });
}

export function widgetUrl(slug: string) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/widget/${slug}`;
}

export function embedCode(slug: string) {
  return `<iframe\n  src="${widgetUrl(slug)}"\n  width="100%"\n  height="500"\n  frameborder="0">\n</iframe>`;
}

export async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}
