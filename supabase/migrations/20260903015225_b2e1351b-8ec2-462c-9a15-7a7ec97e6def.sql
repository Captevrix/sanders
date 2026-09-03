ALTER TABLE public.homes
  ADD COLUMN IF NOT EXISTS virtual_tour_url text,
  ADD COLUMN IF NOT EXISTS floor_plan_url text;

ALTER TABLE public.home_photos DROP CONSTRAINT IF EXISTS home_photos_home_id_fkey;
ALTER TABLE public.home_photos ADD CONSTRAINT home_photos_home_id_fkey
  FOREIGN KEY (home_id) REFERENCES public.homes(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_home_id_fkey;
ALTER TABLE public.leads ADD CONSTRAINT leads_home_id_fkey
  FOREIGN KEY (home_id) REFERENCES public.homes(id) ON UPDATE CASCADE ON DELETE SET NULL;

UPDATE public.homes SET builder = 'TRU Homes' WHERE id IN ('aspen','maple');
UPDATE public.homes SET builder = 'Cavalier Homes' WHERE id = 'jackson';
UPDATE public.homes SET dimensions = '28x68' WHERE id = 'sycamore';

UPDATE public.homes SET virtual_tour_url = 'https://momento360.com/e/uc/9efe096b2c9d4134b2101366e3a04933?utm_campaign=embed&utm_source=other&reset-heading=true&size=large' WHERE id = 'oak';
UPDATE public.homes SET virtual_tour_url = 'https://momento360.com/e/uc/4c840b26dee64f3c909b1d80511ab038?utm_campaign=embed&utm_source=other&reset-heading=true&size=large' WHERE id = 'aspen';
UPDATE public.homes SET virtual_tour_url = 'https://momento360.com/e/uc/05301318428e42c49d074dd1824ca101?utm_campaign=embed&utm_source=other&reset-heading=true&size=large' WHERE id = 'sycamore';
UPDATE public.homes SET virtual_tour_url = 'https://momento360.com/e/uc/dce83f0dabaa4e998683a1bc3b2383a8?utm_campaign=embed&utm_source=other&reset-heading=true&size=large' WHERE id = 'redwood';
UPDATE public.homes SET virtual_tour_url = 'https://momento360.com/e/uc/e3440f3b0fcf4085824020a7151eb123?utm_campaign=embed&utm_source=other&reset-heading=true&size=large' WHERE id = 'delight';

UPDATE public.homes SET id = 'dogwood' WHERE id = 'delight' AND NOT EXISTS (SELECT 1 FROM public.homes h WHERE h.id = 'dogwood');

UPDATE public.homes SET statuses = array_remove(statuses, 'Special') WHERE id IN ('lean-on-me','oasis');

INSERT INTO public.homes (id, name, builder, property_id, section_type, statuses, beds, baths, sqft, dimensions, description, published, virtual_tour_url)
VALUES
  ('new-display-home-1', 'New Display Home', '', '', 'Single Section', ARRAY['For Sale','On Site'], 3, 2, 0, '', 'Newly arrived single section home on display at our Pensacola lot. Specs and photos coming soon.', false, 'https://momento360.com/e/uc/6cce54f95a064b38bcc6f3647cd2b284?utm_campaign=embed&utm_source=other&reset-heading=true&size=large'),
  ('new-display-home-2', 'New Display Home 2', '', '', 'Single Section', ARRAY['For Sale','On Site'], 3, 2, 0, '', 'Newly arrived single section home on display at our Pensacola lot. Specs and photos coming soon.', false, 'https://my.matterport.com/show/?play=1&m=ysTWURfx3vU')
ON CONFLICT (id) DO NOTHING;