-- Create portfolio table for gallery/portfolio items
CREATE TABLE public.portfolio (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

-- Anyone can view active portfolio items
CREATE POLICY "Anyone can view active portfolio items"
ON public.portfolio
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'));

-- Admins can manage portfolio
CREATE POLICY "Admins can manage portfolio"
ON public.portfolio
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_portfolio_updated_at
BEFORE UPDATE ON public.portfolio
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();