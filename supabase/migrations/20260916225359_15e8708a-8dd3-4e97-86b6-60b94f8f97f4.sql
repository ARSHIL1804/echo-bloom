ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

CREATE TABLE public.forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT 'Untitled form',
  slug TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  headline TEXT NOT NULL DEFAULT 'Share your experience',
  intro TEXT NOT NULL DEFAULT 'We would love to hear how things are going.',
  thank_you TEXT NOT NULL DEFAULT 'Thank you! Your testimonial has been received.',
  fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  auto_publish BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','live')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.forms TO authenticated;
GRANT ALL ON public.forms TO service_role;

ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own forms" ON public.forms
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX forms_user_id_idx ON public.forms (user_id);
CREATE INDEX forms_slug_idx ON public.forms (slug);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $fn$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $fn$;

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.get_public_form(_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  headline text,
  intro text,
  thank_you text,
  fields jsonb,
  brand_name text,
  brand_logo text,
  primary_color text,
  text_color text,
  background_color text,
  heading_font text,
  body_font text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id, f.name, f.headline, f.intro, f.thank_you, f.fields,
         b.name, b.logo, b.primary_color, b.text_color, b.background_color,
         b.heading_font, b.body_font
  FROM public.forms f
  LEFT JOIN public.brands b ON b.id = f.brand_id
  WHERE f.slug = _slug AND f.status = 'live'
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_public_form(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_form(text) TO anon, authenticated;