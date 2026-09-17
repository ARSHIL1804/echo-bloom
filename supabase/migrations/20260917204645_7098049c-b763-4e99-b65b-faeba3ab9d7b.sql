ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS polar_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS polar_product_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS subscriptions_polar_subscription_id_idx
  ON public.subscriptions (polar_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_polar_customer_id_idx
  ON public.subscriptions (polar_customer_id);