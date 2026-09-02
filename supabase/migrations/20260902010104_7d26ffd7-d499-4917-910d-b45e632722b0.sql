ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS sms_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_text text,
  ADD COLUMN IF NOT EXISTS consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_source_url text;