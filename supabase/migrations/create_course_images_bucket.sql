-- Create the course-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-images', 'course-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public course-images access" ON storage.objects
FOR SELECT
USING (bucket_id = 'course-images');

-- Allow authenticated users to upload
CREATE POLICY "Course images upload" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'course-images');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Course images update" ON storage.objects
FOR UPDATE
USING (bucket_id = 'course-images');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Course images delete" ON storage.objects
FOR DELETE
USING (bucket_id = 'course-images');
