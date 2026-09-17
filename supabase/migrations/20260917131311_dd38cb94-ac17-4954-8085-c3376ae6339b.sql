ALTER TABLE public.testimonials
ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'text';

UPDATE public.testimonials
SET source = 'text'
WHERE source IS NULL OR source = '';

ALTER TABLE public.testimonials
ADD CONSTRAINT testimonials_source_check
CHECK (source IN (
  'text',
  'google',
  'facebook',
  'twitter',
  'linkedin',
  'instagram',
  'capterra',
  'trustpilot',
  'reddit',
  'yelp',
  'g2',
  'app-store',
  'play-store'
));