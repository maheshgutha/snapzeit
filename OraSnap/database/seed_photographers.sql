-- =====================================================
-- SEED DATA FOR PHOTOGRAPHERS (ORASNAP)
-- Run this script in your Supabase SQL Editor to populate the database
-- =====================================================

-- 1. Wedding Photographer in New York
INSERT INTO photographers (
  id, name, email, specialty, location, country, price_per_hour, 
  bio, portfolio_images, rating, review_count, status, verification_status
) VALUES (
  uuid_generate_v4(), 
  'Elena Fisher', 
  'elena.fisher@orasnap.test', 
  'Wedding', 
  'New York, NY', 
  'United States', 
  250.00, 
  'Award-winning wedding photographer with a passion for capturing candid moments and raw emotions. Over 10 years of experience in luxury weddings across NYC and the Hamptons.', 
  ARRAY[
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', 
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    'https://images.unsplash.com/photo-1520854221256-17451cc330e7?w=800&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80'
  ], 
  4.9, 
  128, 
  'approved', 
  'verified'
);

-- 2. Portrait Photographer in London
INSERT INTO photographers (
  id, name, email, specialty, location, country, price_per_hour, 
  bio, portfolio_images, rating, review_count, status, verification_status
) VALUES (
  uuid_generate_v4(), 
  'Arthur Pendelton', 
  'arthur.p@orasnap.test', 
  'Portrait', 
  'London', 
  'United Kingdom', 
  180.00, 
  'Specializing in dramatic, cinematic portraits and corporate headshots. I help professionals and artists build their personal brand through powerful imagery.', 
  ARRAY[
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80', 
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'
  ], 
  4.8, 
  95, 
  'approved', 
  'verified'
);

-- 3. Fashion Photographer in Paris
INSERT INTO photographers (
  id, name, email, specialty, location, country, price_per_hour, 
  bio, portfolio_images, rating, review_count, status, verification_status
) VALUES (
  uuid_generate_v4(), 
  'Sophie Dubois', 
  'sophie.d@orasnap.test', 
  'Fashion', 
  'Paris', 
  'France', 
  350.00, 
  'Editorial and high-fashion photographer familiar with Paris Fashion Week. Available for lookbooks, brand campaigns, and model portfolios.', 
  ARRAY[
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', 
    'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=800&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80'
  ], 
  4.9, 
  210, 
  'approved', 
  'verified'
);

-- 4. Event Photographer in Tokyo
INSERT INTO photographers (
  id, name, email, specialty, location, country, price_per_hour, 
  bio, portfolio_images, rating, review_count, status, verification_status
) VALUES (
  uuid_generate_v4(), 
  'Kenji Tanaka', 
  'kenji.t@orasnap.test', 
  'Event', 
  'Tokyo', 
  'Japan', 
  200.00, 
  'Dynamic event photographer capturing the energy of corporate events, concerts, and festivals across Tokyo. Fast delivery guaranteed.', 
  ARRAY[
    'https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=800&q=80', 
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    'https://images.unsplash.com/photo-1475721027760-441639c60964?w=800&q=80'
  ], 
  4.7, 
  84, 
  'approved', 
  'verified'
);

-- 5. Wedding Photographer in Mumbai
INSERT INTO photographers (
  id, name, email, specialty, location, country, price_per_hour, 
  bio, portfolio_images, rating, review_count, status, verification_status
) VALUES (
  uuid_generate_v4(), 
  'Priya Patel', 
  'priya.p@orasnap.test', 
  'Wedding', 
  'Mumbai', 
  'India', 
  150.00, 
  'Traditional Indian wedding specialist. I understand the importance of every ritual and ceremony, ensuring your memories are preserved perfectly.', 
  ARRAY[
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80', 
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80',
    'https://images.unsplash.com/photo-1621621667797-e06afc217fb0?w=800&q=80'
  ], 
  4.9, 
  342, 
  'approved', 
  'verified'
);

-- 6. Commercial Photographer in Berlin
INSERT INTO photographers (
  id, name, email, specialty, location, country, price_per_hour, 
  bio, portfolio_images, rating, review_count, status, verification_status
) VALUES (
  uuid_generate_v4(), 
  'Lukas Weber', 
  'lukas.w@orasnap.test', 
  'Commercial', 
  'Berlin', 
  'Germany', 
  280.00, 
  'Product and commercial photographer helping brands tell their story. Expert in lighting and studio composition.', 
  ARRAY[
    'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80', 
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80'
  ], 
  4.8, 
  67, 
  'approved', 
  'verified'
);

-- 7. Lifestyle Photographer in Sydney
INSERT INTO photographers (
  id, name, email, specialty, location, country, price_per_hour, 
  bio, portfolio_images, rating, review_count, status, verification_status
) VALUES (
  uuid_generate_v4(), 
  'Jack Thompson', 
  'jack.t@orasnap.test', 
  'Lifestyle', 
  'Sydney', 
  'Australia', 
  220.00, 
  'Capturing the Australian way of life. Surfing, beach, and outdoor lifestyle photography for brands and magazines.', 
  ARRAY[
    'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=800&q=80', 
    'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=800&q=80'
  ], 
  4.7, 
  112, 
  'approved', 
  'verified'
);

-- 8. Food Photographer in Rome
INSERT INTO photographers (
  id, name, email, specialty, location, country, price_per_hour, 
  bio, portfolio_images, rating, review_count, status, verification_status
) VALUES (
  uuid_generate_v4(), 
  'Giulia Romano', 
  'giulia.r@orasnap.test', 
  'Food', 
  'Rome', 
  'Italy', 
  190.00, 
  'Culinary photographer working with top restaurants in Rome. I make food look as delicious as it tastes.', 
  ARRAY[
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80', 
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80'
  ], 
  4.9, 
  156, 
  'approved', 
  'verified'
);

-- 9. Sport Photographer in Toronto
INSERT INTO photographers (
  id, name, email, specialty, location, country, price_per_hour, 
  bio, portfolio_images, rating, review_count, status, verification_status
) VALUES (
  uuid_generate_v4(), 
  'Mike Ross', 
  'mike.r@orasnap.test', 
  'Sports', 
  'Toronto', 
  'Canada', 
  210.00, 
  'Action sports photographer specializing in hockey, basketball, and extreme sports.', 
  ARRAY[
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80', 
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80'
  ], 
  4.6, 
  58, 
  'approved', 
  'verified'
);

-- 10. Maternity Photographer in Los Angeles
INSERT INTO photographers (
  id, name, email, specialty, location, country, price_per_hour, 
  bio, portfolio_images, rating, review_count, status, verification_status
) VALUES (
  uuid_generate_v4(), 
  'Sarah Jenkins', 
  'sarah.j@orasnap.test', 
  'Maternity', 
  'Los Angeles, CA', 
  'United States', 
  275.00, 
  'Warm and artistic maternity and newborn photography in natural light. Helping families cherish their new beginnings.', 
  ARRAY[
    'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80', 
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80'
  ], 
  4.9, 
  203, 
  'approved', 
  'verified'
);
