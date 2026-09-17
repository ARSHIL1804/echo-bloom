-- Collapse plans to free / pro
UPDATE public.subscriptions SET plan = 'pro' WHERE plan IN ('starter','agency');
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_check CHECK (plan IN ('free','pro'));

-- Campaigns
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT 'Untitled campaign',
  subject TEXT NOT NULL DEFAULT 'Would you share your experience?',
  message TEXT NOT NULL DEFAULT 'Hi {{name}},

We would love to hear about your experience. It takes less than a minute.',
  start_date DATE NOT NULL DEFAULT (now()::date),
  end_date DATE,
  reminder_days INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','running','completed','paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own campaigns" ON public.campaigns FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.campaign_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(12), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','responded','unsubscribed')),
  error TEXT,
  sent_at TIMESTAMPTZ,
  reminded_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, email)
);
CREATE UNIQUE INDEX campaign_recipients_token_key ON public.campaign_recipients(token);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_recipients TO authenticated;
GRANT ALL ON public.campaign_recipients TO service_role;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own campaign recipients" ON public.campaign_recipients FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;