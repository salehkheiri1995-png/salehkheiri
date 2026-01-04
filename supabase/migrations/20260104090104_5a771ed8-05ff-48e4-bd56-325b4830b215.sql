-- Create course_enrollments table for tracking user course purchases
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress_percent INTEGER DEFAULT 0,
  last_watched_lesson_id UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  payment_status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create course_lessons table for course content
CREATE TABLE public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson_progress table for tracking user progress
CREATE TABLE public.lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  watched_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create salon_settings table for admin settings
CREATE TABLE public.salon_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_name TEXT NOT NULL DEFAULT 'سالن زیبایی',
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  instagram_url TEXT,
  telegram_url TEXT,
  whatsapp TEXT,
  working_hours TEXT,
  about_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_settings ENABLE ROW LEVEL SECURITY;

-- RLS for course_enrollments
CREATE POLICY "Users can view own enrollments" ON public.course_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own enrollments" ON public.course_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments" ON public.course_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all enrollments" ON public.course_enrollments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS for course_lessons
CREATE POLICY "Anyone can view free lessons" ON public.course_lessons
  FOR SELECT USING (is_free = true);

CREATE POLICY "Enrolled users can view course lessons" ON public.course_lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments
      WHERE course_enrollments.course_id = course_lessons.course_id
      AND course_enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage lessons" ON public.course_lessons
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS for lesson_progress
CREATE POLICY "Users can manage own progress" ON public.lesson_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON public.lesson_progress
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS for salon_settings
CREATE POLICY "Anyone can view salon settings" ON public.salon_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage salon settings" ON public.salon_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert default salon settings
INSERT INTO public.salon_settings (salon_name) VALUES ('سالن زیبایی');

-- Create triggers for updated_at
CREATE TRIGGER update_course_enrollments_updated_at
  BEFORE UPDATE ON public.course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON public.course_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salon_settings_updated_at
  BEFORE UPDATE ON public.salon_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();