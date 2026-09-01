CREATE POLICY "Staff can view home photos objects" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'home-photos' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff can upload home photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'home-photos' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff can update home photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'home-photos' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'home-photos' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete home photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'home-photos' AND public.is_staff(auth.uid()));