import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGO_URI;
const mongoDbName = process.env.MONGO_DB_NAME || 'snapzeit'; // existing data lives in the 'snapzeit' db

if (!mongoUri) {
  console.error("MONGO_URI is not set. Create a .env file (see .env.example) with your MongoDB connection string.");
  process.exit(1);
}

// High-quality seed data
const profiles = [
  {
    _id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    user_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    full_name: "Super Admin",
    email: "admin@snapzeit.com",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    phone: "+15550100",
    city: "New York",
    is_blocked: false,
    notify_booking_updates: true,
    notify_booking_reminders: true,
    notify_promotions: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: "u1u1u1u1-u1u1-u1u1-u1u1-u1u1u1u1u1u1",
    user_id: "u1u1u1u1-u1u1-u1u1-u1u1-u1u1u1u1u1u1",
    full_name: "John Doe",
    email: "john.doe@snapzeit.test",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    phone: "+15550200",
    city: "London",
    is_blocked: false,
    notify_booking_updates: true,
    notify_booking_reminders: true,
    notify_promotions: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const userRoles = [
  {
    _id: "r1-admin",
    user_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    role: "admin",
    created_at: new Date()
  },
  {
    _id: "r2-user",
    user_id: "u1u1u1u1-u1u1-u1u1-u1u1-u1u1u1u1u1u1",
    role: "user",
    created_at: new Date()
  }
];

const photographers = [
  {
    _id: "p1-elena",
    user_id: "u-elena-id",
    name: 'Elena Fisher', 
    email: 'elena.fisher@snapzeit.test', 
    specialty: 'Wedding', 
    location: 'New York, NY', 
    country: 'United States', 
    price_per_hour: 250.00, 
    bio: 'Award-winning wedding photographer with a passion for capturing candid moments and raw emotions. Over 10 years of experience in luxury weddings across NYC and the Hamptons.', 
    portfolio_images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', 
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
      'https://images.unsplash.com/photo-1520854221256-17451cc330e7?w=800&q=80',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80'
    ], 
    rating: 4.9, 
    review_count: 128, 
    status: 'approved', 
    is_blocked: false,
    verification_status: 'verified',
    experience_years: 10,
    tags: ['Candid', 'Natural Light', 'Creative'],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: "p2-arthur",
    user_id: "u-arthur-id",
    name: 'Arthur Pendelton', 
    email: 'arthur.p@snapzeit.test', 
    specialty: 'Portrait', 
    location: 'London', 
    country: 'United Kingdom', 
    price_per_hour: 180.00, 
    bio: 'Specializing in dramatic, cinematic portraits and corporate headshots. I help professionals and artists build their personal brand through powerful imagery.', 
    portfolio_images: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80', 
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'
    ], 
    rating: 4.8, 
    review_count: 95, 
    status: 'approved', 
    is_blocked: false,
    verification_status: 'verified',
    experience_years: 8,
    tags: ['Studio', 'Modern', 'Dramatic'],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: "p3-sophie",
    user_id: "u-sophie-id",
    name: 'Sophie Dubois', 
    email: 'sophie.d@snapzeit.test', 
    specialty: 'Fashion', 
    location: 'Paris', 
    country: 'France', 
    price_per_hour: 350.00, 
    bio: 'Editorial and high-fashion photographer familiar with Paris Fashion Week. Available for lookbooks, brand campaigns, and model portfolios.', 
    portfolio_images: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', 
      'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=800&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80'
    ], 
    rating: 4.9, 
    review_count: 210, 
    status: 'approved', 
    is_blocked: false,
    verification_status: 'verified',
    experience_years: 12,
    tags: ['Editorial', 'Creative', 'Modern'],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: "p4-kenji",
    user_id: "u-kenji-id",
    name: 'Kenji Tanaka', 
    email: 'kenji.t@snapzeit.test', 
    specialty: 'Event', 
    location: 'Tokyo', 
    country: 'Japan', 
    price_per_hour: 200.00, 
    bio: 'Dynamic event photographer capturing the energy of corporate events, concerts, and festivals across Tokyo. Fast delivery guaranteed.', 
    portfolio_images: [
      'https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=800&q=80', 
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
      'https://images.unsplash.com/photo-1475721027760-441639c60964?w=800&q=80'
    ], 
    rating: 4.7, 
    review_count: 84, 
    status: 'approved', 
    is_blocked: false,
    verification_status: 'verified',
    experience_years: 6,
    tags: ['Candid', 'Documentary', 'Vintage'],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: "p5-priya",
    user_id: "u-priya-id",
    name: 'Priya Patel', 
    email: 'priya.p@snapzeit.test', 
    specialty: 'Wedding', 
    location: 'Mumbai', 
    country: 'India', 
    price_per_hour: 150.00, 
    bio: 'Traditional Indian wedding specialist. I understand the importance of every ritual and ceremony, ensuring your memories are preserved perfectly.', 
    portfolio_images: [
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80', 
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80',
      'https://images.unsplash.com/photo-1621621667797-e06afc217fb0?w=800&q=80'
    ], 
    rating: 4.9, 
    review_count: 342, 
    status: 'approved', 
    is_blocked: false,
    verification_status: 'verified',
    experience_years: 15,
    tags: ['Traditional', 'Creative', 'Natural Light'],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: "p6-sarah",
    user_id: "u-sarah-id",
    name: 'Sarah Jenkins', 
    email: 'sarah.j@snapzeit.test', 
    specialty: 'Maternity', 
    location: 'Los Angeles, CA', 
    country: 'United States', 
    price_per_hour: 275.00, 
    bio: 'Warm and artistic maternity and newborn photography in natural light. Helping families cherish their new beginnings.', 
    portfolio_images: [
      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80', 
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80'
    ], 
    rating: 4.9, 
    review_count: 203, 
    status: 'approved', 
    is_blocked: false,
    verification_status: 'verified',
    experience_years: 9,
    tags: ['Lifestyle', 'Natural Light', 'Fine Art'],
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Add their profiles
photographers.forEach(p => {
  profiles.push({
    _id: p.user_id,
    user_id: p.user_id,
    full_name: p.name,
    email: p.email,
    avatar_url: p.portfolio_images[0],
    phone: "+15550300",
    city: p.location,
    is_blocked: false,
    notify_booking_updates: true,
    notify_booking_reminders: true,
    notify_promotions: true,
    created_at: new Date(),
    updated_at: new Date()
  });

  userRoles.push({
    _id: `r-${p._id}`,
    user_id: p.user_id,
    role: "photographer",
    created_at: new Date()
  });
});

const equipment = [
  {
    _id: "eq1-sony",
    photographer_id: "p1-elena",
    name: 'Sony A7III', 
    category: 'Camera', 
    brand: 'Sony',
    model: 'A7III',
    description: 'Full frame mirrorless camera, perfect for low light.', 
    rental_price_per_day: 85.00, 
    rental_price_per_hour: 15.00,
    daily_rate: 85.00,
    currency: 'USD',
    location: 'New York, NY',
    is_available: true,
    stock_quantity: 2,
    available_quantity: 2,
    condition: 'excellent',
    insurance_required: false,
    deposit_amount: 100.00,
    image_urls: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'],
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: "eq2-canon",
    photographer_id: "p2-arthur",
    name: 'Canon R5', 
    category: 'Camera', 
    brand: 'Canon',
    model: 'EOS R5',
    description: 'High resolution professional mirrorless camera.', 
    rental_price_per_day: 120.00, 
    rental_price_per_hour: 20.00,
    daily_rate: 120.00,
    currency: 'USD',
    location: 'London, UK',
    is_available: true,
    stock_quantity: 1,
    available_quantity: 1,
    condition: 'excellent',
    insurance_required: true,
    deposit_amount: 200.00,
    image_urls: ['https://images.unsplash.com/photo-1616423664057-a3794cd3cc16?w=800&q=80'],
    image_url: 'https://images.unsplash.com/photo-1616423664057-a3794cd3cc16?w=800&q=80',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: "eq3-dji",
    photographer_id: "p3-sophie",
    name: 'DJI Mavic 3', 
    category: 'Drone', 
    brand: 'DJI',
    model: 'Mavic 3',
    description: 'Professional drone with Hasselblad camera.', 
    rental_price_per_day: 95.00, 
    rental_price_per_hour: 18.00,
    daily_rate: 95.00,
    currency: 'USD',
    location: 'Paris, France',
    is_available: true,
    stock_quantity: 1,
    available_quantity: 1,
    condition: 'excellent',
    insurance_required: true,
    deposit_amount: 150.00,
    image_urls: ['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80'],
    image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const refundPolicies = [
  {
    _id: "ref-standard",
    policy_type: "standard",
    name: "Standard Refund Policy",
    description: "Full refund if cancelled 7+ days before event",
    refund_percentage: 100,
    days_before_event: 7,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: "ref-flexible",
    policy_type: "flexible",
    name: "Flexible Refund Policy",
    description: "Full refund up to 24 hours before event",
    refund_percentage: 100,
    days_before_event: 1,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const platformSettings = [
  {
    _id: "set-site-name",
    setting_key: "site_name",
    setting_value: "SnapZeiT",
    description: "Platform name",
    is_public: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: "set-site-description",
    setting_key: "site_description",
    setting_value: "Professional Photography Booking Platform",
    description: "Platform description",
    is_public: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: "set-contact-email",
    setting_key: "contact_email",
    setting_value: "support@snapzeit.com",
    description: "Contact email",
    is_public: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const reviews = [
  {
    _id: "rev1",
    booking_id: "b1",
    user_id: "u1u1u1u1-u1u1-u1u1-u1u1-u1u1u1u1u1u1",
    photographer_id: "p1-elena",
    rating: 5,
    comment: "Elena was absolutely fantastic! The photos are jaw-droppingly beautiful, and she caught so many intimate candid moments without being intrusive at all. Will absolutely hire again!",
    is_moderated: true,
    moderation_status: "approved",
    reviewer_type: "customer",
    created_at: new Date()
  },
  {
    _id: "rev2",
    booking_id: "b2",
    user_id: "u1u1u1u1-u1u1-u1u1-u1u1-u1u1u1u1u1u1",
    photographer_id: "p2-arthur",
    rating: 4,
    comment: "Arthur created incredibly professional corporate headshots for our entire leadership team. Fast turnaround and wonderful cinematic lighting.",
    is_moderated: true,
    moderation_status: "approved",
    reviewer_type: "customer",
    created_at: new Date()
  }
];

const announcements = [
  {
    _id: "ann1",
    title: "Welcome to the New SnapZeiT!",
    content: "We have fully migrated our backend to MongoDB for blistering speed, higher uptime, and richer search filters. Enjoy booking professional creatives worldwide!",
    type: "success",
    target_audience: "all",
    is_active: true,
    created_at: new Date()
  }
];

async function main() {
  const mongoClient = new MongoClient(mongoUri);

  try {
    await mongoClient.connect();
    const db = mongoClient.db(mongoDbName);
    console.log(`Connected to MongoDB: ${mongoDbName}`);

    // Map of collection name to data array
    const dataMap = {
      profiles,
      user_roles: userRoles,
      photographers,
      equipment,
      refund_policies: refundPolicies,
      platform_settings: platformSettings,
      reviews,
      announcements
    };

    for (const [collectionName, dataArray] of Object.entries(dataMap)) {
      console.log(`Seeding collection: ${collectionName}`);
      const collection = db.collection(collectionName);
      
      // Clear existing records
      await collection.deleteMany({});
      
      // Insert new records
      if (dataArray.length > 0) {
        await collection.insertMany(dataArray);
        console.log(`  Successfully inserted ${dataArray.length} record(s) into '${collectionName}'.`);
      } else {
        console.log(`  No records to insert for '${collectionName}'.`);
      }
    }

    console.log('\nDatabase seeding complete! Your MongoDB collections are fully set up.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoClient.close();
  }
}

main();