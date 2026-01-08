-- Create table for storing custom site content
CREATE TABLE public.site_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key text NOT NULL,
  content_key text NOT NULL,
  content_type text NOT NULL DEFAULT 'text', -- text, image, html
  content_value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(page_key, content_key)
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read site content
CREATE POLICY "Anyone can view site content" 
ON public.site_content 
FOR SELECT 
USING (true);

-- Only admins can manage site content
CREATE POLICY "Admins can manage site content" 
ON public.site_content 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add visual_edit_enabled to salon_settings
ALTER TABLE public.salon_settings
ADD COLUMN IF NOT EXISTS visual_edit_enabled boolean DEFAULT false;