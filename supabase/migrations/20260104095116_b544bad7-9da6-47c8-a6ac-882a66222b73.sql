-- Add shipping settings to salon_settings table
ALTER TABLE public.salon_settings 
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 50000,
ADD COLUMN IF NOT EXISTS free_shipping_threshold NUMERIC DEFAULT 500000;