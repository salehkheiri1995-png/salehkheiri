-- Add foreign key relationship between course_enrollments and profiles
ALTER TABLE public.course_enrollments
ADD CONSTRAINT course_enrollments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;