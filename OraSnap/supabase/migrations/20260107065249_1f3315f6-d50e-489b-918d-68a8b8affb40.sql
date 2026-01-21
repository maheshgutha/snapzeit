-- Step 1: Add currency and country columns to photographers table
ALTER TABLE public.photographers 
ADD COLUMN currency text NOT NULL DEFAULT 'USD',
ADD COLUMN country text;