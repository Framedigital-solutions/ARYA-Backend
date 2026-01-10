const adminUsersService = require('./adminUsers.service');
const { AdminUserCreateSchema, AdminUserPatchSchema } = require('./adminUsers.validator');

function isAdmin(req) {
  const role = req && req.admin && req.admin.role ? String(req.admin.role).toLowerCase() : '';
  const isLegacy = Boolean(req && req.admin && req.admin.legacy);
  const perms = req && req.admin && req.admin.perms && typeof req.admin.perms === 'object' ? req.admin.perms : {};
  const canManage = Boolean(perms && Object.prototype.hasOwnProperty.call(perms, 'adminUsers.manage') ? perms['adminUsers.manage'] : false);
  return role === 'admin' || isLegacy || canManage;
}

function isSelf(req, userId) {
  const sub = req && req.admin && req.admin.sub ? String(req.admin.sub) : '';
  return sub && userId && String(sub) === String(userId);
}

function forbid(res) {
  return res.status(403).json({ ok: false, message: 'Forbidden' });
}

async function listAdminUsers(req, res, next) {
  try {
    if (!isAdmin(req)) return forbid(res);
    const data = await adminUsersService.list();
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getAdminUser(req, res, next) {
  try {
    const { id } = req.params;
    if (!isAdmin(req) && !isSelf(req, id)) return forbid(res);
    const data = await adminUsersService.getById(id);
    if (!data) {
      return res.status(404).json({ ok: false, message: 'Admin user not found' });
    }
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function createAdminUser(req, res, next) {
  try {
    if (!isAdmin(req)) return forbid(res);
    const parsed = AdminUserCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const created = await adminUsersService.create(parsed.data);
    return res.status(201).json({ ok: true, message: 'Admin user created', data: created });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function patchAdminUser(req, res, next) {
  try {
    const { id } = req.params;
    if (!isAdmin(req) && !isSelf(req, id)) return forbid(res);
    const parsed = AdminUserPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const payload = parsed.data;
    if (!isAdmin(req)) {
      if (payload && Object.prototype.hasOwnProperty.call(payload, 'role')) delete payload.role;
      if (payload && Object.prototype.hasOwnProperty.call(payload, 'is_active')) delete payload.is_active;
      if (payload && Object.prototype.hasOwnProperty.call(payload, 'last_login_at')) delete payload.last_login_at;
      if (payload && Object.prototype.hasOwnProperty.call(payload, 'permissions')) delete payload.permissions;
    }

    const updated = await adminUsersService.patchById(id, payload);
    return res.json({ ok: true, message: 'Admin user updated', data: updated });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function deleteAdminUser(req, res, next) {
  try {
    const { id } = req.params;
    if (!isAdmin(req) && !isSelf(req, id)) return forbid(res);
    const removed = await adminUsersService.deleteById(id);
    return res.json({ ok: true, message: 'Admin user deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
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
