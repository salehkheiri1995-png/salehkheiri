-- Update RLS policies to allow admins to view all data for management
-- Drop existing restrictive policies and create better ones

-- For services - allow admins to see ALL services (not just active)
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

-- For specialists - allow admins to see ALL specialists
DROP POLICY IF EXISTS "Anyone can view active specialists" ON public.specialists;
CREATE POLICY "Anyone can view active specialists" ON public.specialists FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

-- For products - allow admins to see ALL products
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

-- For courses - allow admins to see ALL courses
DROP POLICY IF EXISTS "Anyone can view active courses" ON public.courses;
CREATE POLICY "Anyone can view active courses" ON public.courses FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

-- For bookings - allow admins to see ALL bookings
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete bookings" ON public.bookings FOR DELETE USING (public.has_role(auth.uid(), 'admin'));