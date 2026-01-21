-- Add block_reason column to profiles table
ALTER TABLE public.profiles ADD COLUMN block_reason text;

-- Add block_reason column to photographers table for consistency
ALTER TABLE public.photographers ADD COLUMN block_reason text;