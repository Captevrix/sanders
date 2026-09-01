-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT 'Sanders Housing',
  phone text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _user_id AND p.is_active
  );
$$;

CREATE POLICY "Staff can view profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins update any profile" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR user_id = auth.uid());

-- Homes
CREATE TABLE public.homes (
  id text PRIMARY KEY,
  name text NOT NULL,
  builder text NOT NULL DEFAULT '',
  property_id text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '10300 Pensacola Blvd, Pensacola, FL',
  date_added date NOT NULL DEFAULT current_date,
  cover_image text,
  photo_count integer NOT NULL DEFAULT 0,
  statuses text[] NOT NULL DEFAULT '{}',
  section_type text NOT NULL DEFAULT 'Single Section',
  beds integer NOT NULL DEFAULT 0,
  baths numeric NOT NULL DEFAULT 0,
  sqft integer NOT NULL DEFAULT 0,
  dimensions text NOT NULL DEFAULT '',
  wind_zone text NOT NULL DEFAULT 'Wind Zone II',
  features text[] NOT NULL DEFAULT '{}',
  price integer,
  description text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.homes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homes TO authenticated;
GRANT ALL ON public.homes TO service_role;
ALTER TABLE public.homes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published homes" ON public.homes FOR SELECT TO anon USING (published);
CREATE POLICY "Staff can view all homes" ON public.homes FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR published);
CREATE POLICY "Staff can insert homes" ON public.homes FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update homes" ON public.homes FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete homes" ON public.homes FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE TABLE public.home_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id text NOT NULL REFERENCES public.homes(id) ON DELETE CASCADE,
  url text NOT NULL,
  storage_path text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX home_photos_home_id_idx ON public.home_photos(home_id, sort_order);
GRANT SELECT ON public.home_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_photos TO authenticated;
GRANT ALL ON public.home_photos TO service_role;
ALTER TABLE public.home_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view photos of published homes" ON public.home_photos FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.homes h WHERE h.id = home_id AND h.published));
CREATE POLICY "Staff can view photos" ON public.home_photos FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.homes h WHERE h.id = home_id AND h.published));
CREATE POLICY "Staff manage photos insert" ON public.home_photos FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage photos update" ON public.home_photos FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage photos delete" ON public.home_photos FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

-- Leads
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  message text,
  source text NOT NULL DEFAULT 'qualify',
  home_id text REFERENCES public.homes(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'new',
  internal_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view leads" ON public.leads FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update leads" ON public.leads FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER homes_updated_at BEFORE UPDATE ON public.homes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed the current inventory
INSERT INTO public.homes (id, name, builder, property_id, date_added, cover_image, statuses, section_type, beds, baths, sqft, dimensions, wind_zone, features, price, description, published) VALUES
('truman','Truman','Southern Energy','RH-11466-home','2025-12-08','home-1',ARRAY['For Sale','On Site'],'Single Section',3,2,1140,'16x76','Wind Zone II',ARRAY['Central Cooling','Central Heating','Dining Room','Drywall','Dual Sinks','Electric Range','Family Room','Fire Alarm','Kitchen Island','Laundry Room','Pantry','Separate Shower','Split Bedrooms','Utility Room With Washer/Dryer Hookups'],89900,$d$A compact, thoughtfully designed single section built to Southern Energy's Patriot standards — 2x6 floor joists, 8' sidewalls, vinyl siding and Low-E windows. The layout maximizes every square foot, making it a strong first home or a simple downsize.$d$,true),
('cozy-cottage','Cozy Cottage','Live Oak Homes','RH-10921-home','2025-04-11','home-2',ARRAY['For Sale','On Site','Special'],'Single Section',1,1,596,'15x40','Wind Zone II',ARRAY['Central Cooling','Central Heating','Open Concept','Drywall','Electric Range','Laundry Room','Ample Storage Throughout','Fire Alarm'],NULL,$d$The smallest footprint on the lot and the easiest to site. A true one-bedroom cottage that works as a guest house, a rental, or a low-overhead place of your own on land you already have.$d$,true),
('anderson','Anderson','Southern Energy','RH-10877-home','2025-03-03','home-3',ARRAY['For Sale','On Site'],'Multi Section',4,2,1860,'28x66','Wind Zone III',ARRAY['Central Cooling','Central Heating','Open Concept','Kitchen Island','Pantry','Split Bedrooms','Dual Sinks','Garden Tub','Separate Shower','Laundry Room','Utility Room With Washer/Dryer Hookups','Family Room','Ample Storage Throughout','Drywall'],139500,$d$Four bedrooms with a genuine split-bedroom layout, a large island kitchen and a master bath with both a garden tub and a separate shower. Our most-requested family floor plan.$d$,true),
('perdido','Perdido','Live Oak Homes','RH-11204-home','2025-09-19','home-1',ARRAY['For Sale','Luxury'],'Multi Section',3,2,2040,'32x64','Wind Zone III',ARRAY['Central Cooling','Central Heating','Open Concept','Gourmet Kitchen','Kitchen Island','Pantry','Fire Place','Vaulted Ceilings','Ensuite','Garden Tub','Separate Shower','Dual Sinks','Laundry Room','Utility Room With Washer/Dryer Hookups','Ample Storage Throughout','Drywall'],164900,$d$Our flagship 32-wide. Vaulted ceilings over an open great room, a gourmet kitchen with a full island, and an owner's suite with an ensuite bath at the opposite end of the home.$d$,true),
('santa-rosa','Santa Rosa','Southern Estates','RH-11310-home','2025-10-27','home-2',ARRAY['For Sale'],'Multi Section',3,2,1620,'28x60','Wind Zone III',ARRAY['Central Cooling','Central Heating','Open Concept','Kitchen Island','Split Bedrooms','Pantry','Laundry Room','Utility Room With Washer/Dryer Hookups','Separate Shower','Ample Storage Throughout'],NULL,$d$A right-sized double wide for a family of three or four, with an efficient kitchen-to-living flow and bedrooms split to opposite ends for quiet.$d$,true),
('escambia','Escambia','Live Oak Homes','RH-11055-home','2025-07-02','home-3',ARRAY['For Sale','Special'],'Single Section',2,2,980,'16x66','Wind Zone II',ARRAY['Central Cooling','Central Heating','Open Concept','Drywall','Pantry','Laundry Room','Utility Room With Washer/Dryer Hookups','Separate Shower'],74500,$d$Two bedrooms, two full baths and no wasted hallway. Priced as a current special while it sits on the front row.$d$,true),
('gulf-breeze','Gulf Breeze','Southern Energy','RH-11402-home','2025-11-14','home-1',ARRAY['For Sale','Luxury','On Site'],'Multi Section',4,3,2280,'32x72','Wind Zone III',ARRAY['Central Cooling','Central Heating','Open Concept','Gourmet Kitchen','Kitchen Island','Bonus Room','Fire Place','Built-In Entertainment Center','Ensuite','Garden Tub','Separate Shower','Dual Sinks','Split Bedrooms','Laundry Room','Utility Room With Washer/Dryer Hookups','Ample Storage Throughout','8.5'' Ceilings'],NULL,$d$The largest home on display. Four bedrooms, three full baths, a bonus room and a built-in entertainment wall — with 8.5' ceilings throughout.$d$,true),
('navarre','Navarre','Southern Estates','RH-10998-home','2025-06-09','home-2',ARRAY['For Sale'],'Single Section',3,2,1216,'16x80','Wind Zone II',ARRAY['Central Cooling','Central Heating','Dining Room','Kitchen Island','Split Bedrooms','Pantry','Laundry Room','Utility Room With Washer/Dryer Hookups','Separate Shower','Ample Storage Throughout','Drywall'],NULL,$d$The longest single section we stock. Three bedrooms with a real dining room and an island kitchen — a double-wide feel on a single-wide lot.$d$,true),
('blackwater','Blackwater','Live Oak Homes','RH-11128-home','2025-08-21','home-3',ARRAY['For Sale','On Site'],'Multi Section',3,2,1493,'28x52','Wind Zone III',ARRAY['Central Cooling','Central Heating','Open Concept','Kitchen Island','Pantry','Garden Tub','Separate Shower','Dual Sinks','Laundry Room','Utility Room With Washer/Dryer Hookups','Family Room'],NULL,$d$A shorter double wide that fits lots where a 66' box will not. Same open living area, same island kitchen, easier to permit and set.$d$,true),
('milton','Milton','Southern Energy','RH-10804-home','2025-02-12','home-1',ARRAY['For Sale','Special'],'Single Section',3,2,1064,'16x70','Wind Zone II',ARRAY['Central Cooling','Central Heating','Open Concept','Electric Range','Pantry','Laundry Room','Utility Room With Washer/Dryer Hookups','Split Bedrooms','Fire Alarm'],NULL,$d$Our value three-bedroom. Nothing fancy, everything essential, and the fastest home on the lot to get delivered and set.$d$,true),
('bayou-ridge','Bayou Ridge','Southern Estates','RH-11376-home','2025-11-02','home-2',ARRAY['For Sale','Luxury'],'Multi Section',5,3,2432,'32x76','Wind Zone III',ARRAY['Central Cooling','Central Heating','Open Concept','Gourmet Kitchen','Kitchen Island','Bonus Room','Built-In Desk Area','Fire Place','Vaulted Ceilings','Ensuite','Garden Tub','Separate Shower','Dual Sinks','Split Bedrooms','Laundry Room','Utility Room With Washer/Dryer Hookups','Ample Storage Throughout','Dining Room'],NULL,$d$Five bedrooms, three baths, a bonus room and a built-in desk area. Built for a multi-generation household that wants everyone under one roof without stepping on each other.$d$,true),
('pine-forest','Pine Forest','Live Oak Homes','RH-11245-home','2025-09-30','home-3',ARRAY['For Sale'],'Multi Section',3,2,1400,'24x60','Wind Zone II',ARRAY['Central Cooling','Central Heating','Open Concept','Kitchen Island','Pantry','Separate Shower','Laundry Room','Utility Room With Washer/Dryer Hookups','Ample Storage Throughout'],NULL,$d$A 24-wide — narrower than a standard double, so it clears tighter lots and driveways while still giving you a full open living area.$d$,true);

UPDATE public.homes h SET photo_count = v.c FROM (VALUES
('truman',19),('cozy-cottage',17),('anderson',14),('perdido',22),('santa-rosa',16),('escambia',12),
('gulf-breeze',20),('navarre',15),('blackwater',18),('milton',11),('bayou-ridge',21),('pine-forest',13)
) AS v(id,c) WHERE h.id = v.id;