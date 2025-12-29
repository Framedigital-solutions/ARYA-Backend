const adminUsersService = require('./adminUsers.service');
const { AdminUserCreateSchema, AdminUserPatchSchema } = require('./adminUsers.validator');

async function listAdminUsers(req, res, next) {
  try {
    const data = await adminUsersService.list();
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getAdminUser(req, res, next) {
  try {
    const { id } = req.params;
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
    const parsed = AdminUserPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const updated = await adminUsersService.patchById(id, parsed.data);
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
