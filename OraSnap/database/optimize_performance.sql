-- Add missing column if it doesn't exist
ALTER TABLE photographers ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0;
ALTER TABLE photographers ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add indexes for filtering performance
CREATE INDEX IF NOT EXISTS idx_photographers_country ON photographers(country);
CREATE INDEX IF NOT EXISTS idx_photographers_price ON photographers(price_per_hour);
CREATE INDEX IF NOT EXISTS idx_photographers_specialty ON photographers(specialty);
CREATE INDEX IF NOT EXISTS idx_photographers_rating ON photographers(rating);
CREATE INDEX IF NOT EXISTS idx_photographers_experience ON photographers(experience_years);
-- Gin index for array searching (tags)
CREATE INDEX IF NOT EXISTS idx_photographers_tags ON photographers USING gin(tags);

-- Enable pg_trgm extension for fuzzy search if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_photographers_name_trgm ON photographers USING gin (name gin_trgm_ops);

-- Optimized function for fetching photographers with filtering and pagination
CREATE OR REPLACE FUNCTION get_photographers_paginated(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_search TEXT DEFAULT NULL,
  p_specialty TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_min_price DECIMAL DEFAULT NULL,
  p_max_price DECIMAL DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'rating'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  specialty TEXT,
  location TEXT,
  country TEXT,
  price_per_hour DECIMAL,
  rating DECIMAL,
  review_count INTEGER,
  avatar_url TEXT,
  portfolio_images TEXT[],
  tags TEXT[],
  verification_status TEXT,
  experience_years INTEGER,
  total_count BIGINT
) AS $$
DECLARE
  v_search TEXT := TRIM(p_search);
BEGIN
  RETURN QUERY
  WITH filtered_photographers AS (
    SELECT 
      p.*
    FROM photographers p
    WHERE 
      p.status = 'approved' AND p.is_blocked = FALSE
      AND (p_specialty IS NULL OR p.specialty ILIKE '%' || p_specialty || '%')
      AND (p_country IS NULL OR p.country = p_country)
      AND (p_city IS NULL OR p.location ILIKE '%' || p_city || '%')
      AND (p_min_price IS NULL OR p.price_per_hour >= p_min_price)
      AND (p_max_price IS NULL OR p.price_per_hour <= p_max_price)
      AND (
        v_search IS NULL OR v_search = '' OR
        p.name ILIKE '%' || v_search || '%' OR
        p.specialty ILIKE '%' || v_search || '%' OR
        p.location ILIKE '%' || v_search || '%' OR
        EXISTS (SELECT 1 FROM unnest(p.tags) t WHERE t ILIKE '%' || v_search || '%')
      )
  )
  SELECT 
    fp.id,
    fp.name,
    fp.specialty,
    fp.location,
    fp.country,
    fp.price_per_hour,
    fp.rating,
    fp.review_count,
    fp.avatar_url,
    fp.portfolio_images,
    fp.tags,
    fp.verification_status,
    fp.experience_years,
    (SELECT COUNT(*) FROM filtered_photographers) as total_count
  FROM filtered_photographers fp
  ORDER BY
    CASE WHEN p_sort_by = 'price_low' THEN fp.price_per_hour END ASC,
    CASE WHEN p_sort_by = 'price_high' THEN fp.price_per_hour END DESC,
    CASE WHEN p_sort_by = 'rating' THEN fp.rating END DESC,
    CASE WHEN p_sort_by = 'reviews' THEN fp.review_count END DESC,
    CASE WHEN p_sort_by = 'experience' THEN fp.experience_years END DESC,
    CASE WHEN p_sort_by NOT IN ('price_low', 'price_high', 'rating', 'reviews', 'experience') THEN fp.rating END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
