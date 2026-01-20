const { verifyToken } = require('../utils/authToken');
const { sendError } = require('../utils/response');

const AdminUser = require('../models/AdminUser');

async function requireAdminAuth(req, res, next) {
  const auth = req.get('authorization') || '';
  const m = String(auth).match(/^Bearer\s+(.+)$/i);
  const bearerToken = m && m[1] ? String(m[1]) : '';
  const cookieToken = req && req.cookies && req.cookies.admin_access ? String(req.cookies.admin_access) : '';
  const token = bearerToken || cookieToken;

  const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET || (isDev ? 'dev_auth_secret_change_me' : '');
  if (!secret) {
    return sendError(res, { status: 500, message: 'Auth secret not configured' });
  }

  if (token) {
    try {
      const payload = verifyToken(token, secret);
      if (!payload || payload.typ !== 'access' || !payload.sub) {
        return sendError(res, { status: 401, message: 'Unauthorized' });
      }

      const userId = String(payload.sub);
      const user = await AdminUser.findOne({ id: userId }).lean();
      if (!user || user.is_active === false) {
        return sendError(res, { status: 401, message: 'Unauthorized' });
      }

      const expectedTv = typeof user.token_version === 'number' ? user.token_version : 0;
      const providedTv = typeof payload.tv === 'number' ? payload.tv : 0;
      if (expectedTv !== providedTv) {
        return sendError(res, { status: 401, message: 'Unauthorized' });
      }

      req.admin = payload;
      return next();
    } catch (err) {
      return sendError(res, { status: 401, message: 'Unauthorized' });
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
    const ok = isLegacy || role === 'super_admin' || (role && normalized.includes(role));
    if (!ok) return sendError(res, { status: 403, message: `Forbidden: role not allowed (required: ${normalized.join(', ') || 'n/a'})` });
    return next();
  };
}

function requireAdminPermission(permissionOrPermissions) {
  const required = Array.isArray(permissionOrPermissions) ? permissionOrPermissions : [permissionOrPermissions];
  const normalized = required.map((p) => String(p || '').trim()).filter(Boolean);

  return function requireAdminPermissionMiddleware(req, res, next) {
    const role = req && req.admin && req.admin.role ? String(req.admin.role).toLowerCase() : '';
    const isLegacy = Boolean(req && req.admin && req.admin.legacy);
    if (isLegacy || role === 'super_admin' || role === 'admin') return next();

    const perms = req && req.admin && req.admin.perms && typeof req.admin.perms === 'object' ? req.admin.perms : {};
    const ok = normalized.every((key) => {
      if (!perms || typeof perms !== 'object') return false;
      if (!Object.prototype.hasOwnProperty.call(perms, key)) return false;
      return Boolean(perms[key]);
    });
    if (!ok) return sendError(res, { status: 403, message: `Forbidden: missing permission(s) (${normalized.join(', ') || 'n/a'})` });
    return next();
  };
}

module.exports = { requireAdminAuth, requireAdminRole, requireAdminPermission };
