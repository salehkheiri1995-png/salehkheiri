-- Add gallery_images column to all relevant tables
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gallery_images text[] DEFAULT '{}';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS gallery_images text[] DEFAULT '{}';
ALTER TABLE public.specialists ADD COLUMN IF NOT EXISTS gallery_images text[] DEFAULT '{}';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS gallery_images text[] DEFAULT '{}';

-- Add comments for clarity
COMMENT ON COLUMN public.products.gallery_images IS 'Additional product images beyond the main image_url';
COMMENT ON COLUMN public.services.gallery_images IS 'Additional service images beyond the main image_url';
COMMENT ON COLUMN public.specialists.gallery_images IS 'Additional specialist images beyond the main avatar_url';
COMMENT ON COLUMN public.courses.gallery_images IS 'Additional course images beyond the main image_url';