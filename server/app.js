import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { authorizeRead, sanitizeReadDocs, authorizeInsert, authorizeMutation, isAdmin } from './acl.js';

const app = express();
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (IS_PRODUCTION && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production — refusing to start with the built-in development secret.');
}
const JWT_SECRET = process.env.JWT_SECRET || 'snapzeit-super-secret-key-for-local-development-2026';
const MONGO_URI = process.env.MONGO_URI;
// Note: the database name stays 'snapzeit' — existing data lives there.
// Override with MONGO_DB_NAME if you migrate to a new database.
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'snapzeit';

if (!MONGO_URI) {
  console.error('MONGO_URI is not set. Create a .env file (see .env.example) with your MongoDB connection string.');
}

// In production set CORS_ORIGIN to your site origin(s), comma-separated.
const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : '*';
app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey', 'x-client-info']
}));
app.use(express.json({ limit: '4mb' }));

// Rate limits: tight on auth (credential stuffing), generous elsewhere.
app.use('/api/auth/', rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, limit: 1000, standardHeaders: true, legacyHeaders: false }));

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

let db;

// Local-dev-only workaround for TLS/SSL handshake errors on Windows with
// Node.js 18+ and OpenSSL 3.x. Never disable certificate validation in production.
if (!IS_PRODUCTION) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const mongoClient = MONGO_URI ? new MongoClient(MONGO_URI, {
  tls: true,
  tlsInsecure: !IS_PRODUCTION,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
}) : null;

async function configureIndexes() {
  try {
    console.log("Configuring database indexes...");
    // 1. Unique email index for profiles
    await db.collection('profiles').createIndex({ email: 1 }, { unique: true });
    await db.collection('profiles').createIndex({ user_id: 1 });

    // 2. Specialty & location index for fast photographer lookups
    await db.collection('photographers').createIndex({ status: 1, is_blocked: 1 });
    await db.collection('photographers').createIndex({ specialty: 1, location: 1 });

    // 3. User roles index
    await db.collection('user_roles').createIndex({ user_id: 1 });

    // 4. Bookings & rentals search performance
    await db.collection('bookings').createIndex({ photographer_id: 1, booking_date: 1 });
    await db.collection('rental_bookings').createIndex({ equipment_id: 1 });

    console.log("Database indexes verified successfully.");
  } catch (err) {
    console.warn("Index configuration warning:", err.message);
  }
}

function createMockDb() {
  // Lightweight in-memory mock DB for development when Mongo is unavailable.
  // Supports the query shapes the app + ACL actually produce:
  // equality, $regex, $in, $ne, $gt(e)/$lt(e), $all, and nested $and/$or.
  const matchesCondition = (docValue, cond) => {
    if (cond !== null && typeof cond === 'object' && !Array.isArray(cond)) {
      if ('$regex' in cond) {
        const re = new RegExp(cond.$regex, cond.$options || 'i');
        return re.test(docValue || '');
      }
      if ('$in' in cond) return cond.$in.includes(docValue);
      if ('$ne' in cond) return docValue !== cond.$ne;
      if ('$gt' in cond) return docValue > cond.$gt;
      if ('$gte' in cond) return docValue >= cond.$gte;
      if ('$lt' in cond) return docValue < cond.$lt;
      if ('$lte' in cond) return docValue <= cond.$lte;
      if ('$all' in cond) return Array.isArray(docValue) && cond.$all.every(x => docValue.includes(x));
      if ('$elemMatch' in cond) return Array.isArray(docValue) && docValue.some(x => matchesCondition(x, cond.$elemMatch));
      return false;
    }
    return docValue === cond;
  };

  const matchesQuery = (doc, query) => {
    for (const [k, val] of Object.entries(query || {})) {
      if (k === '$and') {
        if (!val.every(sub => matchesQuery(doc, sub))) return false;
      } else if (k === '$or') {
        if (!val.some(sub => matchesQuery(doc, sub))) return false;
      } else if (!matchesCondition(doc[k], val)) {
        return false;
      }
    }
    return true;
  };

  const createCollection = () => {
    const docs = new Map();
    return {
      async findOne(query) {
        for (const v of docs.values()) {
          if (matchesQuery(v, query)) return v;
        }
        return null;
      },
      find(query = {}) {
        const results = [];
        for (const v of docs.values()) {
          if (matchesQuery(v, query)) results.push({ ...v });
        }
        return {
          sort() { return this; },
          skip() { return this; },
          limit() { return this; },
          async toArray() { return results; }
        };
      },
      async insertOne(doc) { const id = doc._id || crypto.randomUUID(); const d = { ...doc, _id: id }; docs.set(id, d); return { insertedId: id }; },
      async insertMany(arr) { const inserted = []; for (const doc of arr) { const id = doc._id || crypto.randomUUID(); const d = { ...doc, _id: id }; docs.set(id, d); inserted.push(d); } return { insertedCount: inserted.length }; },
      async updateOne(query, update) {
        const found = await this.findOne(query);
        if (!found) return { matchedCount: 0, modifiedCount: 0 };
        const id = found._id;
        const updated = { ...found, ...(update.$set || {}) };
        docs.set(id, updated);
        return { matchedCount: 1, modifiedCount: 1 };
      },
      async updateMany(query, update) {
        const items = await this.find(query).toArray();
        for (const it of items) {
          const id = it._id;
          const updated = { ...it, ...(update.$set || {}) };
          docs.set(id, updated);
        }
        return { matchedCount: items.length, modifiedCount: items.length };
      },
      async deleteMany(query) {
        const items = await this.find(query).toArray();
        for (const it of items) docs.delete(it._id);
        return { deletedCount: items.length };
      },
      async countDocuments(query) { const items = await this.find(query).toArray(); return items.length; },
      async createIndex() { return; }
    };
  };

  const memory = {};
  return {
    collection(name) {
      if (!memory[name]) memory[name] = createCollection();
      return memory[name];
    }
  };
}

let connectPromise = null;

async function connectToMongo() {
  // Cache the connection attempt so repeated calls (e.g. from a serverless
  // handler on every invocation) reuse the same connection instead of
  // reconnecting or racing each other.
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    if (!mongoClient) {
      console.warn('Falling back to in-memory mock database for development. Data will NOT persist across restarts.');
      db = createMockDb();
      return;
    }

    try {
      await mongoClient.connect();
      db = mongoClient.db(MONGO_DB_NAME);
      console.log(`Connected to MongoDB database: ${MONGO_DB_NAME}`);
      await configureIndexes();
    } catch (err) {
      console.error("Failed to connect to MongoDB:", err);
      console.warn('Falling back to in-memory mock database for development. Data will NOT persist across restarts.');
      db = createMockDb();
    }
  })();

  return connectPromise;
}

// Client-side code queries by `id`, but Mongo documents are keyed on `_id`
// (and not all documents carry a duplicate `id` field), so map the key.
function mongoField(key) {
  return key === 'id' ? '_id' : key;
}

// Parse a single "column.op.value" clause (PostgREST style) into a Mongo condition
function parseOrClause(clause) {
  const [rawColumn, op, ...rest] = clause.split('.');
  const column = mongoField(rawColumn);
  const rawVal = rest.join('.');
  const cast = (v) => (v === 'true' ? true : v === 'false' ? false : v);

  switch (op) {
    case 'eq': return { [column]: cast(rawVal) };
    case 'neq': return { [column]: { $ne: cast(rawVal) } };
    case 'like':
    case 'ilike': return { [column]: { $regex: rawVal.replace(/%/g, ''), $options: 'i' } };
    case 'gt': return { [column]: { $gt: Number(rawVal) || rawVal } };
    case 'lt': return { [column]: { $lt: Number(rawVal) || rawVal } };
    case 'gte': return { [column]: { $gte: Number(rawVal) || rawVal } };
    case 'lte': return { [column]: { $lte: Number(rawVal) || rawVal } };
    default: return { [column]: cast(rawVal) };
  }
}

// Helper to parse query parameters (e.g. email=eq.test@gmail.com, is_blocked=eq.false)
function buildMongoQuery(queryParams) {
  const query = {};
  for (const [rawKey, val] of Object.entries(queryParams)) {
    // Skip special parameters
    if (['select', 'order', 'limit', 'single', 'offset'].includes(rawKey)) continue;

    if (rawKey === 'or' && typeof val === 'string') {
      query.$or = val.split(',').map(parseOrClause);
      continue;
    }

    const key = mongoField(rawKey);

    if (typeof val === 'string') {
      if (val.startsWith('eq.')) {
        const rawVal = val.substring(3);
        // Cast boolean strings
        if (rawVal === 'true') query[key] = true;
        else if (rawVal === 'false') query[key] = false;
        else query[key] = rawVal;
      } else if (val.startsWith('neq.')) {
        const rawVal = val.substring(4);
        query[key] = { $ne: rawVal === 'true' ? true : rawVal === 'false' ? false : rawVal };
      } else if (val.startsWith('is.')) {
        const rawVal = val.substring(3);
        if (rawVal === 'null') query[key] = null;
      } else if (val.startsWith('like.')) {
        const rawVal = val.substring(5).replace(/%/g, '');
        query[key] = { $regex: rawVal, $options: 'i' };
      } else if (val.startsWith('ilike.')) {
        const rawVal = val.substring(6).replace(/%/g, '');
        query[key] = { $regex: rawVal, $options: 'i' };
      } else if (val.startsWith('cs.')) {
        // Contains subset (array check in postgres e.g., tags=cs.{Modern})
        const arrayVal = val.substring(3).replace(/[\{\}]/g, '').split(',');
        query[key] = { $all: arrayVal };
      } else if (val.startsWith('in.')) {
        // e.g. user_id=in.(id1,id2,id3)
        const arrayVal = val.substring(3).replace(/[\(\)]/g, '').split(',').filter(Boolean);
        query[key] = { $in: arrayVal };
      } else if (val.startsWith('gt.')) {
        query[key] = { $gt: Number(val.substring(3)) || val.substring(3) };
      } else if (val.startsWith('lt.')) {
        query[key] = { $lt: Number(val.substring(3)) || val.substring(3) };
      } else if (val.startsWith('gte.')) {
        query[key] = { $gte: Number(val.substring(4)) || val.substring(4) };
      } else if (val.startsWith('lte.')) {
        query[key] = { $lte: Number(val.substring(4)) || val.substring(4) };
      } else {
        query[key] = val;
      }
    } else {
      query[key] = val;
    }
  }
  return query;
}

// Extract JWT token user session
function authenticateToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Express middleware: only admins may pass.
function requireAdmin(req, res, next) {
  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ data: null, error: { message: 'Authentication required' } });
  if (!isAdmin(user)) return res.status(403).json({ data: null, error: { message: 'Admin access required' } });
  req.user = user;
  next();
}

// -------------------------------------------------------------------
// 1. AUTHENTICATION ROUTER
// -------------------------------------------------------------------
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, data } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: { message: "Email and password are required" } });
  }

  try {
    const profilesColl = db.collection('profiles');
    const rolesColl = db.collection('user_roles');

    const existingUser = await profilesColl.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: { message: "User already exists" } });
    }

    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newProfile = {
      _id: userId,
      user_id: userId,
      full_name: data?.full_name || email.split('@')[0],
      email: email.toLowerCase(),
      hashed_password: hashedPassword,
      avatar_url: data?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
      phone: data?.phone || "",
      city: data?.city || "",
      is_blocked: false,
      notify_booking_updates: true,
      notify_booking_reminders: true,
      notify_promotions: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    await profilesColl.insertOne(newProfile);

    // Only non-privileged roles may be chosen at signup — never 'admin'.
    const role = ['user', 'photographer'].includes(data?.role) ? data.role : 'user';
    const newRole = {
      _id: crypto.randomUUID(),
      user_id: userId,
      role: role,
      created_at: new Date()
    };
    await rolesColl.insertOne(newRole);

    const token = jwt.sign({ userId, email, roles: [role] }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      data: {
        user: {
          id: userId,
          email: email.toLowerCase(),
          user_metadata: data || {}
        },
        session: {
          access_token: token,
          token_type: "bearer",
          expires_in: 604800,
          refresh_token: crypto.randomBytes(30).toString('hex'),
          user: {
            id: userId,
            email: email.toLowerCase(),
            user_metadata: data || {}
          }
        }
      },
      error: null
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: { message: err.message } });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: { message: "Email and password are required" } });
  }

  try {
    const profilesColl = db.collection('profiles');
    const rolesColl = db.collection('user_roles');

    const profile = await profilesColl.findOne({ email: email.toLowerCase() });
    if (!profile) {
      return res.status(400).json({ error: { message: "Invalid email or password" } });
    }

    let passwordMatches = false;
    if (profile.hashed_password) {
      passwordMatches = await bcrypt.compare(password, profile.hashed_password);
    } else if (!IS_PRODUCTION) {
      // Local dev only: seeded accounts without a hashed password accept "password123".
      passwordMatches = (password === 'password123');
    }

    if (!passwordMatches) {
      return res.status(400).json({ error: { message: "Invalid email or password" } });
    }

    if (profile.is_blocked) {
      return res.status(403).json({ error: { message: `Account blocked: ${profile.block_reason || 'No reason specified'}` } });
    }

    const rolesList = await rolesColl.find({ user_id: profile.user_id }).toArray();
    const roles = rolesList.map(r => r.role);

    const token = jwt.sign({ userId: profile.user_id, email: profile.email, roles }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      data: {
        user: {
          id: profile.user_id,
          email: profile.email,
          user_metadata: {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url
          }
        },
        session: {
          access_token: token,
          token_type: "bearer",
          expires_in: 604800,
          refresh_token: crypto.randomBytes(30).toString('hex'),
          user: {
            id: profile.user_id,
            email: profile.email,
            user_metadata: {
              full_name: profile.full_name,
              avatar_url: profile.avatar_url
            }
          }
        }
      },
      error: null
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: { message: err.message } });
  }
});

// Emulate getting session from token
app.get('/api/auth/session', async (req, res) => {
  const sessionUser = authenticateToken(req);
  if (!sessionUser) {
    return res.json({ data: { session: null }, error: null });
  }

  try {
    const profile = await db.collection('profiles').findOne({ user_id: sessionUser.userId });
    if (!profile) {
      return res.json({ data: { session: null }, error: null });
    }

    res.json({
      data: {
        session: {
          access_token: req.headers['authorization']?.split(' ')[1],
          token_type: "bearer",
          user: {
            id: profile.user_id,
            email: profile.email,
            user_metadata: {
              full_name: profile.full_name,
              avatar_url: profile.avatar_url
            }
          }
        }
      },
      error: null
    });
  } catch (err) {
    res.json({ data: { session: null }, error: err.message });
  }
});

app.post('/api/auth/signout', (req, res) => {
  res.json({ error: null });
});

// ---- Password reset -------------------------------------------------------

// Send email via Resend or SendGrid REST APIs (whichever key is configured).
// Returns false when no provider is configured.
async function sendEmail({ to, subject, html }) {
  const from = process.env.EMAIL_FROM || 'SnapZeiT <onboarding@resend.dev>';

  if (process.env.RESEND_API_KEY) {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!resp.ok) console.error('Resend email failed:', await resp.text());
    return resp.ok;
  }

  if (process.env.SENDGRID_API_KEY) {
    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.EMAIL_FROM || 'noreply@snapzeit.com' },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });
    if (!resp.ok) console.error('SendGrid email failed:', await resp.text());
    return resp.ok;
  }

  return false;
}

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

app.post('/api/auth/request-password-reset', async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ data: null, error: { message: 'Email is required' } });
  }

  // Always answer the same way so the endpoint can't be used to probe which
  // emails have accounts.
  const genericResponse = { data: { message: 'If that email has an account, a reset link has been sent.' }, error: null };

  try {
    const profile = await db.collection('profiles').findOne({ email: email.toLowerCase() });
    if (!profile) return res.json(genericResponse);

    const token = crypto.randomBytes(32).toString('hex');
    await db.collection('password_resets').insertOne({
      _id: hashToken(token),
      user_id: profile.user_id,
      expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      created_at: new Date(),
    });

    const appUrl = process.env.APP_URL || (Array.isArray(corsOrigins) ? corsOrigins[0] : 'http://localhost:8080');
    const resetLink = `${appUrl}/auth/reset?token=${token}`;

    const sent = await sendEmail({
      to: profile.email,
      subject: 'Reset your SnapZeiT password',
      html: `<p>Hi ${profile.full_name || ''},</p>
             <p>Click the link below to reset your SnapZeiT password. It expires in 1 hour.</p>
             <p><a href="${resetLink}">${resetLink}</a></p>
             <p>If you didn't request this, you can ignore this email.</p>`,
    });

    if (!sent) {
      if (IS_PRODUCTION) {
        console.error('Password reset requested but no email provider configured (set RESEND_API_KEY or SENDGRID_API_KEY).');
      } else {
        // Local dev without an email provider: print the link so the flow is testable.
        console.log(`[dev] Password reset link for ${profile.email}: ${resetLink}`);
        return res.json({ data: { message: 'Email not configured — reset link printed to the server console.', dev_reset_token: token }, error: null });
      }
    }

    return res.json(genericResponse);
  } catch (err) {
    console.error('Password reset request error:', err);
    return res.json(genericResponse);
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) {
    return res.status(400).json({ data: null, error: { message: 'Token and new password are required' } });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ data: null, error: { message: 'Password must be at least 8 characters' } });
  }

  try {
    const resetsColl = db.collection('password_resets');
    const record = await resetsColl.findOne({ _id: hashToken(token) });

    if (!record || new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ data: null, error: { message: 'This reset link is invalid or has expired. Please request a new one.' } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection('profiles').updateOne(
      { user_id: record.user_id },
      { $set: { hashed_password: hashedPassword, updated_at: new Date() } }
    );
    await resetsColl.deleteMany({ user_id: record.user_id });

    return res.json({ data: { message: 'Password updated. You can now sign in.' }, error: null });
  } catch (err) {
    console.error('Password reset error:', err);
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// Update the current user's password and/or profile metadata
app.post('/api/auth/update-user', async (req, res) => {
  const sessionUser = authenticateToken(req);
  if (!sessionUser) {
    return res.status(401).json({ data: null, error: { message: 'Not authenticated' } });
  }

  try {
    const { password, data } = req.body;
    const profilesColl = db.collection('profiles');
    const update = { updated_at: new Date() };

    if (password) {
      update.hashed_password = await bcrypt.hash(password, 10);
    }
    if (data?.full_name !== undefined) update.full_name = data.full_name;
    if (data?.avatar_url !== undefined) update.avatar_url = data.avatar_url;

    await profilesColl.updateOne({ user_id: sessionUser.userId }, { $set: update });

    const profile = await profilesColl.findOne({ user_id: sessionUser.userId });
    res.json({
      data: {
        user: {
          id: sessionUser.userId,
          email: sessionUser.email,
          user_metadata: {
            full_name: profile?.full_name,
            avatar_url: profile?.avatar_url,
          },
        },
      },
      error: null,
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ data: null, error: { message: err.message } });
  }
});


// -------------------------------------------------------------------
// 2. RPC (STORED PROCEDURES) EMULATION
// -------------------------------------------------------------------
app.post('/api/rpc/get_public_photographers', async (req, res) => {
  try {
    const photographersColl = db.collection('photographers');
    const list = await photographersColl.find({
      status: 'approved',
      is_blocked: false
    })
    .sort({ rating: -1, review_count: -1 })
    .toArray();

    // Map _id to id
    const mapped = list.map(item => ({
      ...item,
      id: item._id
    }));

    res.json({ data: mapped, error: null });
  } catch (err) {
    console.error("RPC get_public_photographers error:", err);
    res.status(500).json({ data: null, error: err.message });
  }
});

app.post('/api/rpc/get_photographers_paginated', async (req, res) => {
  const {
    p_limit = 20,
    p_offset = 0,
    p_search = null,
    p_specialty = null,
    p_country = null,
    p_city = null,
    p_min_price = null,
    p_max_price = null,
    p_sort_by = 'rating'
  } = req.body;

  try {
    const photographersColl = db.collection('photographers');

    // Build the query matching the ILIKE logic of postgres
    const query = {
      status: 'approved',
      is_blocked: false
    };

    if (p_specialty) {
      query.specialty = { $regex: p_specialty, $options: 'i' };
    }

    if (p_country) {
      query.country = p_country;
    }

    if (p_city) {
      query.location = { $regex: p_city, $options: 'i' };
    }

    if (p_min_price !== null || p_max_price !== null) {
      query.price_per_hour = {};
      if (p_min_price !== null) query.price_per_hour.$gte = Number(p_min_price);
      if (p_max_price !== null) query.price_per_hour.$lte = Number(p_max_price);
    }

    if (p_search) {
      const searchRegex = { $regex: p_search.trim(), $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { specialty: searchRegex },
        { location: searchRegex },
        { tags: { $elemMatch: searchRegex } }
      ];
    }

    // Perform aggregate count
    const totalCount = await photographersColl.countDocuments(query);

    // Build sort options
    let sort = {};
    if (p_sort_by === 'price_low') sort.price_per_hour = 1;
    else if (p_sort_by === 'price_high') sort.price_per_hour = -1;
    else if (p_sort_by === 'rating') sort.rating = -1;
    else if (p_sort_by === 'reviews') sort.review_count = -1;
    else if (p_sort_by === 'experience') sort.experience_years = -1;
    else sort.rating = -1; // Default

    const list = await photographersColl.find(query)
      .sort(sort)
      .skip(Number(p_offset) || 0)
      .limit(Number(p_limit) || 20)
      .toArray();

    const mapped = list.map(item => ({
      ...item,
      id: item._id,
      total_count: totalCount
    }));

    res.json({ data: mapped, error: null });
  } catch (err) {
    console.error("RPC get_photographers_paginated error:", err);
    res.status(500).json({ data: null, error: err.message });
  }
});


// Recalculate a photographer's rating/review_count from the reviews collection.
// Clients call this after submitting a review instead of writing rating directly
// (direct rating writes are blocked by the ACL to prevent rating manipulation).
app.post('/api/rpc/recalc_photographer_rating', async (req, res) => {
  const sessionUser = authenticateToken(req);
  if (!sessionUser) {
    return res.status(401).json({ data: null, error: { message: 'Authentication required' } });
  }

  const { photographer_id } = req.body || {};
  if (!photographer_id) {
    return res.status(400).json({ data: null, error: { message: 'photographer_id is required' } });
  }

  try {
    const reviews = await db.collection('reviews')
      .find({ photographer_id, moderation_status: { $ne: 'rejected' } })
      .toArray();

    const count = reviews.length;
    const average = count > 0
      ? Math.round((reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / count) * 100) / 100
      : 0;

    await db.collection('photographers').updateOne(
      { _id: photographer_id },
      { $set: { rating: average, review_count: count, updated_at: new Date() } }
    );

    res.json({ data: { photographer_id, rating: average, review_count: count }, error: null });
  } catch (err) {
    console.error('RPC recalc_photographer_rating error:', err);
    res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// -------------------------------------------------------------------
// 9. PAYMENTS - Razorpay Order Creation (Server-side)
// -------------------------------------------------------------------
app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ data: null, error: { message: 'Amount is required' } });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ data: null, error: { message: 'Razorpay keys not configured on server' } });
    }

    // Razorpay API expects amount in paise (smallest currency unit)
    const orderBody = {
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
    };

    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify(orderBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay order creation failed:', data);
      return res.status(response.status).json({ data: null, error: data });
    }

    res.json({ data, error: null });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ data: null, error: err.message || String(err) });
  }
});

// Verify Razorpay signature (client-side confirmation)
app.post('/api/payments/verify-signature', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ data: null, error: { message: 'Missing parameters for signature verification' } });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ data: null, error: { message: 'Server missing Razorpay secret key' } });
    }

    const expected = crypto.createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected === razorpay_signature) {
      return res.json({ data: { verified: true }, error: null });
    }

    return res.status(400).json({ data: { verified: false }, error: { message: 'Signature mismatch' } });
  } catch (err) {
    console.error('Verify signature error:', err);
    return res.status(500).json({ data: null, error: { message: err.message || String(err) } });
  }
});

// Create booking after verifying Razorpay signature (server-side booking creation)
app.post('/api/payments/create-booking', async (req, res) => {
  try {
    const sessionUser = authenticateToken(req);
    if (!sessionUser) {
      return res.status(401).json({ data: null, error: { message: 'Authentication required' } });
    }

    const { booking, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!booking || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ data: null, error: { message: 'Missing booking or payment parameters' } });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ data: null, error: { message: 'Server missing Razorpay secret key' } });
    }

    const expected = crypto.createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ data: null, error: { message: 'Signature mismatch' } });
    }

    const bookingsColl = db.collection('bookings');

    const now = new Date();
    const bookingDoc = {
      ...booking,
      user_id: sessionUser.userId, // booking always belongs to the paying user
      payment_status: 'paid',
      payment_intent_id: razorpay_payment_id,
      payment_order_id: razorpay_order_id,
      status: booking.status || 'confirmed',
      created_at: now,
      updated_at: now
    };

    if (!bookingDoc._id && bookingDoc.id) bookingDoc._id = bookingDoc.id;
    if (!bookingDoc._id) bookingDoc._id = crypto.randomUUID();

    await bookingsColl.insertOne(bookingDoc);

    return res.json({ data: { ...bookingDoc, id: bookingDoc._id }, error: null });
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ data: null, error: { message: err.message || String(err) } });
  }
});

// Webhook endpoint for Razorpay events (use RAZORPAY_WEBHOOK_SECRET)
app.post('/api/payments/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const payload = req.body;
    const raw = payload instanceof Buffer ? payload.toString('utf8') : JSON.stringify(payload);

    if (!webhookSecret) {
      if (IS_PRODUCTION) {
        // Never process unverified payment events in production — an attacker
        // could mark bookings as paid.
        console.error('Webhook received but RAZORPAY_WEBHOOK_SECRET is not configured. Rejecting.');
        return res.status(503).send('webhook_secret_not_configured');
      }
      console.warn('Webhook received but no RAZORPAY_WEBHOOK_SECRET configured. Skipping verification (dev only).');
    } else {
      const expected = crypto.createHmac('sha256', webhookSecret).update(raw).digest('hex');
      if (signature !== expected) {
        console.warn('Webhook signature mismatch');
        return res.status(400).send('signature_mismatch');
      }
    }

    // Handle common events
    const event = JSON.parse(raw);
    const { event: eventType, payload: eventPayload } = event;

    if (eventType === 'payment.captured') {
      const payment = eventPayload?.payment?.entity;
      if (payment && payment.order_id) {
        const update = { $set: { payment_status: 'paid', payment_intent_id: payment.id, updated_at: new Date() } };
        await db.collection('bookings').updateMany({ payment_order_id: payment.order_id }, update);
        await db.collection('rental_bookings').updateMany(
          { payment_order_id: payment.order_id },
          { $set: { status: 'confirmed', payment_status: 'paid', payment_intent_id: payment.id, updated_at: new Date() } }
        );
      }
    }

    if (eventType === 'payment.failed') {
      const payment = eventPayload?.payment?.entity;
      if (payment && payment.order_id) {
        const update = { $set: { payment_status: 'failed', updated_at: new Date() } };
        await db.collection('bookings').updateMany({ payment_order_id: payment.order_id }, update);
        await db.collection('rental_bookings').updateMany({ payment_order_id: payment.order_id }, update);
      }
    }

    // Acknowledge
    res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).send('error');
  }
});

// -------------------------------------------------------------------
// Admin booking operations
// -------------------------------------------------------------------
app.post('/api/admin/bookings/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const bookingsColl = db.collection('bookings');
    const result = await bookingsColl.updateOne({ _id: id }, { $set: { status: 'confirmed', updated_at: new Date() } });
    if (result.matchedCount === 0) return res.status(404).json({ data: null, error: { message: 'Booking not found' } });
    return res.json({ data: { id, status: 'confirmed' }, error: null });
  } catch (err) {
    console.error('Approve booking error:', err);
    return res.status(500).json({ data: null, error: { message: err.message || String(err) } });
  }
});

app.post('/api/admin/bookings/:id/refund', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    // For test/dev: simply mark booking as refunded and record refund metadata
    const bookingsColl = db.collection('bookings');
    const update = {
      payment_status: 'refunded',
      refund: { amount: amount || null, reason: reason || null, at: new Date() },
      updated_at: new Date()
    };

    const result = await bookingsColl.updateOne({ _id: id }, { $set: update });
    if (result.matchedCount === 0) return res.status(404).json({ data: null, error: { message: 'Booking not found' } });
    return res.json({ data: { id, payment_status: 'refunded' }, error: null });
  } catch (err) {
    console.error('Refund booking error:', err);
    return res.status(500).json({ data: null, error: { message: err.message || String(err) } });
  }
});

// -------------------------------------------------------------------
// Rentals: server-priced requests, availability, and payment
// -------------------------------------------------------------------

// Two date ranges [start, end) overlap if each starts before the other ends.
// Dates are ISO 'YYYY-MM-DD' strings, so plain string comparison is correct.
async function findRentalConflict(equipmentId, startDate, endDate, excludeId = null) {
  const active = await db.collection('rental_bookings')
    .find({ equipment_id: equipmentId, status: { $in: ['pending', 'confirmed', 'active'] } })
    .toArray();
  return active.find((r) =>
    r._id !== excludeId && r.start_date < endDate && startDate < r.end_date
  ) || null;
}

app.post('/api/rentals/check-availability', async (req, res) => {
  try {
    const { equipment_id, start_date, end_date } = req.body || {};
    if (!equipment_id || !start_date || !end_date) {
      return res.status(400).json({ data: null, error: { message: 'equipment_id, start_date and end_date are required' } });
    }
    const conflict = await findRentalConflict(equipment_id, start_date, end_date);
    res.json({ data: { available: !conflict }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: { message: err.message } });
  }
});

app.post('/api/rentals/request', async (req, res) => {
  const sessionUser = authenticateToken(req);
  if (!sessionUser) {
    return res.status(401).json({ data: null, error: { message: 'Authentication required' } });
  }

  try {
    const { equipment_id, start_date, duration_days, contact } = req.body || {};
    if (!equipment_id || !start_date || !duration_days) {
      return res.status(400).json({ data: null, error: { message: 'equipment_id, start_date and duration_days are required' } });
    }

    const days = Number(duration_days);
    if (!Number.isInteger(days) || days < 1 || days > 30) {
      return res.status(400).json({ data: null, error: { message: 'Duration must be between 1 and 30 days' } });
    }

    // The equipment must actually exist — no bookings against mock/phantom gear.
    const equipment = await db.collection('equipment').findOne({ _id: equipment_id });
    if (!equipment) {
      return res.status(404).json({ data: null, error: { message: 'This equipment is not available for rental' } });
    }
    if (equipment.is_available === false) {
      return res.status(409).json({ data: null, error: { message: 'This equipment is currently unavailable' } });
    }

    const start = new Date(`${start_date}T00:00:00Z`);
    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({ data: null, error: { message: 'Invalid start date' } });
    }
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + days);
    const endDateStr = end.toISOString().split('T')[0];

    const conflict = await findRentalConflict(equipment_id, start_date, endDateStr);
    if (conflict) {
      return res.status(409).json({ data: null, error: { message: 'This equipment is already booked for those dates. Try a different period.' } });
    }

    // Price is computed here from the stored rate — never trusted from the client.
    const totalPrice = Math.round(Number(equipment.daily_rate) * days * 100) / 100;
    const now = new Date();
    const rental = {
      _id: crypto.randomUUID(),
      equipment_id,
      equipment_name: equipment.name,
      renter_id: sessionUser.userId,
      user_id: sessionUser.userId,
      start_date,
      end_date: endDateStr,
      duration_days: days,
      total_price: totalPrice,
      currency: equipment.currency || 'USD',
      contact_name: contact?.name || '',
      contact_email: contact?.email || sessionUser.email || '',
      contact_phone: contact?.phone || '',
      notes: contact?.notes || '',
      status: 'pending',
      payment_status: 'unpaid',
      created_at: now,
      updated_at: now,
    };

    await db.collection('rental_bookings').insertOne(rental);
    res.json({ data: { ...rental, id: rental._id }, error: null });
  } catch (err) {
    console.error('Rental request error:', err);
    res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// Create a Razorpay order for an existing rental. Amount comes from the
// stored rental (server-priced), and the order id is pinned to the rental so
// confirm-payment can verify the paid order is the one we created.
app.post('/api/rentals/:id/pay-order', async (req, res) => {
  const sessionUser = authenticateToken(req);
  if (!sessionUser) {
    return res.status(401).json({ data: null, error: { message: 'Authentication required' } });
  }

  try {
    const rental = await db.collection('rental_bookings').findOne({ _id: req.params.id, renter_id: sessionUser.userId });
    if (!rental) return res.status(404).json({ data: null, error: { message: 'Rental not found' } });
    if (rental.payment_status === 'paid') {
      return res.status(409).json({ data: null, error: { message: 'This rental is already paid' } });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return res.status(500).json({ data: null, error: { message: 'Razorpay keys not configured on server' } });
    }

    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${basicAuth}` },
      body: JSON.stringify({
        amount: Math.round(rental.total_price * 100),
        currency: rental.currency || 'USD',
        receipt: `rental_${rental._id}`.slice(0, 40),
        payment_capture: 1,
      }),
    });
    const order = await response.json();
    if (!response.ok) {
      console.error('Razorpay rental order failed:', order);
      return res.status(response.status).json({ data: null, error: order });
    }

    await db.collection('rental_bookings').updateOne(
      { _id: rental._id },
      { $set: { payment_order_id: order.id, updated_at: new Date() } }
    );
    res.json({ data: order, error: null });
  } catch (err) {
    console.error('Rental pay-order error:', err);
    res.status(500).json({ data: null, error: { message: err.message } });
  }
});

app.post('/api/rentals/:id/confirm-payment', async (req, res) => {
  const sessionUser = authenticateToken(req);
  if (!sessionUser) {
    return res.status(401).json({ data: null, error: { message: 'Authentication required' } });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ data: null, error: { message: 'Missing payment parameters' } });
    }

    const rental = await db.collection('rental_bookings').findOne({ _id: req.params.id, renter_id: sessionUser.userId });
    if (!rental) return res.status(404).json({ data: null, error: { message: 'Rental not found' } });

    // The paid order must be the one this server created for this rental.
    if (rental.payment_order_id !== razorpay_order_id) {
      return res.status(400).json({ data: null, error: { message: 'Payment does not match this rental' } });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ data: null, error: { message: 'Server missing Razorpay secret key' } });
    }
    const expected = crypto.createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expected !== razorpay_signature) {
      return res.status(400).json({ data: null, error: { message: 'Signature mismatch' } });
    }

    await db.collection('rental_bookings').updateOne(
      { _id: rental._id },
      { $set: { status: 'confirmed', payment_status: 'paid', payment_intent_id: razorpay_payment_id, updated_at: new Date() } }
    );
    res.json({ data: { id: rental._id, status: 'confirmed', payment_status: 'paid' }, error: null });
  } catch (err) {
    console.error('Rental confirm-payment error:', err);
    res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// Generic functions runner (lightweight replacement for Supabase Edge Functions)
app.post('/api/functions/:name', express.json(), async (req, res) => {
  const { name } = req.params;
  // For now provide a simple handler scaffold. Non-implemented functions return 501.
  try {
    if (name === 'analyze-portfolio-batch' || name === 'generate-mood-board' || name === 'check-style-consistency') {
      // TODO: integrate actual AI/worker implementations. For now, return 501 Not Implemented.
      return res.status(501).json({ data: null, error: { message: `${name} not implemented on server` } });
    }

    return res.status(404).json({ data: null, error: { message: 'Function not found' } });
  } catch (err) {
    console.error('Function runner error:', err);
    return res.status(500).json({ data: null, error: { message: err.message || String(err) } });
  }
});


// -------------------------------------------------------------------
// 3. GENERIC DATABASE ROUTER (CRUD API)
// -------------------------------------------------------------------

// CREATE (POST)
app.post('/api/db/:collection', async (req, res) => {
  const { collection: collName } = req.params;
  const body = req.body;

  try {
    const user = authenticateToken(req);

    // Accept array or single document
    const isArray = Array.isArray(body);
    const documents = isArray ? body : [body];

    const auth = await authorizeInsert(collName, user, documents, db);
    if (!auth.ok) {
      return res.status(auth.status).json({ data: null, error: { message: auth.message } });
    }

    const collection = db.collection(collName);
    const prepared = auth.docs.map(doc => {
      const preparedDoc = { ...doc };
      if (!preparedDoc._id && preparedDoc.id) {
        preparedDoc._id = preparedDoc.id;
      } else if (!preparedDoc._id) {
        preparedDoc._id = crypto.randomUUID();
      }
      return preparedDoc;
    });

    await collection.insertMany(prepared);

    const result = prepared.map(doc => ({
      ...doc,
      id: doc._id
    }));

    res.json({
      data: isArray ? result : result[0],
      error: null
    });
  } catch (err) {
    console.error(`DB POST ${collName} error:`, err);
    res.status(500).json({ data: null, error: err.message });
  }
});

// READ (GET)
app.get('/api/db/:collection', async (req, res) => {
  const { collection: collName } = req.params;
  const baseQuery = buildMongoQuery(req.query);

  try {
    const user = authenticateToken(req);
    const auth = await authorizeRead(collName, user, baseQuery, db);
    if (!auth.ok) {
      return res.status(auth.status).json({ data: null, error: { message: auth.message } });
    }
    const query = auth.query;

    const collection = db.collection(collName);

    // Build sort, limit, single
    let cursor = collection.find(query);

    // Sorting
    if (req.query.order) {
      const orderParam = req.query.order; // e.g. "created_at.desc" or "rating.desc.nullslast"
      const [field, direction] = orderParam.split('.');
      cursor = cursor.sort({ [field]: direction === 'desc' ? -1 : 1 });
    }

    // Offset
    if (req.query.offset) {
      cursor = cursor.skip(Number(req.query.offset));
    }

    // Limit
    if (req.query.limit) {
      cursor = cursor.limit(Number(req.query.limit));
    }

    const data = await cursor.toArray();
    const mapped = sanitizeReadDocs(collName, data, user).map(item => ({
      ...item,
      id: item._id
    }));

    // If single row is requested
    const isSingle = req.query.single === 'true' || req.headers['accept']?.includes('application/vnd.pgrst.object+json');
    if (isSingle) {
      if (mapped.length === 0) {
        return res.status(404).json({ data: null, error: { message: "No row found" } });
      }
      return res.json({ data: mapped[0], error: null });
    }

    res.json({ data: mapped, error: null });
  } catch (err) {
    console.error(`DB GET ${collName} error:`, err);
    res.status(500).json({ data: null, error: err.message });
  }
});

// UPDATE (PATCH)
app.patch('/api/db/:collection', async (req, res) => {
  const { collection: collName } = req.params;
  const updateBody = req.body;
  const baseQuery = buildMongoQuery(req.query);

  try {
    const user = authenticateToken(req);
    const auth = await authorizeMutation(collName, user, baseQuery, updateBody, db);
    if (!auth.ok) {
      return res.status(auth.status).json({ data: null, error: { message: auth.message } });
    }
    const query = auth.query;

    const collection = db.collection(collName);

    // Stripping illegal Mongo operators or keys
    const updateData = { ...auth.body };
    delete updateData._id;
    delete updateData.id;

    await collection.updateMany(query, { $set: updateData });

    // Fetch the updated items to return them
    const updatedItems = await collection.find(query).toArray();
    const mapped = sanitizeReadDocs(collName, updatedItems, user).map(item => ({
      ...item,
      id: item._id
    }));

    res.json({ data: mapped, error: null });
  } catch (err) {
    console.error(`DB PATCH ${collName} error:`, err);
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE (DELETE)
app.delete('/api/db/:collection', async (req, res) => {
  const { collection: collName } = req.params;
  const baseQuery = buildMongoQuery(req.query);

  try {
    const user = authenticateToken(req);
    const auth = await authorizeMutation(collName, user, baseQuery, null, db);
    if (!auth.ok) {
      return res.status(auth.status).json({ data: null, error: { message: auth.message } });
    }

    const collection = db.collection(collName);
    const result = await collection.deleteMany(auth.query);

    res.json({ data: { deletedCount: result.deletedCount }, error: null });
  } catch (err) {
    console.error(`DB DELETE ${collName} error:`, err);
    res.status(500).json({ data: null, error: err.message });
  }
});

export { app, connectToMongo };
