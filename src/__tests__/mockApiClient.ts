import { vi } from 'vitest';

// Shared mock for the `supabase`/`apiClient` adapter (src/integrations/api/client.ts)
// so component tests don't hit the network. Each chain method returns `this` and
// the object itself is thenable, mirroring the real ApiQueryBuilder.
export function createChainable(result: { data: any; error: any; count?: any }) {
  const chain: any = {
    select: () => chain,
    eq: () => chain,
    or: () => chain,
    in: () => chain,
    neq: () => chain,
    is: () => chain,
    like: () => chain,
    ilike: () => chain,
    gt: () => chain,
    lt: () => chain,
    gte: () => chain,
    lte: () => chain,
    order: () => chain,
    limit: () => chain,
    offset: () => chain,
    range: () => chain,
    single: () => chain,
    maybeSingle: () => chain,
    insert: () => Promise.resolve(result),
    update: () => Promise.resolve(result),
    delete: () => Promise.resolve(result),
    then: (onfulfilled?: any, onrejected?: any) =>
      Promise.resolve(result).then(onfulfilled, onrejected),
  };
  return chain;
}

export function createMockSupabase(overrides: { auth?: any; from?: any } = {}) {
  return {
    from: vi.fn(overrides.from || (() => createChainable({ data: [], error: null, count: 0 }))),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: null, error: { message: 'not configured' } }),
      ...(overrides.auth || {}),
    },
    functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) },
    removeChannel: vi.fn(),
  };
}
