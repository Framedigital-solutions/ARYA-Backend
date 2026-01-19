const { verifyToken } = require('../utils/authToken');
const { sendError } = require('../utils/response');

function requireAdminAuth(req, res, next) {
  const auth = req.get('authorization') || '';
  const m = String(auth).match(/^Bearer\s+(.+)$/i);

  const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_API_KEY || (isDev ? 'dev_auth_secret_change_me' : '');
  if (!secret) {
    return sendError(res, { status: 500, message: 'Auth secret not configured' });
  }

  if (m && m[1]) {
    try {
      const payload = verifyToken(m[1], secret);
      req.admin = payload;
      return next();
    } catch (err) {
      return sendError(res, { status: 401, message: err && err.message ? err.message : 'Unauthorized' });
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

  return sendError(res, { status: 401, message: 'Unauthorized' });
}

function requireAdminRole(roleOrRoles) {
  const required = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
  const normalized = required.map((r) => String(r || '').toLowerCase()).filter(Boolean);

  return function requireAdminRoleMiddleware(req, res, next) {
    const role = req && req.admin && req.admin.role ? String(req.admin.role).toLowerCase() : '';
    const isLegacy = Boolean(req && req.admin && req.admin.legacy);
    const ok = isLegacy || (role && normalized.includes(role));
    if (!ok) return sendError(res, { status: 403, message: 'Forbidden' });
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
    const ok = normalized.every((key) => {
      if (!perms || typeof perms !== 'object') return false;
      if (!Object.prototype.hasOwnProperty.call(perms, key)) return false;
      return Boolean(perms[key]);
    });
    if (!ok) return sendError(res, { status: 403, message: 'Forbidden' });
    return next();
  };
}

module.exports = { requireAdminAuth, requireAdminRole, requireAdminPermission };
