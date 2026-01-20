const adminUsersService = require('./adminUsers.service');
const { AdminUserCreateSchema, AdminUserPatchSchema } = require('./adminUsers.validator');
const { sendError, sendSuccess } = require('../../utils/response');

function isSuperAdmin(req) {
  const role = req && req.admin && req.admin.role ? String(req.admin.role).toLowerCase() : '';
  const isLegacy = Boolean(req && req.admin && req.admin.legacy);
  return role === 'super_admin' || isLegacy;
}

function isSelf(req, userId) {
  const sub = req && req.admin && req.admin.sub ? String(req.admin.sub) : '';
  return sub && userId && String(sub) === String(userId);
}

function forbid(res) {
  return sendError(res, { status: 403, message: 'Forbidden' });
}

async function listAdminUsers(req, res, next) {
  try {
    if (!isSuperAdmin(req)) return forbid(res);
    const data = await adminUsersService.list();
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function getAdminUser(req, res, next) {
  try {
    const { id } = req.params;
    if (!isSuperAdmin(req) && !isSelf(req, id)) return forbid(res);
    const data = await adminUsersService.getById(id);
    if (!data) {
      return sendError(res, { status: 404, message: 'Admin user not found' });
    }
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function createAdminUser(req, res, next) {
  try {
    if (!isSuperAdmin(req)) return forbid(res);
    const parsed = AdminUserCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const created = await adminUsersService.create(parsed.data);
    return sendSuccess(res, { status: 201, message: 'Admin user created', data: created });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function patchAdminUser(req, res, next) {
  try {
    const { id } = req.params;
    if (!isSuperAdmin(req) && !isSelf(req, id)) return forbid(res);
    const parsed = AdminUserPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const payload = parsed.data;
    if (!isSuperAdmin(req)) {
      if (payload && Object.prototype.hasOwnProperty.call(payload, 'role')) delete payload.role;
      if (payload && Object.prototype.hasOwnProperty.call(payload, 'is_active')) delete payload.is_active;
      if (payload && Object.prototype.hasOwnProperty.call(payload, 'status')) delete payload.status;
      if (payload && Object.prototype.hasOwnProperty.call(payload, 'last_login_at')) delete payload.last_login_at;
      if (payload && Object.prototype.hasOwnProperty.call(payload, 'permissions')) delete payload.permissions;
    }

    const updated = await adminUsersService.patchById(id, payload);
    return sendSuccess(res, { message: 'Admin user updated', data: updated });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function deleteAdminUser(req, res, next) {
  try {
    const { id } = req.params;
    if (!isSuperAdmin(req) && !isSelf(req, id)) return forbid(res);
    const removed = await adminUsersService.deleteById(id);
    return sendSuccess(res, { message: 'Admin user deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

module.exports = {
  listAdminUsers,
  getAdminUser,
  createAdminUser,
  patchAdminUser,
  deleteAdminUser,
};
