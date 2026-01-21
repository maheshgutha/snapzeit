-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'photographer');

-- Create user_roles table (SECURITY: separate from profiles)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create photographers table
CREATE TABLE public.photographers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    specialty TEXT NOT NULL,
    location TEXT NOT NULL,
    bio TEXT,
    price_per_hour NUMERIC NOT NULL,
    experience_years INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    avatar_url TEXT,
    portfolio TEXT[] DEFAULT '{}',
    availability JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved photographers"
ON public.photographers FOR SELECT
USING (status = 'approved');

CREATE POLICY "Photographers can view own pending profile"
ON public.photographers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Photographers can insert own profile"
ON public.photographers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Photographers can update own profile"
ON public.photographers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all photographers"
ON public.photographers FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage photographers"
ON public.photographers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create bookings table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    photographer_id UUID REFERENCES public.photographers(id) ON DELETE CASCADE NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT NOT NULL,
    event_type TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    total_amount NUMERIC NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_date TIMESTAMPTZ,
    commission_rate NUMERIC DEFAULT 0.15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
ON public.bookings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Photographers can view their bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.photographers 
    WHERE id = photographer_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Photographers can update their bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.photographers 
    WHERE id = photographer_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all bookings"
ON public.bookings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    photographer_id UUID REFERENCES public.photographers(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create reviews for completed bookings"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create messages table for chat
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their bookings"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE id = booking_id AND (user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.photographers WHERE id = photographer_id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Users can send messages for their bookings"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE id = booking_id AND (user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.photographers WHERE id = photographer_id AND user_id = auth.uid()))
  )
);

-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_photographers_updated_at
BEFORE UPDATE ON public.photographers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update photographer rating
CREATE OR REPLACE FUNCTION public.update_photographer_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.photographers
    SET 
        rating = (SELECT COALESCE(AVG(rating), 5) FROM public.reviews WHERE photographer_id = NEW.photographer_id),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE photographer_id = NEW.photographer_id)
    WHERE id = NEW.photographer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_rating_on_review
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_photographer_rating();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email
    );
    
    -- Add default user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Seed sample photographers
INSERT INTO public.photographers (name, email, specialty, location, bio, price_per_hour, experience_years, rating, review_count, portfolio, tags, status) VALUES
('Sarah Johnson', 'sarah@example.com', 'Wedding Photography', 'New York, NY', 'Award-winning wedding photographer with a passion for capturing authentic moments. I specialize in documentary-style photography.', 250, 8, 4.9, 127, ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552', 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92'], ARRAY['Wedding', 'Engagement', 'Couples'], 'approved'),
('Marcus Chen', 'marcus@example.com', 'Portrait Photography', 'Los Angeles, CA', 'Creative portrait photographer focused on bringing out the best in every individual.', 180, 5, 4.8, 89, ARRAY['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'], ARRAY['Portrait', 'Headshot', 'Fashion'], 'approved'),
('Emma Rodriguez', 'emma@example.com', 'Event Photography', 'Chicago, IL', 'Dynamic event photographer specializing in corporate events, parties, and celebrations.', 200, 6, 4.7, 156, ARRAY['https://images.unsplash.com/photo-1540575467063-178a50c2df87', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622'], ARRAY['Corporate', 'Party', 'Conference'], 'approved'),
('David Kim', 'david@example.com', 'Commercial Photography', 'San Francisco, CA', 'Professional commercial photographer with expertise in product, food, and brand photography.', 300, 10, 4.9, 203, ARRAY['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'], ARRAY['Product', 'Food', 'Brand'], 'approved'),
('Priya Sharma', 'priya@example.com', 'Fashion Photography', 'Miami, FL', 'Fashion and lifestyle photographer bringing creative vision to every shoot.', 275, 7, 4.8, 94, ARRAY['https://images.unsplash.com/photo-1469334031218-e382a71b716b', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f'], ARRAY['Fashion', 'Lifestyle', 'Editorial'], 'approved'),
('James Wilson', 'james@example.com', 'Sports Photography', 'Denver, CO', 'Action sports photographer capturing peak moments and athletic excellence.', 225, 9, 4.6, 178, ARRAY['https://images.unsplash.com/photo-1461896836934- voices8b76cc', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5'], ARRAY['Sports', 'Action', 'Athletes'], 'approved');