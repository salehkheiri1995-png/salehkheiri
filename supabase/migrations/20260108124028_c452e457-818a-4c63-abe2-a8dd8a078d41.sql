-- Fix bookings INSERT policy to allow both authenticated and guest bookings
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;

CREATE POLICY "Allow authenticated and guest bookings" ON public.bookings
FOR INSERT WITH CHECK (
  -- Authenticated users: must use their own user_id
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  -- Guest bookings: both auth.uid and user_id must be NULL
  (auth.uid() IS NULL AND user_id IS NULL)
);