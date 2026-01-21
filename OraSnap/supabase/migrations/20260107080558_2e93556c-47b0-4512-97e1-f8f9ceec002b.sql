-- Enable realtime for admin dashboard tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.photographers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;