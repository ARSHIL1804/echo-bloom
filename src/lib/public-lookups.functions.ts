import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { LayoutRecord, Testimonial } from "./widget";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type PublicFormLookup = {
  id: string;
  name: string;
  headline: string;
  intro: string;
  thank_you: string;
  fields: JsonValue;
  brand_name: string | null;
  brand_logo: string | null;
  primary_color: string | null;
  text_color: string | null;
  background_color: string | null;
  heading_font: string | null;
  body_font: string | null;
};

export const getPublicFormBySlug = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string().min(3).max(120) }).parse(data))
  .handler(async ({ data }): Promise<PublicFormLookup | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: form, error } = await supabaseAdmin
      .from("forms")
      .select(
        "id, name, headline, intro, thank_you, fields, brand:brands(name, logo, primary_color, text_color, background_color, heading_font, body_font)",
      )
      .eq("slug", data.slug)
      .eq("status", "live")
      .maybeSingle();

    if (error) throw error;
    if (!form) return null;

    const brand = Array.isArray(form.brand) ? form.brand[0] : form.brand;
    return {
      id: form.id,
      name: form.name,
      headline: form.headline,
      intro: form.intro,
      thank_you: form.thank_you,
      fields: form.fields as JsonValue,
      brand_name: brand?.name ?? null,
      brand_logo: brand?.logo ?? null,
      primary_color: brand?.primary_color ?? null,
      text_color: brand?.text_color ?? null,
      background_color: brand?.background_color ?? null,
      heading_font: brand?.heading_font ?? null,
      body_font: brand?.body_font ?? null,
    };
  });

export type PublicWidgetLookup = {
  layout: Omit<LayoutRecord, "configuration"> & { configuration: JsonValue };
  testimonials: Testimonial[];
  ownerPlan: string | null;
};

export const getPublicWidgetBySlug = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string().min(3).max(120) }).parse(data))
  .handler(
    async ({ data }): Promise<PublicWidgetLookup | null> => {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: layout, error: layoutError } = await supabaseAdmin
        .from("layouts")
        .select("*")
        .eq("public_slug", data.slug)
        .eq("status", "published")
        .maybeSingle();

      if (layoutError) throw layoutError;
      if (!layout) return null;

      const record = layout as PublicWidgetLookup["layout"];
      const ids = record.selected_testimonials ?? [];
      let testimonials: Testimonial[] = [];
      if (ids.length) {
        const { data: rows, error: rowsError } = await supabaseAdmin
          .from("testimonials")
          .select("id, user_id, brand_id, form_id, customer_name, customer_avatar, company_name, company_logo, job_title, content, rating, status, source, created_at, updated_at")
          .in("id", ids);
        if (rowsError) throw rowsError;
        testimonials = (rows ?? []) as Testimonial[];
        testimonials.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      }

      const { data: subscription } = await supabaseAdmin
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", record.user_id ?? "")
        .maybeSingle();

      return {
        layout: record,
        testimonials,
        ownerPlan: subscription?.status === "active" ? subscription.plan : "free",
      };
    },
  );
