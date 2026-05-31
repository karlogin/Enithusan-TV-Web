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

function libraryKey(userId, profileId = 'default') {
  return `library:${userId}:${profileId}`;
}

/** @param {Request} request */
function profileIdFromRequest(request) {
  const url = new URL(request.url);
  return url.searchParams.get('profileId') || 'default';
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

    return json({ token, user: { id: userId, email, name } }, 201, corsHeaders);
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

  if (path === '/api/auth/forgot-password' && request.method === 'POST') {
    const body = await request.json();
    const email = String(body.email ?? '')
      .trim()
      .toLowerCase();
    const userId = await kv(env).get(`email:${email}`);
    if (userId) {
      const token = randomToken();
      await kv(env).put(`reset:${token}`, userId, { expirationTtl: 3600 });
      const appUrl = env.APP_URL || 'https://einthusan.mainframe.website';
      const resetUrl = `${appUrl}/reset-password?token=${token}`;
      const mailFrom = env.MAIL_FROM || 'noreply@mainframe.website';
      if (env.EMAIL) {
        try {
          await env.EMAIL.send({
            to: email,
            from: mailFrom,
            subject: 'Reset your Einthusan TV password',
            text: `Click to reset your password (valid 1 hour):\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
            html: `<p>Click to reset your password (valid 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, ignore this email.</p>`,
          });
        } catch {
          /* ignore — domain may not be onboarded yet */
        }
      } else if (env.DEV_SHOW_RESET_LINK === 'true') {
        return json({ ok: true, resetUrl }, 200, corsHeaders);
      }
    }
    return json({ ok: true, message: 'If that email exists, reset instructions were sent.' }, 200, corsHeaders);
  }

  if (path === '/api/auth/reset-password' && request.method === 'POST') {
    const body = await request.json();
    const token = String(body.token ?? '');
    const password = String(body.password ?? '');
    if (password.length < 6) {
      return json({ error: 'Password must be at least 6 characters' }, 400, corsHeaders);
    }
    const userId = await kv(env).get(`reset:${token}`);
    if (!userId) {
      return json({ error: 'Invalid or expired reset link' }, 400, corsHeaders);
    }
    const raw = await kv(env).get(`user:${userId}`);
    if (!raw) {
      return json({ error: 'Invalid or expired reset link' }, 400, corsHeaders);
    }
    const user = JSON.parse(raw);
    const salt = randomToken().slice(0, 16);
    user.salt = salt;
    user.passwordHash = await hashPassword(password, salt);
    await kv(env).put(`user:${userId}`, JSON.stringify(user));
    await kv(env).delete(`reset:${token}`);
    return json({ ok: true }, 200, corsHeaders);
  }

  if (path === '/api/auth/change-password' && request.method === 'POST') {
    const user = await getSessionUser(request, env);
    if (!user) return json({ error: 'Not authenticated' }, 401, corsHeaders);
    const body = await request.json();
    const current = String(body.currentPassword ?? '');
    const next = String(body.newPassword ?? '');
    if (next.length < 6) {
      return json({ error: 'New password must be at least 6 characters' }, 400, corsHeaders);
    }
    const hash = await hashPassword(current, user.salt);
    if (hash !== user.passwordHash) {
      return json({ error: 'Current password is incorrect' }, 401, corsHeaders);
    }
    const salt = randomToken().slice(0, 16);
    user.salt = salt;
    user.passwordHash = await hashPassword(next, salt);
    await kv(env).put(`user:${user.id}`, JSON.stringify(user));
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

  let profileId = profileIdFromRequest(request);
  let body = null;

  if (request.method === 'PUT') {
    body = await request.json();
    if (body.profileId) profileId = String(body.profileId);
  }

  const key = libraryKey(user.id, profileId);

  if (request.method === 'GET') {
    const raw = await kv(env).get(key);
    const library = raw ? JSON.parse(raw) : { myList: [], continueWatching: [] };
    return json(library, 200, corsHeaders);
  }

  if (request.method === 'PUT' && body) {
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
