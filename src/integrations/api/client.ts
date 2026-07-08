// API Client Adapter (replaces previous Supabase integration)
// Provides a compat API named `supabase` so existing code imports remain simple.

const getBaseUrl = () => {
  // @ts-ignore
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
};

const authListeners = new Set<(event: string, session: any) => void>();

const getStoredSession = () => {
  const sessionStr = localStorage.getItem('snapzeit_session');
  if (!sessionStr) return null;
  try {
    return JSON.parse(sessionStr);
  } catch (e) {
    return null;
  }
};

// Headers (including the bearer token when signed in) for direct fetch calls
// to the API outside this adapter, e.g. payment endpoints.
export const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const session = getStoredSession();
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
};

class ApiQueryBuilder {
  private table: string;
  private filters: Record<string, string> = {};
  private orderByParam: string = '';
  private limitParam: number | null = null;
  private offsetParam: number | null = null;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private method: string = 'GET';
  private body: any = undefined;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string, _options?: { count?: 'exact' | 'planned' | 'estimated' }) {
    this.filters['select'] = columns || '*';
    return this;
  }

  // insert/update/delete are lazy (like real Supabase) so filters can be
  // chained either before or after them; nothing executes until awaited.
  insert(values: any) {
    this.method = 'POST';
    this.body = values;
    return this;
  }

  update(values: any) {
    this.method = 'PATCH';
    this.body = values;
    return this;
  }

  delete() {
    this.method = 'DELETE';
    return this;
  }

  eq(column: string, value: any) {
    this.filters[column] = `eq.${value}`;
    return this;
  }

  or(filterString: string) {
    this.filters['or'] = filterString;
    return this;
  }

  in(column: string, values: any[]) {
    this.filters[column] = `in.(${values.join(',')})`;
    return this;
  }

  in(column: string, values: any[]) {
    this.filters[column] = `in.(${values.join(',')})`;
    return this;
  }

  neq(column: string, value: any) {
    this.filters[column] = `neq.${value}`;
    return this;
  }

  is(column: string, value: any) {
    this.filters[column] = `is.${value}`;
    return this;
  }

  like(column: string, pattern: string) {
    this.filters[column] = `like.${pattern}`;
    return this;
  }

  ilike(column: string, pattern: string) {
    this.filters[column] = `ilike.${pattern}`;
    return this;
  }

  gt(column: string, value: any) {
    this.filters[column] = `gt.${value}`;
    return this;
  }

  lt(column: string, value: any) {
    this.filters[column] = `lt.${value}`;
    return this;
  }

  gte(column: string, value: any) {
    this.filters[column] = `gte.${value}`;
    return this;
  }

  lte(column: string, value: any) {
    this.filters[column] = `lte.${value}`;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const dir = options?.ascending === false ? 'desc' : 'asc';
    this.orderByParam = `${column}.${dir}`;
    return this;
  }

  limit(count: number) {
    this.limitParam = count;
    return this;
  }

  offset(count: number) {
    this.offsetParam = count;
    return this;
  }

  // Postgrest-style inclusive range; translates to offset/limit.
  range(from: number, to: number) {
    this.offsetParam = from;
    this.limitParam = to - from + 1;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  // Like single(), but treats "no row found" as a null result instead of an error.
  maybeSingle() {
    this.isSingle = true;
    this.isMaybeSingle = true;
    return this;
  }

  private async execute() {
    let url = `${getBaseUrl()}/api/db/${this.table}`;

    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(this.filters)) {
      if (k === 'select') continue;
      searchParams.append(k, v);
    }
    if (this.orderByParam) searchParams.append('order', this.orderByParam);
    if (this.limitParam !== null) searchParams.append('limit', String(this.limitParam));
    if (this.offsetParam !== null) searchParams.append('offset', String(this.offsetParam));
    if (this.isSingle) searchParams.append('single', 'true');

    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const session = getStoredSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    try {
      const response = await fetch(url, {
        method: this.method,
        headers,
        body: this.body ? JSON.stringify(this.body) : undefined,
      });

      const result = await response.json();

      if (this.isMaybeSingle && response.status === 404) {
        return { data: null, error: null, count: 0 };
      }

      return {
        data: result.data,
        error: result.error,
        count: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0),
      };
    } catch (err: any) {
      console.warn(`API Client Error [${this.method} ${this.table}]:`, err);
      return {
        data: null,
        error: { message: err.message || 'Network request failed' },
        count: null,
      };
    }
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const supabase = {
  from(table: string) {
    return new ApiQueryBuilder(table);
  },

  async rpc(func: string, params?: any) {
    const url = `${getBaseUrl()}/api/rpc/${func}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const session = getStoredSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: params ? JSON.stringify(params) : undefined,
      });

      const result = await response.json();
      return {
        data: result.data,
        error: result.error,
      };
    } catch (err: any) {
      console.warn(`API Client Error [RPC ${func}]:`, err);
      return {
        data: null,
        error: { message: err.message || 'Network request failed' },
      };
    }
  },

  auth: {
    async signUp(credentials: { email: string; password?: string; options?: { data?: any } }) {
      const url = `${getBaseUrl()}/api/auth/signup`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            data: credentials.options?.data || {},
          }),
        });

        const result = await response.json();
        if (!result.error && result.data?.session) {
          localStorage.setItem('snapzeit_session', JSON.stringify(result.data.session));
          authListeners.forEach(listener => listener('SIGNED_IN', result.data.session));
        }
        return result;
      } catch (err: any) {
        return { data: null, error: { message: err.message || 'Signup failed' } };
      }
    },

    async signInWithPassword(credentials: { email: string; password?: string }) {
      const url = `${getBaseUrl()}/api/auth/signin`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const result = await response.json();
        if (!result.error && result.data?.session) {
          localStorage.setItem('snapzeit_session', JSON.stringify(result.data.session));
          authListeners.forEach(listener => listener('SIGNED_IN', result.data.session));
        }
        return result;
      } catch (err: any) {
        return { data: null, error: { message: err.message || 'Signin failed' } };
      }
    },

    async signOut() {
      const url = `${getBaseUrl()}/api/auth/signout`;
      try {
        const session = getStoredSession();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        await fetch(url, { method: 'POST', headers });
      } catch (e) {
        console.warn('Signout API error', e);
      } finally {
        localStorage.removeItem('snapzeit_session');
        authListeners.forEach(listener => listener('SIGNED_OUT', null));
      }
      return { error: null };
    },

    async updateUser(attributes: { password?: string; data?: Record<string, any> }) {
      const session = getStoredSession();
      const url = `${getBaseUrl()}/api/auth/update-user`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(attributes),
        });
        const result = await response.json();

        if (!result.error && session) {
          const updatedSession = {
            ...session,
            user: { ...session.user, user_metadata: { ...session.user.user_metadata, ...(result.data?.user?.user_metadata || {}) } },
          };
          localStorage.setItem('snapzeit_session', JSON.stringify(updatedSession));
        }

        return result;
      } catch (err: any) {
        return { data: null, error: { message: err.message || 'Update failed' } };
      }
    },

    async getSession() {
      const session = getStoredSession();
      if (!session) {
        return { data: { session: null }, error: null };
      }

      const url = `${getBaseUrl()}/api/auth/session`;
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const result = await response.json();
        if (result.error || !result.data?.session) {
          localStorage.removeItem('snapzeit_session');
          return { data: { session: null }, error: null };
        }
        return { data: { session: result.data.session }, error: null };
      } catch (err) {
        return { data: { session }, error: null };
      }
    },

    async getUser() {
      const session = getStoredSession();
      if (!session?.user) {
        return { data: { user: null }, error: null };
      }
      return { data: { user: session.user }, error: null };
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      authListeners.add(callback);
      const session = getStoredSession();
      setTimeout(() => {
        callback(session ? 'INITIAL_SESSION' : 'SIGNED_OUT', session);
      }, 0);

      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
    async signInWithOAuth(params: { provider: string; options?: any }) {
      // OAuth flow is not configured in this lightweight adapter.
      // Return a friendly error so UI can fall back to other methods.
      return { data: null, error: { message: 'OAuth sign-in is not configured for this environment' } };
    }
  },
  // Lightweight functions namespace to mimic Supabase Edge Functions
  functions: {
    async invoke(name: string, payload?: any) {
      const url = `${getBaseUrl()}/api/functions/${encodeURIComponent(name)}`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const session = getStoredSession();
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
      try {
        const resp = await fetch(url, { method: 'POST', headers, body: payload ? JSON.stringify(payload) : undefined });
        const result = await resp.json();
        return { data: result.data, error: result.error };
      } catch (err: any) {
        return { data: null, error: { message: err.message || 'Function invocation failed' } };
      }
    }
  },

  // Storage shim: images are compressed client-side and stored as data URLs
  // inside the owning document (profile.avatar_url, photographer.portfolio),
  // so no external storage service is required. Mirrors the Supabase storage
  // API shape used by the app: upload() then getPublicUrl().
  storage: {
    from(bucket: string) {
      return {
        async upload(path: string, file: File | Blob, _options?: { upsert?: boolean }) {
          try {
            // Avatars stay small; portfolio/cover images keep more detail.
            const maxDim = bucket === 'avatars' ? 512 : 1280;
            const dataUrl = await compressToDataUrl(file, maxDim, 0.8);
            uploadedDataUrls.set(`${bucket}/${path}`, dataUrl);
            return { data: { path }, error: null };
          } catch (err: any) {
            return { data: null, error: { message: err.message || 'Image processing failed' } };
          }
        },
        getPublicUrl(path: string) {
          return { data: { publicUrl: uploadedDataUrls.get(`${bucket}/${path}`) || '' } };
        },
        async remove(paths: string[]) {
          paths.forEach((p) => uploadedDataUrls.delete(`${bucket}/${p}`));
          return { data: paths, error: null };
        },
      };
    },
  },

  // No-op for realtime channel removal (was Supabase-specific)
  removeChannel() {
    return;
  },
};

// Holds data URLs between upload() and getPublicUrl() calls.
const uploadedDataUrls = new Map<string, string>();

function compressToDataUrl(file: File | Blob, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      const scale = Math.min(1, maxDim / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read image file'));
    };
    img.src = objectUrl;
  });
}

// Backwards-compatible exports
export const apiClient = supabase;
export default apiClient;
