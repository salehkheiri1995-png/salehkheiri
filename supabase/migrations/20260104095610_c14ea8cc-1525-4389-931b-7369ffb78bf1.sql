-- Create shipping_methods table for managing delivery options
CREATE TABLE public.shipping_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- Anyone can view active shipping methods
CREATE POLICY "Anyone can view active shipping methods"
ON public.shipping_methods
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage shipping methods
CREATE POLICY "Admins can manage shipping methods"
ON public.shipping_methods
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_shipping_methods_updated_at
BEFORE UPDATE ON public.shipping_methods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add shipping_method_id to orders table
ALTER TABLE public.orders ADD COLUMN shipping_method_id UUID REFERENCES public.shipping_methods(id);

-- Insert default shipping method
INSERT INTO public.shipping_methods (name, price, description) VALUES 
('ارسال معمولی', 50000, 'ارسال طی ۳ تا ۵ روز کاری'),
('ارسال اکسپرس', 100000, 'ارسال طی ۱ تا ۲ روز کاری'),
('تحویل حضوری', 0, 'دریافت حضوری از فروشگاه');