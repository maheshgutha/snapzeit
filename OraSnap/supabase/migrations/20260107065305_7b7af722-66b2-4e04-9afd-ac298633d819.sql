-- Drop and recreate functions with new columns
DROP FUNCTION IF EXISTS public.get_public_photographers();
DROP FUNCTION IF EXISTS public.get_public_photographer(uuid);

CREATE FUNCTION public.get_public_photographers()
RETURNS TABLE(
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
  tags text[],
  currency text,
  country text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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
    tags,
    currency,
    country
  FROM public.photographers
  WHERE status = 'approved'
$$;

CREATE FUNCTION public.get_public_photographer(photographer_id uuid)
RETURNS TABLE(
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
  tags text[],
  currency text,
  country text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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
    tags,
    currency,
    country
  FROM public.photographers
  WHERE id = photographer_id AND status = 'approved'
$$;