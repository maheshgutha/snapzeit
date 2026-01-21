-- Update the default commission rate from 15% to 5%
ALTER TABLE public.bookings 
ALTER COLUMN commission_rate SET DEFAULT 0.05;