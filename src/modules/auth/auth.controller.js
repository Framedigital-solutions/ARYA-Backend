const crypto = require('crypto');

const bcrypt = require('bcryptjs');

const AdminUser = require('../../models/AdminUser');
const { signToken } = require('../../utils/authToken');
const { sendError, sendSuccess } = require('../../utils/response');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function verifyPassword(password, passwordHash) {
  const raw = String(passwordHash || '');
  if (raw.startsWith('$2')) {
    return bcrypt.compareSync(String(password), raw);
  }

  const parts = raw.split('$');
  if (parts.length !== 4) return false;
  const [algo, iterStr, salt, storedHex] = parts;
  if (algo !== 'pbkdf2_sha256') return false;

  const iterations = Number(iterStr);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const computedHex = crypto.pbkdf2Sync(String(password), String(salt), iterations, 32, 'sha256').toString('hex');
  const a = Buffer.from(String(storedHex), 'hex');
  const b = Buffer.from(String(computedHex), 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function isBcryptHash(value) {
  const raw = String(value || '');
  return raw.startsWith('$2a$') || raw.startsWith('$2b$') || raw.startsWith('$2y$');
}

function resolveAuthSecret() {
  const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET || '';
  if (secret) return String(secret);
  if (isDev) return 'dev_auth_secret_change_me';
  return '';
}

function cookieOptions() {
  const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
  const sameSite = isProd ? 'none' : 'lax';
  const secure = isProd;
  const domain = process.env.COOKIE_DOMAIN ? String(process.env.COOKIE_DOMAIN) : undefined;

  return {
    httpOnly: true,
    secure,
    sameSite,
    ...(domain ? { domain } : {}),
    path: '/'
  };
}

function defaultPermissionsForRole(role) {
  const r = String(role || '').trim().toLowerCase();
  if (r === 'editor') {
    return {
      'appointments.manage': false,
      'inquiries.manage': false,
      'feedback.manage': false,
      'notifications.read': true,
      'settings.manage': false,
      'content.manage': true,
      'adminUsers.manage': false,
    };
  }

  if (r === 'staff') {
    return {
      'appointments.manage': false,
      'inquiries.manage': false,
      'feedback.manage': false,
      'notifications.read': true,
      'settings.manage': false,
      'content.manage': false,
      'adminUsers.manage': false,
    };
  }

  return {};
}

async function ensureBootstrapAdmin({ email, password }) {
  const envEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  const envPassword = String(process.env.ADMIN_PASSWORD || '');
  if (!envEmail || !envPassword) return null;
  if (normalizeEmail(email) !== envEmail) return null;

  const ok = envPassword.startsWith('$2') ? bcrypt.compareSync(String(password), envPassword) : String(password) === envPassword;
  if (!ok) return null;

  const now = new Date().toISOString();
  const exists = await AdminUser.findOne({ email: envEmail }).lean();
  if (exists) return exists;

  const name = String(process.env.ADMIN_NAME || 'Super Admin');
  const passwordHash = envPassword.startsWith('$2') ? envPassword : bcrypt.hashSync(envPassword, 12);
  const created = {
    id: crypto.randomUUID(),
    name,
    email: envEmail,
    password_hash: passwordHash,
    role: 'super_admin',
    status: 'active',
    is_active: true,
    permissions: {},
    last_login_at: '',
    token_version: 0,
    created_at: now,
    update_at: now,
  };

  await AdminUser.create(created);
  return created;
}

function issueTokens(user, secret) {
  const basePerms = defaultPermissionsForRole(user && user.role ? user.role : '');
  const storedPerms = user && user.permissions && typeof user.permissions === 'object' ? user.permissions : {};
  const effectivePerms = { ...basePerms, ...storedPerms };

  const accessToken = signToken(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      perms: effectivePerms,
      tv: typeof user.token_version === 'number' ? user.token_version : 0,
      typ: 'access',
    },
    secret,
    { expiresInSeconds: 60 * 15 }
  );

  const refreshToken = signToken(
    {
      sub: user.id,
      tv: typeof user.token_version === 'number' ? user.token_version : 0,
      typ: 'refresh',
    },
    secret,
    { expiresInSeconds: 60 * 60 * 24 * 7 }
  );

  return { accessToken, refreshToken };
}

function setAuthCookies(res, { accessToken, refreshToken }) {
  const base = cookieOptions();
  res.cookie('admin_access', accessToken, { ...base, maxAge: 1000 * 60 * 15 });
  res.cookie('admin_refresh', refreshToken, { ...base, maxAge: 1000 * 60 * 60 * 24 * 7 });
}

function clearAuthCookies(res) {
  const base = cookieOptions();
  res.cookie('admin_access', '', { ...base, maxAge: 0 });
  res.cookie('admin_refresh', '', { ...base, maxAge: 0 });
}

async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body && req.body.email);
    const password = req.body && req.body.password;

    if (!email || !password) {
      return sendError(res, { status: 400, message: 'Email and password are required' });
    }

    let user = await AdminUser.findOne({ email }).lean();
    if (!user) {
      user = await ensureBootstrapAdmin({ email, password });
    }
    if (!user || !user.is_active) {
      return sendError(res, { status: 401, message: 'Invalid credentials' });
    }

    const ok = verifyPassword(password, user.password_hash);
    if (!ok) {
      return sendError(res, { status: 401, message: 'Invalid credentials' });
    }

    const secret = resolveAuthSecret();
    if (!secret) {
      return sendError(res, { status: 500, message: 'Auth secret not configured' });
    }

    if (!isBcryptHash(user.password_hash)) {
      const nowIso = new Date().toISOString();
      const nextHash = bcrypt.hashSync(String(password), 12);
      await AdminUser.updateOne({ id: user.id }, { $set: { password_hash: nextHash, update_at: nowIso } }).catch(() => undefined);
      user.password_hash = nextHash;
    }

    const { accessToken, refreshToken } = issueTokens(user, secret);
    setAuthCookies(res, { accessToken, refreshToken });

    const now = new Date().toISOString();
    await AdminUser.updateOne({ id: user.id }, { $set: { last_login_at: now, update_at: now } }).catch(() => undefined);

    return sendSuccess(res, {
      message: 'Logged in',
      data: {
        token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const secret = resolveAuthSecret();
    if (!secret) {
      return sendError(res, { status: 500, message: 'Auth secret not configured' });
    }

    const refreshToken = req && req.cookies ? req.cookies.admin_refresh : '';
    if (!refreshToken) {
      clearAuthCookies(res);
      return sendError(res, { status: 401, message: 'Unauthorized' });
    }

    const { verifyToken } = require('../../utils/authToken');
    let payload;
    try {
      payload = verifyToken(refreshToken, secret);
    } catch (err) {
      clearAuthCookies(res);
      return sendError(res, { status: 401, message: 'Unauthorized' });
    }

    if (!payload || payload.typ !== 'refresh' || !payload.sub) {
      clearAuthCookies(res);
      return sendError(res, { status: 401, message: 'Unauthorized' });
    }

    const user = await AdminUser.findOne({ id: String(payload.sub) }).lean();
    if (!user || !user.is_active) {
      clearAuthCookies(res);
      return sendError(res, { status: 401, message: 'Unauthorized' });
    }

    const expectedTv = typeof user.token_version === 'number' ? user.token_version : 0;
    const providedTv = typeof payload.tv === 'number' ? payload.tv : 0;
    if (expectedTv !== providedTv) {
      clearAuthCookies(res);
      return sendError(res, { status: 401, message: 'Unauthorized' });
    }

    const { accessToken, refreshToken: nextRefreshToken } = issueTokens(user, secret);
    setAuthCookies(res, { accessToken, refreshToken: nextRefreshToken });

    return sendSuccess(res, {
      message: 'Refreshed',
      data: {
        token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    clearAuthCookies(res);
    return sendSuccess(res, { message: 'Logged out', data: { ok: true } });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const adminId = req && req.admin && req.admin.sub ? String(req.admin.sub) : '';
    if (!adminId) return sendError(res, { status: 401, message: 'Unauthorized' });

    const user = await AdminUser.findOne({ id: adminId }).lean();
    if (!user || !user.is_active) return sendError(res, { status: 401, message: 'Unauthorized' });

    return sendSuccess(res, {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || (user.is_active ? 'active' : 'inactive'),
        is_active: Boolean(user.is_active),
        permissions: user.permissions || {},
        created_at: user.created_at,
        update_at: user.update_at,
        last_login_at: user.last_login_at,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { login, refresh, logout, me };
