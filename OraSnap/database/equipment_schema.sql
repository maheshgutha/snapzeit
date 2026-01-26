-- =====================================================
-- EQUIPMENT RENTAL SCHEMA
-- =====================================================

-- 1. EQUIPMENT TABLE
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Null implies platform-owned
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Camera', 'Lens', 'Lighting', 'Drone', 'Accessory')),
  brand TEXT,
  model TEXT,
  description TEXT,
  daily_rate DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  location TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RENTAL BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS rental_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  renter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment(location);
CREATE INDEX IF NOT EXISTS idx_rental_bookings_renter_id ON rental_bookings(renter_id);
CREATE INDEX IF NOT EXISTS idx_rental_bookings_equipment_id ON rental_bookings(equipment_id);

-- Seeding some default gear (Platform Owned)
-- Note: owner_id is NULL
INSERT INTO equipment (name, category, brand, model, description, daily_rate, image_url, location) VALUES
('Sony A7III', 'Camera', 'Sony', 'A7III', 'Full frame mirrorless camera, perfect for low light.', 85.00, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'New York, NY'),
('Canon R5', 'Camera', 'Canon', 'EOS R5', 'High resolution professional mirrorless camera.', 120.00, 'https://images.unsplash.com/photo-1616423664057-a3794cd3cc16?w=800&q=80', 'Los Angeles, CA'),
('DJI Mavic 3', 'Drone', 'DJI', 'Mavic 3', 'Professional drone with Hasselblad camera.', 95.00, 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80', 'San Francisco, CA'),
('Sigma 24-70mm', 'Lens', 'Sigma', 'Art DG DN', 'Versatile zoom lens for E-mount.', 35.00, 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&q=80', 'New York, NY'),
('Godox AD200', 'Lighting', 'Godox', 'AD200 Pro', 'Portable pocket flash.', 25.00, 'https://images.unsplash.com/photo-1554048612-387768052bf7?w=800&q=80', 'Chicago, IL');
