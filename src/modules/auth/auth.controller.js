const crypto = require('crypto');

const AdminUser = require('../../models/AdminUser');
const { signToken } = require('../../utils/authToken');
const { sendError, sendSuccess } = require('../../utils/response');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function verifyPassword(password, passwordHash) {
  const raw = String(passwordHash || '');
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

async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body && req.body.email);
    const password = req.body && req.body.password;

    if (!email || !password) {
      return sendError(res, { status: 400, message: 'Email and password are required' });
    }

    const user = await AdminUser.findOne({ email }).lean();
    if (!user || !user.is_active) {
      return sendError(res, { status: 401, message: 'Invalid credentials' });
    }

    const ok = verifyPassword(password, user.password_hash);
    if (!ok) {
      return sendError(res, { status: 401, message: 'Invalid credentials' });
    }

    const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';
    const secret = process.env.AUTH_SECRET || process.env.ADMIN_API_KEY || (isDev ? 'dev_auth_secret_change_me' : '');
    if (!secret) {
      return sendError(res, { status: 500, message: 'Auth secret not configured' });
    }

    const token = signToken(
      { sub: user.id, email: user.email, role: user.role, perms: user.permissions || {} },
      secret,
      { expiresInSeconds: 60 * 60 * 24 * 7 }
    );

    const now = new Date().toISOString();
    await AdminUser.updateOne({ id: user.id }, { $set: { last_login_at: now, update_at: now } }).catch(() => undefined);

    return sendSuccess(res, {
      message: 'Logged in',
      data: {
        token,
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

module.exports = { login };
