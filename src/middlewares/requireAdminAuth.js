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

function requireAdminRole(roleOrRoles) {
  const required = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
  const normalized = required.map((r) => String(r || '').toLowerCase()).filter(Boolean);

  return function requireAdminRoleMiddleware(req, res, next) {
    const role = req && req.admin && req.admin.role ? String(req.admin.role).toLowerCase() : '';
    const isLegacy = Boolean(req && req.admin && req.admin.legacy);
    const ok = isLegacy || (role && normalized.includes(role));
    if (!ok) return res.status(403).json({ ok: false, message: 'Forbidden' });
    return next();
  };
}

function requireAdminPermission(permissionOrPermissions) {
  const required = Array.isArray(permissionOrPermissions) ? permissionOrPermissions : [permissionOrPermissions];
  const normalized = required.map((p) => String(p || '').trim()).filter(Boolean);

  return function requireAdminPermissionMiddleware(req, res, next) {
    const role = req && req.admin && req.admin.role ? String(req.admin.role).toLowerCase() : '';
    const isLegacy = Boolean(req && req.admin && req.admin.legacy);
    if (isLegacy || role === 'admin') return next();

    const perms = req && req.admin && req.admin.perms && typeof req.admin.perms === 'object' ? req.admin.perms : {};
    const defaults = {
      'appointments.manage': true,
      'inquiries.manage': true,
      'feedback.manage': true,
      'notifications.read': true,
    };

    const ok = normalized.every((key) => {
      if (perms && Object.prototype.hasOwnProperty.call(perms, key)) return Boolean(perms[key]);
      return Boolean(Object.prototype.hasOwnProperty.call(defaults, key) ? defaults[key] : false);
    });
    if (!ok) return res.status(403).json({ ok: false, message: 'Forbidden' });
    return next();
  };
}

module.exports = { requireAdminAuth, requireAdminRole, requireAdminPermission };
