ALTER TABLE public.homes ADD COLUMN IF NOT EXISTS description_original text;
UPDATE public.homes SET description_original = description WHERE description_original IS NULL;