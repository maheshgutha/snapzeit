#!/usr/bin/env node
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

function makePhotographer(id, i, country = 'United States') {
  const samplePhotos = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
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

let mockCurrentUserEmail = '';

app.post('/api/auth/signin', (req, res) => {
  const { email } = req.body || {};
  mockCurrentUserEmail = email;
  const session = { access_token: 'mock-token', user: { id: 'user-1', email } };
  res.json({ data: { session }, error: null });
});

app.post('/api/auth/signup', (req, res) => {
  const { email } = req.body || {};
  mockCurrentUserEmail = email;
  const session = { access_token: 'mock-token', user: { id: 'user-1', email } };
  res.json({ data: { session }, error: null });
});

app.post('/api/auth/signout', (req, res) => {
  res.json({ data: { signed_out: true }, error: null });
});

app.get('/api/auth/session', (req, res) => {
  res.json({ data: { session: null }, error: null });
});

// Mock Roles endpoint for local dev
app.get('/api/rest/v1/user_roles', (req, res) => {
  if (mockCurrentUserEmail.includes('admin')) {
    res.json({ data: [{ role: 'admin' }], error: null });
  } else if (mockCurrentUserEmail.includes('photo') || mockCurrentUserEmail.includes('elena') || mockCurrentUserEmail.includes('arthur')) {
    res.json({ data: [{ role: 'photographer' }], error: null });
  } else {
    res.json({ data: [{ role: 'user' }], error: null });
  }
});

// Generic DB mock for both /api/db/:table and /api/rest/v1/:table
const tables = {
  messages: [
    {
      id: '1',
      sender_id: 'photographer-1',
      receiver_id: 'user-1',
      subject: "Welcome",
      content: "Hi! Thanks for your interest in my photography services.",
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      is_read: true
    },
    {
      id: '2',
      sender_id: 'user-1',
      receiver_id: 'photographer-1',
      subject: "Wedding Inquiry",
      content: "Hello! I'm looking for a wedding photographer for next month.",
      created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      is_read: true
    }
  ],
  favorites: [],
  reviews: [
    {
      id: '1',
      photographer_id: '1',
      user_id: 'user-2',
      user_name: 'Customer 1',
      rating: 5,
      comment: 'Amazing photographer! Very professional and delivered exactly what we wanted.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    }
  ]
};

app.get(['/api/rest/v1/:table', '/api/db/:table'], (req, res) => {
  const table = req.params.table;
  let data = tables[table] || [];

  // Simple filtering based on query params (like Supabase eq)
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'select' || key === 'order' || key === 'limit' || key === 'offset' || key === 'single') continue;
    
    if (typeof value === 'string' && value.startsWith('eq.')) {
      const val = value.substring(3);
      data = data.filter(item => String(item[key]) === val);
    }
  }

  // Handle order
  if (req.query.order) {
    const [col, dir] = String(req.query.order).split('.');
    data = [...data].sort((a, b) => {
      if (a[col] < b[col]) return dir === 'asc' ? -1 : 1;
      if (a[col] > b[col]) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  if (req.query.single === 'true') {
    return res.json({ data: data.length > 0 ? data[0] : null, error: null });
  }
  
  res.json({ data, error: null });
});

app.post(['/api/rest/v1/:table', '/api/db/:table'], (req, res) => {
  const table = req.params.table;
  if (!tables[table]) tables[table] = [];
  
  const newItem = { id: Date.now().toString(), created_at: new Date().toISOString(), ...req.body };
  tables[table].push(newItem);
  
  res.json({ data: newItem, error: null });
});

app.delete(['/api/rest/v1/:table', '/api/db/:table'], (req, res) => {
  const table = req.params.table;
  if (tables[table]) {
    // If there is an ID eq filter
    let idToDelete = null;
    for (const [key, value] of Object.entries(req.query)) {
      if (key === 'id' && typeof value === 'string' && value.startsWith('eq.')) {
        idToDelete = value.substring(3);
        break;
      }
    }
    
    if (idToDelete) {
      tables[table] = tables[table].filter(item => String(item.id) !== idToDelete);
    }
  }
  res.json({ data: null, error: null });
});

app.patch(['/api/rest/v1/:table', '/api/db/:table'], (req, res) => {
  res.json({ data: [req.body], error: null });
});

app.listen(PORT, () => {
  console.log(`SnapZeiT mock API listening on http://localhost:${PORT}`);
});
