import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mergeFormFields } from "@/lib/data";
import { fontStack, initials } from "@/lib/widget";

export const Route = createFileRoute("/f/$slug")({
  component: PublicForm,
  validateSearch: (search: Record<string, unknown>) => ({
    embed: search['embed'] === "1" || search['embed'] === 1 || search['embed'] === true,
  }),
  head: () => ({
    meta: [
      { title: "Share your experience" },
      { name: "description", content: "Submit your testimonial." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Share your experience" },
      { property: "og:description", content: "Submit your testimonial." },
      { property: "og:type", content: "website" },
    ],
  }),
});

type PublicFormRow = {
  id: string;
  name: string;
  headline: string;
  intro: string;
  thank_you: string;
  fields: unknown;
  brand_name: string | null;
  brand_logo: string | null;
  primary_color: string | null;
  text_color: string | null;
  background_color: string | null;
  heading_font: string | null;
  body_font: string | null;
};

function PublicForm() {
  const { slug } = Route.useParams();
  const { embed } = Route.useSearch();

  const { data, isLoading } = useQuery({
    queryKey: ["public-form", slug],
    queryFn: async (): Promise<PublicFormRow | null> => {
      const { data: rows, error } = await supabase.rpc("get_public_form", { _slug: slug });
      if (error) throw error;
      const list = (rows ?? []) as PublicFormRow[];
      return list[0] ?? null;
    },
  });

  const [values, setValues] = useState({
    customer_name: "",
    customer_email: "",
    customer_avatar: "",
    company_name: "",
    job_title: "",
    content: "",
    website: "",
  });
  const [rating, setRating] = useState(5);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (key: keyof typeof values, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  if (isLoading) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <Loader2 className="size-6 animate-spin" style={{ color: "#9CA3AF" }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          padding: 24,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          color: "#6B7280",
          textAlign: "center",
        }}
      >
        <p>This testimonial form is not available.</p>
      </div>
    );
  }

  const fields = mergeFormFields(data.fields);
  const bg = data.background_color ?? "#F8FAFC";
  const primary = data.primary_color ?? "#6366F1";
  const text = data.text_color ?? "#111827";
  const headingFont = fontStack(data.heading_font ?? "Plus Jakarta Sans");
  const bodyFont = fontStack(data.body_font ?? "Inter");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    const next: Record<string, string> = {};
    if (!values.customer_name.trim()) next['customer_name'] = "Please enter your name";
    if (values.content.trim().length < 10)
      next['content'] = "Please write at least a sentence or two";
    if (fields.email && fields.emailRequired && !values.customer_email.trim())
      next['customer_email'] = "Please enter your email";
    if (values.customer_email && !/^\S+@\S+\.\S+$/.test(values.customer_email))
      next['customer_email'] = "Enter a valid email";
    if (fields.company && fields.companyRequired && !values.company_name.trim())
      next['company_name'] = "Please enter your company";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setServerError("");
    try {
      const response = await fetch("/api/public/submit-testimonial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          customer_name: values.customer_name.trim(),
          content: values.content.trim(),
          ...(fields.email && values.customer_email
            ? { customer_email: values.customer_email.trim() }
            : {}),
          ...(fields.photo && values.customer_avatar
            ? { customer_avatar: values.customer_avatar.trim() }
            : {}),
          ...(fields.company && values.company_name
            ? { company_name: values.company_name.trim() }
            : {}),
          ...(fields.jobTitle && values.job_title ? { job_title: values.job_title.trim() } : {}),
          ...(fields.rating ? { rating } : {}),
          website: values.website,
        }),
      });
      const json = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !json.ok) {
        setServerError(json.error ?? "Could not submit your testimonial.");
        return;
      }
      setDone(true);
    } catch {
      setServerError("Could not submit your testimonial. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    fontSize: 14,
    color: text,
    fontFamily: bodyFont,
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: text };
  const errorStyle: React.CSSProperties = { fontSize: 12, color: "#EF4444", marginTop: 4 };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        fontFamily: bodyFont,
        padding: "40px 16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          background: "#FFFFFF",
          borderRadius: 20,
          border: "1px solid #E5E7EB",
          boxShadow: "0 20px 40px -24px rgba(17,24,39,0.18)",
          padding: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {data.brand_logo ? (
            <img
              src={data.brand_logo}
              alt=""
              style={{ width: 40, height: 40, borderRadius: 10, objectFit: "contain" }}
            />
          ) : (
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: primary,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {initials(data.brand_name ?? "Brand")}
            </span>
          )}
          <span style={{ fontSize: 14, fontWeight: 600, color: text }}>
            {data.brand_name ?? "Testimonial"}
          </span>
        </div>

        {done ? (
          <div style={{ padding: "36px 0", textAlign: "center" }}>
            <h1 style={{ fontFamily: headingFont, fontSize: 22, color: text, margin: 0 }}>
              Thank you!
            </h1>
            <p style={{ marginTop: 10, fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>
              {data.thank_you}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: 22 }} noValidate>
            <h1
              style={{
                fontFamily: headingFont,
                fontSize: 24,
                fontWeight: 700,
                color: text,
                margin: 0,
              }}
            >
              {data.headline}
            </h1>
            <p style={{ marginTop: 8, fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>
              {data.intro}
            </p>

            <div style={{ marginTop: 22, display: "grid", gap: 14 }}>
              <div>
                <label style={labelStyle} htmlFor="customer_name">
                  Your name
                </label>
                <input
                  id="customer_name"
                  style={inputStyle}
                  value={values.customer_name}
                  onChange={(e) => set("customer_name", e.target.value)}
                  placeholder="Jane Cooper"
                />
                {errors['customer_name'] && <p style={errorStyle}>{errors['customer_name']}</p>}
              </div>

              {fields.email && (
                <div>
                  <label style={labelStyle} htmlFor="customer_email">
                    Email address{fields.emailRequired ? "" : " (optional)"}
                  </label>
                  <input
                    id="customer_email"
                    style={inputStyle}
                    value={values.customer_email}
                    onChange={(e) => set("customer_email", e.target.value)}
                    placeholder="jane@company.com"
                  />
                  {errors['customer_email'] && <p style={errorStyle}>{errors['customer_email']}</p>}
                </div>
              )}

              {fields.company && (
                <div>
                  <label style={labelStyle} htmlFor="company_name">
                    Company{fields.companyRequired ? "" : " (optional)"}
                  </label>
                  <input
                    id="company_name"
                    style={inputStyle}
                    value={values.company_name}
                    onChange={(e) => set("company_name", e.target.value)}
                    placeholder="Northwind"
                  />
                  {errors['company_name'] && <p style={errorStyle}>{errors['company_name']}</p>}
                </div>
              )}

              {fields.jobTitle && (
                <div>
                  <label style={labelStyle} htmlFor="job_title">
                    Job title (optional)
                  </label>
                  <input
                    id="job_title"
                    style={inputStyle}
                    value={values.job_title}
                    onChange={(e) => set("job_title", e.target.value)}
                    placeholder="Head of Growth"
                  />
                </div>
              )}

              {fields.photo && (
                <div>
                  <label style={labelStyle} htmlFor="customer_avatar">
                    Photo URL (optional)
                  </label>
                  <input
                    id="customer_avatar"
                    style={inputStyle}
                    value={values.customer_avatar}
                    onChange={(e) => set("customer_avatar", e.target.value)}
                    placeholder="https://…/photo.jpg"
                  />
                </div>
              )}

              {fields.rating && (
                <div>
                  <span style={labelStyle}>Your rating</span>
                  <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          lineHeight: 1,
                        }}
                      >
                        <Star
                          size={24}
                          color={n <= rating ? primary : "#D1D5DB"}
                          fill={n <= rating ? primary : "none"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label style={labelStyle} htmlFor="content">
                  Your testimonial
                </label>
                <textarea
                  id="content"
                  rows={6}
                  style={{ ...inputStyle, resize: "vertical" }}
                  value={values.content}
                  onChange={(e) => set("content", e.target.value)}
                  placeholder="Tell us what you liked most…"
                />
                {errors['content'] && <p style={errorStyle}>{errors['content']}</p>}
              </div>

              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={values.website}
                onChange={(e) => set("website", e.target.value)}
                style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
              />
            </div>

            {serverError && <p style={{ ...errorStyle, marginTop: 14 }}>{serverError}</p>}

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 22,
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "none",
                background: primary,
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? "default" : "pointer",
                opacity: submitting ? 0.7 : 1,
                fontFamily: bodyFont,
              }}
            >
              {submitting ? "Submitting…" : "Submit testimonial"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
