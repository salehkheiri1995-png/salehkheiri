-- Fix the INSERT policy for bookings to require user_id = auth.uid()
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
CREATE POLICY "Users can create bookings" ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);