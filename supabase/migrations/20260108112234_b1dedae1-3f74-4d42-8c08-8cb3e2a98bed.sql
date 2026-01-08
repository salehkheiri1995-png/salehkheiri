-- Add section visibility columns to salon_settings table
ALTER TABLE public.salon_settings
ADD COLUMN IF NOT EXISTS section_services_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS section_portfolio_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS section_specialists_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS section_courses_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS section_shop_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS section_booking_enabled boolean DEFAULT true;