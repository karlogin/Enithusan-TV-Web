const SESSION_TTL_SEC = 60 * 60 * 24 * 30; // 30 days

/** @type {Map<string, string>} */
const devKv = new Map();

/** @param {object} env */
function kv(env) {
  return env.USER_DATA ?? {
    async get(key) {
      return devKv.get(key) ?? null;
    },
    async put(key, value, _opts) {
      devKv.set(key, value);
    },
    async delete(key) {
      devKv.delete(key);
    },
  };
}

/** @param {object} env */
function authSecret(env) {
  return env.AUTH_SECRET || 'dev-only-change-in-production';
}

/** @param {string} password @param {string} salt */
async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers });
}

/** @param {Request} request @param {object} env */
async function getSessionUser(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const userId = await kv(env).get(`session:${token}`);
  if (!userId) return null;
  const raw = await kv(env).get(`user:${userId}`);
  if (!raw) return null;
  return JSON.parse(raw);
}

/** @param {Request} request @param {object} env @param {Record<string, string>} corsHeaders */
export async function handleAuth(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');

  if (path === '/api/auth/register' && request.method === 'POST') {
    const body = await request.json();
    const email = String(body.email ?? '')
      .trim()
      .toLowerCase();
    const password = String(body.password ?? '');
    const name = String(body.name ?? '').trim() || email.split('@')[0];

    if (!email.includes('@') || password.length < 6) {
      return json({ error: 'Valid email and password (6+ chars) required' }, 400, corsHeaders);
    }

    const existing = await kv(env).get(`email:${email}`);
    if (existing) {
      return json({ error: 'Account already exists' }, 409, corsHeaders);
    }

    const userId = randomToken();
    const salt = randomToken().slice(0, 16);
    const passwordHash = await hashPassword(password, salt);
    const user = { id: userId, email, name, salt, passwordHash, createdAt: Date.now() };

    await kv(env).put(`user:${userId}`, JSON.stringify(user));
    await kv(env).put(`email:${email}`, userId);

    const token = randomToken();
    await kv(env).put(`session:${token}`, userId, { expirationTtl: SESSION_TTL_SEC });

    return json(
      { token, user: { id: userId, email, name } },
      201,
      corsHeaders,
    );
  }

  if (path === '/api/auth/login' && request.method === 'POST') {
    const body = await request.json();
    const email = String(body.email ?? '')
      .trim()
      .toLowerCase();
    const password = String(body.password ?? '');

    const userId = await kv(env).get(`email:${email}`);
    if (!userId) {
      return json({ error: 'Invalid email or password' }, 401, corsHeaders);
    }

    const raw = await kv(env).get(`user:${userId}`);
    if (!raw) {
      return json({ error: 'Invalid email or password' }, 401, corsHeaders);
    }

    const user = JSON.parse(raw);
    const hash = await hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      return json({ error: 'Invalid email or password' }, 401, corsHeaders);
    }

    const token = randomToken();
    await kv(env).put(`session:${token}`, userId, { expirationTtl: SESSION_TTL_SEC });

    return json({ token, user: { id: user.id, email: user.email, name: user.name } }, 200, corsHeaders);
  }

  if (path === '/api/auth/me' && request.method === 'GET') {
    const user = await getSessionUser(request, env);
    if (!user) {
      return json({ error: 'Not authenticated' }, 401, corsHeaders);
    }
    return json({ user: { id: user.id, email: user.email, name: user.name } }, 200, corsHeaders);
  }

  if (path === '/api/auth/logout' && request.method === 'POST') {
    const auth = request.headers.get('Authorization');
    if (auth?.startsWith('Bearer ')) {
      await kv(env).delete(`session:${auth.slice(7)}`);
    }
    return json({ ok: true }, 200, corsHeaders);
  }

  return null;
}

/** @param {Request} request @param {object} env @param {Record<string, string>} corsHeaders */
export async function handleUserLibrary(request, env, corsHeaders) {
  const path = new URL(request.url).pathname.replace(/\/$/, '');
  if (path !== '/api/user/library') return null;

  const user = await getSessionUser(request, env);
  if (!user) {
    return json({ error: 'Not authenticated' }, 401, corsHeaders);
  }

  const key = `library:${user.id}`;

  if (request.method === 'GET') {
    const raw = await kv(env).get(key);
    const library = raw ? JSON.parse(raw) : { myList: [], continueWatching: [] };
    return json(library, 200, corsHeaders);
  }

  if (request.method === 'PUT') {
    const body = await request.json();
    const library = {
      myList: Array.isArray(body.myList) ? body.myList : [],
      continueWatching: Array.isArray(body.continueWatching) ? body.continueWatching : [],
      updatedAt: Date.now(),
    };
    await kv(env).put(key, JSON.stringify(library));
    return json(library, 200, corsHeaders);
  }

  return json({ error: 'Method not allowed' }, 405, corsHeaders);
}

export { getSessionUser };
