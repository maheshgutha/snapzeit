#!/usr/bin/env node
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

function makePhotographer(id, i, country = 'United States') {
  const samplePhotos = [
    'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519340333755-59a4a9f0c6b2?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1200&q=80&auto=format&fit=crop',
  ];

  return {
    id: String(id),
    name: `Mock Photographer ${i + 1}`,
    specialty: i % 2 === 0 ? 'Wedding' : 'Portrait',
    location: country,
    bio: 'Experienced photographer (mock data)',
    price_per_hour: 80 + i * 15,
    experience_years: 2 + i,
    rating: Math.max(3.8, 4.9 - (i * 0.12)),
    review_count: 5 + i * 3,
    avatar_url: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
    portfolio: [samplePhotos[i % samplePhotos.length]],
    tags: ['Mock', 'Local'],
    currency: 'USD',
    country,
  };
}

app.get('/', (req, res) => {
  res.send('SnapZeiT mock API running');
});

// RPC: get_public_photographers
app.post('/api/rpc/get_public_photographers', (req, res) => {
  const data = Array.from({ length: 12 }).map((_, i) => makePhotographer(i + 1, i));
  res.json({ data, error: null });
});

// RPC: get_photographers_paginated
app.post('/api/rpc/get_photographers_paginated', (req, res) => {
  const { p_limit = 12, p_offset = 0, p_country } = req.body || {};
  const country = p_country || 'United States';
  const limit = Number(p_limit) || 12;
  const offset = Number(p_offset) || 0;

  const items = Array.from({ length: limit }).map((_, i) => {
    const idx = offset + i;
    const obj = makePhotographer(idx + 1, idx, country);
    if (i === 0) obj.total_count = 100;
    return obj;
  });

  res.json({ data: items, error: null });
});

// Simple auth stubs
app.post('/api/auth/signup', (req, res) => {
  const { email } = req.body || {};
  const session = { access_token: 'mock-token', user: { id: 'user-1', email } };
  res.json({ data: { session }, error: null });
});

app.post('/api/auth/signin', (req, res) => {
  const { email } = req.body || {};
  const session = { access_token: 'mock-token', user: { id: 'user-1', email } };
  res.json({ data: { session }, error: null });
});

app.post('/api/auth/signout', (req, res) => {
  res.json({ data: { signed_out: true }, error: null });
});

app.get('/api/auth/session', (req, res) => {
  res.json({ data: { session: null }, error: null });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`SnapZeiT mock API listening on http://localhost:${PORT}`);
});
