// Access control for the generic /api/db/:collection router.
//
// Design: default-deny. Every collection the client uses is listed here with
// explicit read/write rules; unknown collections are admin-only. "Owner" means
// the JWT user id matches the document's owner field (user_id unless noted).

const PUBLIC_READ = new Set([
  'photographers',
  'equipment',
  'announcements',
  'reviews',
  'platform_settings',
  'refund_policies',
]);

// Any signed-in user may read the whole collection (e.g. photographers browse leads).
const AUTHED_READ = new Set(['leads', 'profiles']);

// Only admins may read.
const ADMIN_READ = new Set(['activity_logs', 'moderation_queue', 'disputes', 'photographer_verifications']);

// Owner field per collection when it isn't `user_id`.
const OWNER_FIELD = {
  messages: null, // special-cased: participant scoping on sender_id/recipient_id
};

// Collections where any signed-in user may insert a document they own.
const OWNER_INSERT = new Set([
  'profiles', 'photographers', 'bookings', 'rental_bookings', 'messages',
  'notifications', 'favorites', 'leads', 'generated_captions', 'invoices',
  'payments', 'refund_requests', 'reviews', 'disputes', 'photographer_verifications',
  'activity_logs', 'user_roles',
]);

// Fields a non-admin may never set through the generic router, per collection.
const FORBIDDEN_WRITE_FIELDS = {
  profiles: ['hashed_password', 'is_blocked', 'block_reason', 'email', 'user_id'],
  photographers: ['is_blocked', 'block_reason', 'rating', 'review_count'],
  bookings: ['payment_status', 'payment_intent_id', 'payment_order_id', 'commission_rate'],
  reviews: ['is_moderated', 'moderation_status'],
  user_roles: [],
};

function isAdmin(user) {
  return Boolean(user?.roles?.includes('admin'));
}

async function myPhotographerIds(db, userId) {
  const list = await db.collection('photographers').find({ user_id: userId }).toArray();
  return list.map((p) => p._id);
}

// ---- READ ----------------------------------------------------------------

export async function authorizeRead(collName, user, query, db) {
  if (PUBLIC_READ.has(collName)) return { ok: true, query };

  if (!user) return { ok: false, status: 401, message: 'Authentication required' };
  if (isAdmin(user)) return { ok: true, query };

  if (ADMIN_READ.has(collName)) {
    // Owners may still read their own verification requests.
    if (collName === 'photographer_verifications') {
      return { ok: true, query: { ...query, user_id: user.userId } };
    }
    return { ok: false, status: 403, message: 'Admin access required' };
  }

  if (AUTHED_READ.has(collName)) return { ok: true, query };

  if (collName === 'messages') {
    // Participants only, regardless of what filters the client sent.
    return {
      ok: true,
      query: {
        $and: [
          query,
          { $or: [{ sender_id: user.userId }, { recipient_id: user.userId }] },
        ],
      },
    };
  }

  if (collName === 'bookings' || collName === 'rental_bookings') {
    const photographerIds = await myPhotographerIds(db, user.userId);
    return {
      ok: true,
      query: {
        $and: [
          query,
          { $or: [{ user_id: user.userId }, { photographer_id: { $in: photographerIds } }] },
        ],
      },
    };
  }

  if (collName === 'user_roles') {
    return { ok: true, query: { ...query, user_id: user.userId } };
  }

  // Default: owner-scoped by user_id.
  return { ok: true, query: { ...query, user_id: user.userId } };
}

// Strip sensitive fields from documents before returning them.
export function sanitizeReadDocs(collName, docs, user) {
  if (collName !== 'profiles') return docs;

  const admin = isAdmin(user);
  return docs.map((doc) => {
    const { hashed_password, ...rest } = doc;
    if (admin || (user && doc.user_id === user.userId)) return rest;
    // Another user's profile: public display fields only.
    return {
      _id: rest._id,
      id: rest.id,
      user_id: rest.user_id,
      full_name: rest.full_name,
      avatar_url: rest.avatar_url,
      city: rest.city,
      created_at: rest.created_at,
    };
  });
}

// ---- WRITE ---------------------------------------------------------------

function stripForbiddenFields(collName, doc) {
  const forbidden = FORBIDDEN_WRITE_FIELDS[collName] || [];
  const cleaned = { ...doc };
  for (const field of forbidden) delete cleaned[field];
  return cleaned;
}

export async function authorizeInsert(collName, user, docs, db) {
  if (!user) return { ok: false, status: 401, message: 'Authentication required' };
  if (isAdmin(user)) return { ok: true, docs };

  if (!OWNER_INSERT.has(collName)) {
    return { ok: false, status: 403, message: 'Admin access required' };
  }

  const prepared = [];
  for (const doc of docs) {
    const cleaned = stripForbiddenFields(collName, doc);

    if (collName === 'user_roles') {
      // Users may only grant themselves non-admin roles (signup/onboarding flow).
      if (cleaned.user_id !== user.userId || !['user', 'photographer'].includes(cleaned.role)) {
        return { ok: false, status: 403, message: 'Cannot assign this role' };
      }
    } else if (collName === 'messages') {
      cleaned.sender_id = user.userId;
    } else if (collName === 'photographers') {
      cleaned.user_id = user.userId;
      cleaned.status = 'pending'; // approval is an admin action
      cleaned.is_blocked = false;
    } else if (collName === 'bookings') {
      cleaned.user_id = user.userId;
      cleaned.payment_status = 'pending'; // 'paid' only via verified payment endpoints
    } else if (collName === 'reviews') {
      // Reviews publish immediately; admins can reject later via moderation.
      cleaned.user_id = user.userId;
      cleaned.moderation_status = 'approved';
      cleaned.is_moderated = false;
    } else if (collName === 'profiles') {
      // Profile documents are created by the auth signup endpoint; via the
      // generic router a user may only (re)create their own.
      cleaned.user_id = user.userId;
    } else {
      cleaned.user_id = user.userId;
    }

    prepared.push(cleaned);
  }

  return { ok: true, docs: prepared };
}

export async function authorizeMutation(collName, user, query, body, db) {
  if (!user) return { ok: false, status: 401, message: 'Authentication required' };
  if (isAdmin(user)) return { ok: true, query, body };

  const cleanedBody = body ? stripForbiddenFields(collName, body) : body;

  if (collName === 'user_roles' || ADMIN_READ.has(collName) ||
      collName === 'announcements' || collName === 'platform_settings' ||
      collName === 'equipment') {
    return { ok: false, status: 403, message: 'Admin access required' };
  }

  if (collName === 'messages') {
    return {
      ok: true,
      body: cleanedBody,
      query: {
        $and: [
          query,
          { $or: [{ sender_id: user.userId }, { recipient_id: user.userId }] },
        ],
      },
    };
  }

  if (collName === 'bookings' || collName === 'rental_bookings') {
    const photographerIds = await myPhotographerIds(db, user.userId);
    return {
      ok: true,
      body: cleanedBody,
      query: {
        $and: [
          query,
          { $or: [{ user_id: user.userId }, { photographer_id: { $in: photographerIds } }] },
        ],
      },
    };
  }

  if (collName === 'profiles' || collName === 'photographers') {
    return { ok: true, body: cleanedBody, query: { ...query, user_id: user.userId } };
  }

  // Default: owner-scoped by user_id.
  return { ok: true, body: cleanedBody, query: { ...query, user_id: user.userId } };
}

export { isAdmin };
