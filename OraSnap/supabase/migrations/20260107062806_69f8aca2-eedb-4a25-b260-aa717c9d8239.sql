-- Drop the current public read policy
DROP POLICY IF EXISTS "Anyone can view approved photographers" ON public.photographers;

-- Create policy for authenticated users to view all approved photographer data
CREATE POLICY "Authenticated users can view approved photographers"
ON public.photographers
FOR SELECT
TO authenticated
USING (status = 'approved');

-- Create a secure function to get public photographer data (without sensitive info)
CREATE OR REPLACE FUNCTION public.get_public_photographers()
RETURNS TABLE (
  id uuid,
  name text,
  specialty text,
  location text,
  bio text,
  price_per_hour numeric,
  experience_years integer,
  rating numeric,
  review_count integer,
  avatar_url text,
  portfolio text[],
  tags text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    name,
    specialty,
    location,
    bio,
    price_per_hour,
    experience_years,
    rating,
    review_count,
    avatar_url,
    portfolio,
    tags
  FROM public.photographers
  WHERE status = 'approved'
$$;

-- Create a function to get a single public photographer by ID
CREATE OR REPLACE FUNCTION public.get_public_photographer(photographer_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  specialty text,
  location text,
  bio text,
  price_per_hour numeric,
  experience_years integer,
  rating numeric,
  review_count integer,
  avatar_url text,
  portfolio text[],
  tags text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    name,
    specialty,
    location,
    bio,
    price_per_hour,
    experience_years,
    rating,
    review_count,
    avatar_url,
    portfolio,
    tags
  FROM public.photographers
  WHERE id = photographer_id AND status = 'approved'
$$;