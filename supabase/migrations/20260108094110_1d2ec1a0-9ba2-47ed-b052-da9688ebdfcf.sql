-- Add video_url column to portfolio table for video support
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS video_url text;

-- Create portfolio_categories table for dynamic categories
CREATE TABLE IF NOT EXISTS public.portfolio_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  color text DEFAULT '#6366f1',
  icon text DEFAULT 'folder',
  order_index integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on portfolio_categories
ALTER TABLE public.portfolio_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for portfolio_categories
CREATE POLICY "Anyone can view active categories" 
ON public.portfolio_categories 
FOR SELECT 
USING ((is_active = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage categories" 
ON public.portfolio_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create portfolio_reviews table for comments on portfolio items
CREATE TABLE IF NOT EXISTS public.portfolio_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id uuid NOT NULL REFERENCES public.portfolio(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on portfolio_reviews
ALTER TABLE public.portfolio_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for portfolio_reviews
CREATE POLICY "Anyone can view approved portfolio reviews" 
ON public.portfolio_reviews 
FOR SELECT 
USING ((is_approved = true) OR (auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create portfolio reviews" 
ON public.portfolio_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio reviews" 
ON public.portfolio_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio reviews" 
ON public.portfolio_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all portfolio reviews" 
ON public.portfolio_reviews 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add views_count and likes_count to portfolio
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;

-- Insert default categories
INSERT INTO public.portfolio_categories (name, slug, color, order_index) VALUES
  ('مو', 'hair', '#8B5CF6', 1),
  ('آرایش', 'makeup', '#EC4899', 2),
  ('ناخن', 'nail', '#F59E0B', 3),
  ('پوست', 'skin', '#10B981', 4)
ON CONFLICT (slug) DO NOTHING;

-- Create trigger for updated_at on portfolio_categories
CREATE TRIGGER update_portfolio_categories_updated_at
BEFORE UPDATE ON public.portfolio_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on portfolio_reviews
CREATE TRIGGER update_portfolio_reviews_updated_at
BEFORE UPDATE ON public.portfolio_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();