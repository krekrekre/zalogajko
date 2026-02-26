-- Storage: allow authenticated users to upload to recipe-images bucket.
-- Create the bucket in Dashboard (Storage → New bucket → name: recipe-images, Public: yes) if it doesn't exist.
-- Run this in Supabase SQL Editor (migrations may not apply to storage schema in all setups).

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Authenticated can upload recipe images" ON storage.objects;
DROP POLICY IF EXISTS "Public read recipe images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update recipe images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete recipe images" ON storage.objects;

-- Allow authenticated uploads (user's own folder: path must start with auth.uid())
CREATE POLICY "Authenticated can upload recipe images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recipe-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read (for getPublicUrl)
CREATE POLICY "Public read recipe images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'recipe-images');

-- Allow authenticated users to update/delete their own uploads
CREATE POLICY "Authenticated can update recipe images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'recipe-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated can delete recipe images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recipe-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
