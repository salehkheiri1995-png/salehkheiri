-- Extend salon_settings to support editable homepage/footer copy
ALTER TABLE public.salon_settings
  ADD COLUMN IF NOT EXISTS hero_badge_text text,
  ADD COLUMN IF NOT EXISTS hero_title text,
  ADD COLUMN IF NOT EXISTS hero_highlight text,
  ADD COLUMN IF NOT EXISTS hero_description text,
  ADD COLUMN IF NOT EXISTS home_services_title text,
  ADD COLUMN IF NOT EXISTS home_services_subtitle text,
  ADD COLUMN IF NOT EXISTS home_specialists_title text,
  ADD COLUMN IF NOT EXISTS home_specialists_subtitle text,
  ADD COLUMN IF NOT EXISTS home_courses_title text,
  ADD COLUMN IF NOT EXISTS home_courses_subtitle text,
  ADD COLUMN IF NOT EXISTS home_products_title text,
  ADD COLUMN IF NOT EXISTS home_products_subtitle text,
  ADD COLUMN IF NOT EXISTS home_booking_title text,
  ADD COLUMN IF NOT EXISTS home_booking_subtitle text;

-- Sensible defaults for existing rows (only where NULL)
UPDATE public.salon_settings
SET
  hero_badge_text = COALESCE(hero_badge_text, 'پذیرش آنلاین فعال است'),
  hero_title = COALESCE(hero_title, 'زیبایی شما،'),
  hero_highlight = COALESCE(hero_highlight, 'اولویت ماست'),
  hero_description = COALESCE(hero_description, 'با بهترین متخصصان زیبایی، خدمات حرفه‌ای را تجربه کنید. از مراقبت پوست تا آرایش عروس، همه در یک مکان.'),
  home_services_title = COALESCE(home_services_title, 'خدمات زیبایی حرفه‌ای'),
  home_services_subtitle = COALESCE(home_services_subtitle, 'با تیم متخصص ما، بهترین خدمات زیبایی را تجربه کنید'),
  home_specialists_title = COALESCE(home_specialists_title, 'متخصصان حرفه‌ای ما'),
  home_specialists_subtitle = COALESCE(home_specialists_subtitle, 'با بهترین متخصصان زیبایی آشنا شوید'),
  home_courses_title = COALESCE(home_courses_title, 'آموزش حرفه‌ای زیبایی'),
  home_courses_subtitle = COALESCE(home_courses_subtitle, 'با دوره‌های تخصصی ما، مهارت‌های زیبایی خود را ارتقا دهید'),
  home_products_title = COALESCE(home_products_title, 'محصولات پرفروش'),
  home_products_subtitle = COALESCE(home_products_subtitle, 'بهترین محصولات زیبایی با ضمانت اصالت کالا'),
  home_booking_title = COALESCE(home_booking_title, 'همین حالا نوبت خود را رزرو کنید'),
  home_booking_subtitle = COALESCE(home_booking_subtitle, 'به سادگی و در کمترین زمان، نوبت خود را به صورت آنلاین رزرو کنید');

-- Ensure updated_at changes when row updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_salon_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_salon_settings_updated_at
    BEFORE UPDATE ON public.salon_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;