const crypto = require('crypto');

const AdminUser = require('../../models/AdminUser');
const { signToken } = require('../../utils/authToken');

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
      return res.status(400).json({ ok: false, message: 'Email and password are required' });
    }

    const user = await AdminUser.findOne({ email }).lean();
    if (!user || !user.is_active) {
      return res.status(401).json({ ok: false, message: 'Invalid credentials' });
    }

    const ok = verifyPassword(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ ok: false, message: 'Invalid credentials' });
    }

    const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';
    const secret = process.env.AUTH_SECRET || process.env.ADMIN_API_KEY || (isDev ? 'dev_auth_secret_change_me' : '');
    if (!secret) {
      return res.status(500).json({ ok: false, message: 'Auth secret not configured' });
    }

    const token = signToken(
      { sub: user.id, email: user.email, role: user.role },
      secret,
      { expiresInSeconds: 60 * 60 * 24 * 7 }
    );

    const now = new Date().toISOString();
    await AdminUser.updateOne({ id: user.id }, { $set: { last_login_at: now, update_at: now } }).catch(() => undefined);

    return res.json({
      ok: true,
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
