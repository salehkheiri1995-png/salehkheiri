-- =====================================================
-- SUPABASE STORAGE BUCKET SETUP
-- =====================================================

-- ۱. Storage Bucket ایجاد کن
-- (این کار را در Supabase Console انجام بده)
-- Storage → New Bucket
-- Name: course-images
-- Public: YES

-- ۲. RLS Policies برای storage
-- (SQL Editor میرو)

-- Policy برای SELECT (مشاهده عکس‌ها)
CREATE POLICY "Public course-images read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'course-images');

-- Policy برای INSERT (آپلود عکس)
CREATE POLICY "Public course-images insert" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'course-images');

-- Policy برای UPDATE
CREATE POLICY "Public course-images update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'course-images')
  WITH CHECK (bucket_id = 'course-images');

-- Policy برای DELETE
CREATE POLICY "Public course-images delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'course-images');

-- ۳. Courses جدول اگر نیاز باشه
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  price INTEGER DEFAULT 0,
  original_price INTEGER,
  duration_hours INTEGER,
  instructor_name TEXT,
  level TEXT,
  course_type TEXT,
  students_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ۴. Course Lessons جدول
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS برای جداول
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Courses are viewable by everyone" ON public.courses
  FOR SELECT USING (true);

CREATE POLICY "Courses can be created by authenticated users" ON public.courses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Courses can be updated by authenticated users" ON public.courses
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Courses can be deleted by authenticated users" ON public.courses
  FOR DELETE USING (auth.role() = 'authenticated');

-- Course Lessons policies
CREATE POLICY "Lessons are viewable by everyone" ON public.course_lessons
  FOR SELECT USING (true);

CREATE POLICY "Lessons can be created by authenticated users" ON public.course_lessons
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Lessons can be updated by authenticated users" ON public.course_lessons
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Lessons can be deleted by authenticated users" ON public.course_lessons
  FOR DELETE USING (auth.role() = 'authenticated');