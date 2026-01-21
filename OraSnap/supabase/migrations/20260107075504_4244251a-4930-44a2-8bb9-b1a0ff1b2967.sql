-- Add is_blocked column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;

-- Add is_blocked column to photographers table  
ALTER TABLE public.photographers ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;

-- Create index for faster queries on blocked status
CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON public.profiles(is_blocked);
CREATE INDEX IF NOT EXISTS idx_photographers_is_blocked ON public.photographers(is_blocked);

-- Update RLS policy for photographers to exclude blocked ones from public view
DROP POLICY IF EXISTS "Authenticated users can view approved photographers" ON public.photographers;
CREATE POLICY "Authenticated users can view approved photographers" 
  ON public.photographers 
  FOR SELECT 
  TO authenticated
  USING (status = 'approved' AND is_blocked = false);

-- Update the get_public_photographers function to exclude blocked photographers
CREATE OR REPLACE FUNCTION public.get_public_photographers()
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
AS $function$
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
  WHERE status = 'approved' AND is_blocked = false
$function$;

-- Update the get_public_photographer function to exclude blocked photographers
CREATE OR REPLACE FUNCTION public.get_public_photographer(photographer_id uuid)
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
AS $function$
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
  WHERE id = photographer_id AND status = 'approved' AND is_blocked = false
$function$;