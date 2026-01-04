-- Create theme_settings table for storing appearance customization
CREATE TABLE public.theme_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Colors (stored as HSL values)
  primary_color TEXT DEFAULT '15 60% 65%',
  secondary_color TEXT DEFAULT '350 40% 92%',
  accent_color TEXT DEFAULT '38 70% 55%',
  background_color TEXT DEFAULT '30 30% 98%',
  foreground_color TEXT DEFAULT '20 20% 15%',
  muted_color TEXT DEFAULT '35 30% 94%',
  card_color TEXT DEFAULT '30 25% 97%',
  -- Typography
  font_family TEXT DEFAULT 'Vazirmatn',
  heading_font_family TEXT DEFAULT 'Vazirmatn',
  base_font_size TEXT DEFAULT '16px',
  heading_scale DECIMAL DEFAULT 1.25,
  -- Borders & Radius
  border_radius TEXT DEFAULT '0.75rem',
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read theme settings (needed for applying theme)
CREATE POLICY "Theme settings are publicly readable"
ON public.theme_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can modify theme settings
CREATE POLICY "Only admins can insert theme settings"
ON public.theme_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update theme settings"
ON public.theme_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete theme settings"
ON public.theme_settings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_theme_settings_updated_at
BEFORE UPDATE ON public.theme_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default theme settings
INSERT INTO public.theme_settings (
  primary_color,
  secondary_color,
  accent_color,
  background_color,
  foreground_color,
  muted_color,
  card_color,
  font_family,
  heading_font_family,
  base_font_size,
  heading_scale,
  border_radius
) VALUES (
  '15 60% 65%',
  '350 40% 92%',
  '38 70% 55%',
  '30 30% 98%',
  '20 20% 15%',
  '35 30% 94%',
  '30 25% 97%',
  'Vazirmatn',
  'Vazirmatn',
  '16px',
  1.25,
  '0.75rem'
);