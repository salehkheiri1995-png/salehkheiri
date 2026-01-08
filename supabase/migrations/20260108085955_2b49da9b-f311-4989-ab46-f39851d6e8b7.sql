-- First drop the existing foreign key if exists
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Add foreign key with ON DELETE SET NULL (preserves orders when user is deleted)
ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Also fix bookings table
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;