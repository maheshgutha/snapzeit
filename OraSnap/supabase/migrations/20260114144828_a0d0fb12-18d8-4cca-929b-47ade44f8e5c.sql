-- Create table for storing generated captions
CREATE TABLE public.generated_captions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photographer_id UUID NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_thumbnail TEXT,
  captions_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_captions ENABLE ROW LEVEL SECURITY;

-- Policy: Photographers can view their own captions
CREATE POLICY "Photographers can view own captions"
ON public.generated_captions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.photographers
    WHERE photographers.id = generated_captions.photographer_id
    AND photographers.user_id = auth.uid()
  )
);

-- Policy: Photographers can insert their own captions
CREATE POLICY "Photographers can insert own captions"
ON public.generated_captions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.photographers
    WHERE photographers.id = generated_captions.photographer_id
    AND photographers.user_id = auth.uid()
  )
);

-- Policy: Photographers can delete their own captions
CREATE POLICY "Photographers can delete own captions"
ON public.generated_captions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.photographers
    WHERE photographers.id = generated_captions.photographer_id
    AND photographers.user_id = auth.uid()
  )
);

-- Add index for faster lookups
CREATE INDEX idx_generated_captions_photographer ON public.generated_captions(photographer_id);
CREATE INDEX idx_generated_captions_created ON public.generated_captions(created_at DESC);