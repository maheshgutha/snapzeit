// Full sample-data seed: 6 login-ready accounts (2 admin, 2 client, 2
// photographer) plus a booking, rental booking, lead, message thread,
// notifications, a favorite, and a review — so every major screen has
// real data to show immediately after logging in.
//
// Standalone: does not require migrate_supabase_to_mongodb.js to have run
// first. Safe to re-run: every document is upserted by _id, nothing is
// deleted, so it won't wipe data you've since created through the app.
//
// Run: node --env-file=.env scripts/seed.js

import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const mongoUri = process.env.MONGO_URI;
const mongoDbName = process.env.MONGO_DB_NAME || 'snapzeit';

if (!mongoUri) {
  console.error('MONGO_URI is not set. Check your .env file.');
  process.exit(1);
}

const PASSWORD = 'Test@1234'; // login password for every seeded account below

async function upsertMany(db, collName, docs) {
  const coll = db.collection(collName);
  for (const doc of docs) {
    await coll.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });
  }
  console.log(`Upserted ${docs.length} doc(s) into '${collName}'.`);
}

async function main() {
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(mongoDbName);
  console.log(`Connected to MongoDB: ${mongoDbName}`);

  const now = new Date();
  const hashed = await bcrypt.hash(PASSWORD, 10);

  // ---- 1. Accounts: profiles + user_roles --------------------------------
  const profiles = [
    { _id: 'admin-1', user_id: 'admin-1', full_name: 'Admin One', email: 'admin1@snapzeit.test', hashed_password: hashed, is_blocked: false, city: 'New York', created_at: now, updated_at: now },
    { _id: 'admin-2', user_id: 'admin-2', full_name: 'Admin Two', email: 'admin2@snapzeit.test', hashed_password: hashed, is_blocked: false, city: 'London', created_at: now, updated_at: now },
    { _id: 'client-1', user_id: 'client-1', full_name: 'Client One', email: 'client1@snapzeit.test', hashed_password: hashed, is_blocked: false, city: 'New York', created_at: now, updated_at: now },
    { _id: 'client-2', user_id: 'client-2', full_name: 'Client Two', email: 'client2@snapzeit.test', hashed_password: hashed, is_blocked: false, city: 'London', created_at: now, updated_at: now },
    // user_id matches the photographers seeded below, so logging in as
    // these accounts shows a real, populated photographer dashboard.
    { _id: 'u-elena-id', user_id: 'u-elena-id', full_name: 'Elena Fisher', email: 'elena.fisher@snapzeit.test', hashed_password: hashed, is_blocked: false, city: 'New York', created_at: now, updated_at: now },
    { _id: 'u-arthur-id', user_id: 'u-arthur-id', full_name: 'Arthur Pendelton', email: 'arthur.p@snapzeit.test', hashed_password: hashed, is_blocked: false, city: 'London', created_at: now, updated_at: now },
  ];
  await upsertMany(db, 'profiles', profiles);

  const roles = [
    { _id: 'role-admin-1', user_id: 'admin-1', role: 'admin', created_at: now },
    { _id: 'role-admin-2', user_id: 'admin-2', role: 'admin', created_at: now },
    { _id: 'role-client-1', user_id: 'client-1', role: 'user', created_at: now },
    { _id: 'role-client-2', user_id: 'client-2', role: 'user', created_at: now },
    { _id: 'role-elena', user_id: 'u-elena-id', role: 'photographer', created_at: now },
    { _id: 'role-arthur', user_id: 'u-arthur-id', role: 'photographer', created_at: now },
  ];
  await upsertMany(db, 'user_roles', roles);

  // ---- 2. Photographers ----------------------------------------------------
  const photographers = [
    {
      _id: 'p1-elena', user_id: 'u-elena-id', name: 'Elena Fisher', email: 'elena.fisher@snapzeit.test',
      specialty: 'Wedding', location: 'New York, NY', country: 'United States', price_per_hour: 250.00,
      bio: 'Award-winning wedding photographer specializing in candid, natural-light storytelling.',
      portfolio_images: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
      ],
      rating: 4.9, review_count: 1, status: 'approved', is_blocked: false, verification_status: 'verified',
      experience_years: 10, tags: ['Candid', 'Natural Light'], created_at: now, updated_at: now,
    },
    {
      _id: 'p2-arthur', user_id: 'u-arthur-id', name: 'Arthur Pendelton', email: 'arthur.p@snapzeit.test',
      specialty: 'Portrait', location: 'London', country: 'United Kingdom', price_per_hour: 180.00,
      bio: 'Cinematic portrait and corporate headshot photographer.',
      portfolio_images: [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
      ],
      rating: 4.8, review_count: 0, status: 'approved', is_blocked: false, verification_status: 'verified',
      experience_years: 8, tags: ['Studio', 'Dramatic'], created_at: now, updated_at: now,
    },
  ];
  await upsertMany(db, 'photographers', photographers);

  // ---- 3. Equipment ----------------------------------------------------
  // NOTE: seeded with daily_rate / image_url / location / is_available —
  // the fields RentalBookingModal.tsx, Rentals.tsx, and the rental-booking
  // route in server/app.js actually read. (The older migrate script used
  // rental_price_per_day / image_urls, which the live UI does not read —
  // that mismatch is why seeded equipment there shows no price/image.)
  const equipment = [
    {
      _id: 'eq1-sony', photographer_id: 'p1-elena', name: 'Sony A7III', category: 'Camera', brand: 'Sony', model: 'A7III',
      description: 'Full frame mirrorless camera, great in low light.', daily_rate: 85.00, currency: 'USD',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
      location: 'New York, NY', is_available: true, created_at: now, updated_at: now,
    },
    {
      _id: 'eq2-canon', photographer_id: 'p2-arthur', name: 'Canon R5', category: 'Camera', brand: 'Canon', model: 'EOS R5',
      description: 'High resolution professional mirrorless camera.', daily_rate: 120.00, currency: 'USD',
      image_url: 'https://images.unsplash.com/photo-1616423664057-a3794cd3cc16?w=800&q=80',
      location: 'London, UK', is_available: true, created_at: now, updated_at: now,
    },
  ];
  await upsertMany(db, 'equipment', equipment);

  // ---- 4. A confirmed, paid booking: client-1 <-> Elena --------------------
  await upsertMany(db, 'bookings', [{
    _id: 'booking-demo-1', user_id: 'client-1', photographer_id: 'p1-elena',
    booking_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), duration_hours: 4, event_type: 'Portrait Session',
    notes: 'Seeded demo booking for testing', status: 'confirmed', payment_status: 'paid',
    total_amount: 1000, platform_fee: 50, photographer_payout: 950, currency: 'USD',
    created_at: now, updated_at: now,
  }]);

  // ---- 5. A confirmed rental booking: client-2 <-> Elena's Sony A7III -------
  await upsertMany(db, 'rental_bookings', [{
    _id: 'rental-demo-1', equipment_id: 'eq1-sony', equipment_name: 'Sony A7III',
    renter_id: 'client-2', user_id: 'client-2',
    start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    duration_days: 2, total_price: 170.00, currency: 'USD',
    contact_name: 'Client Two', contact_email: 'client2@snapzeit.test', contact_phone: '',
    notes: 'Seeded demo rental for testing', status: 'confirmed', payment_status: 'paid',
    created_at: now, updated_at: now,
  }]);

  // ---- 6. An open lead posted by client-2 -----------------------------------
  await upsertMany(db, 'leads', [{
    _id: 'lead-demo-1', user_id: 'client-2', service_type: 'Wedding', location: 'London',
    event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    budget_range: '$1000-2000', description: 'Seeded demo lead — looking for a wedding photographer.',
    contact_number: '+15550999', contact_name: 'Client Two', status: 'open', created_at: now,
  }]);

  // ---- 7. A message thread tied to the demo booking --------------------
  await upsertMany(db, 'messages', [
    {
      _id: 'msg-demo-1', sender_id: 'client-1', recipient_id: 'u-elena-id',
      subject: 'Booking confirmation', content: 'Hi Elena, excited for the shoot next week!',
      is_read: true, created_at: new Date(now.getTime() - 60 * 60 * 1000),
    },
    {
      _id: 'msg-demo-2', sender_id: 'u-elena-id', recipient_id: 'client-1',
      subject: 'Re: Booking confirmation', content: 'Looking forward to it! I\'ll bring extra lighting gear.',
      is_read: false, created_at: now,
    },
  ]);

  // ---- 8. Notifications -----------------------------------------------
  await upsertMany(db, 'notifications', [
    { _id: 'notif-demo-1', user_id: 'client-1', title: 'Booking confirmed', message: 'Your session with Elena Fisher is confirmed.', type: 'success', read: false, created_at: now },
    { _id: 'notif-demo-2', user_id: 'u-elena-id', title: 'New booking', message: 'Client One booked a Portrait Session with you.', type: 'info', read: false, created_at: now },
    { _id: 'notif-demo-3', user_id: 'client-2', title: 'Rental confirmed', message: 'Your Sony A7III rental is confirmed.', type: 'success', read: true, created_at: now },
  ]);

  // ---- 9. A favorite: client-1 favorited Elena --------------------------
  await upsertMany(db, 'favorites', [{
    _id: 'fav-demo-1', user_id: 'client-1', photographer_id: 'p1-elena', created_at: now,
  }]);

  // ---- 10. A review, using the fields ReviewModal.tsx actually inserts -----
  await upsertMany(db, 'reviews', [{
    _id: 'review-demo-1', booking_id: 'booking-demo-1', photographer_id: 'p1-elena', user_id: 'client-1',
    user_name: 'Client One', rating: 5, comment: 'Seeded demo review — fantastic experience!',
    created_at: now,
  }]);

  // ---- 11. Platform-wide content: announcements, settings, refund policy ---
  await upsertMany(db, 'announcements', [{
    _id: 'ann-demo-1', title: 'Welcome to SnapZeiT', message: 'Seeded demo announcement.',
    type: 'success', target_audience: 'all', is_active: true, created_at: now,
  }]);
  await upsertMany(db, 'platform_settings', [{
    _id: 'commission_rate', key: 'commission_rate', value: 5, updated_at: now,
  }]);
  await upsertMany(db, 'refund_policies', [{
    _id: 'refund-policy-default', title: 'Standard Refund Policy',
    description: 'Full refund if cancelled 48+ hours before the session; 50% within 48 hours.',
    is_active: true, created_at: now,
  }]);

  console.log(`\nDone. Every account below logs in with password: ${PASSWORD}`);
  console.log('admin1@snapzeit.test / admin2@snapzeit.test (admin)');
  console.log('client1@snapzeit.test / client2@snapzeit.test (client)');
  console.log('elena.fisher@snapzeit.test / arthur.p@snapzeit.test (photographer)');

  await client.close();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});