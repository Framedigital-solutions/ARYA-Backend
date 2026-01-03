const { verifyToken } = require('../utils/authToken');

function requireAdminAuth(req, res, next) {
  const auth = req.get('authorization') || '';
  const m = String(auth).match(/^Bearer\s+(.+)$/i);

  const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_API_KEY || (isDev ? 'dev_auth_secret_change_me' : '');
  if (!secret) {
    return res.status(500).json({ ok: false, message: 'Auth secret not configured' });
  }

  if (m && m[1]) {
    try {
      const payload = verifyToken(m[1], secret);
      req.admin = payload;
      return next();
    } catch (err) {
      return res.status(401).json({ ok: false, message: err && err.message ? err.message : 'Unauthorized' });
    }
  }

  const allowLegacy = String(process.env.ALLOW_LEGACY_ADMIN_KEY || '').toLowerCase() === 'true';
  if (allowLegacy) {
    const expectedKey = process.env.ADMIN_API_KEY;
    const providedKey = req.get('x-admin-key');
    if (expectedKey && providedKey && providedKey === expectedKey) {
      req.admin = { legacy: true };
      return next();
    }
  }

  return res.status(401).json({ ok: false, message: 'Unauthorized' });
}

module.exports = { requireAdminAuth };
