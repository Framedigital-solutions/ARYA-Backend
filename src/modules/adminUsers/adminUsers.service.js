const crypto = require('crypto');

const AdminUser = require('../../models/AdminUser');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 310000;
  const hash = crypto.pbkdf2Sync(String(password), salt, iterations, 32, 'sha256').toString('hex');
  return `pbkdf2_sha256$${iterations}$${salt}$${hash}`;
}

function toPublic(user) {
  if (!user || typeof user !== 'object') return user;
  const { password_hash, ...rest } = user;
  return rest;
}

async function list() {
  const items = await AdminUser.find({}).lean();
  return items.map(toPublic);
}

async function getById(id) {
  const found = await AdminUser.findOne({ id }).lean();
  return found ? toPublic(found) : undefined;
}

async function create(payload) {
  const email = normalizeEmail(payload.email);

  const exists = await AdminUser.exists({ email });
  if (exists) {
    const err = new Error('Email already exists');
    err.statusCode = 409;
    throw err;
  }

  const now = new Date().toISOString();
  const user = {
    id: crypto.randomUUID(),
    name: payload.name,
    email,
    password_hash: hashPassword(payload.password),
    role: payload.role,
    is_active: typeof payload.is_active === 'boolean' ? payload.is_active : true,
    permissions: payload && payload.permissions && typeof payload.permissions === 'object' ? payload.permissions : {},
    last_login_at: '',
    created_at: now,
    update_at: now,
  };

  await AdminUser.create(user);
  return toPublic(user);
}

async function patchById(id, patch) {
  const current = await AdminUser.findOne({ id }).lean();
  if (!current) {
    const err = new Error('Admin user not found');
    err.statusCode = 404;
    throw err;
  }

  if (typeof patch.email !== 'undefined') {
    const nextEmail = normalizeEmail(patch.email);

    const emailExists = await AdminUser.exists({ id: { $ne: id }, email: nextEmail });
    if (emailExists) {
      const err = new Error('Email already exists');
      err.statusCode = 409;
      throw err;
    }
  }

  const now = new Date().toISOString();
  const next = {
    ...current,
    ...patch,
    email: typeof patch.email !== 'undefined' ? normalizeEmail(patch.email) : current.email,
    password_hash: typeof patch.password !== 'undefined' ? hashPassword(patch.password) : current.password_hash,
    permissions:
      typeof patch.permissions !== 'undefined' && patch.permissions && typeof patch.permissions === 'object'
        ? patch.permissions
        : current.permissions || {},
    update_at: now,
  };

  const saved = await AdminUser.findOneAndUpdate({ id }, { $set: next }, { new: true, lean: true });
  return saved ? toPublic(saved) : toPublic(next);
}

async function deleteById(id) {
  const removed = await AdminUser.findOneAndDelete({ id }).lean();
  if (!removed) {
    const err = new Error('Admin user not found');
    err.statusCode = 404;
    throw err;
  }

  return toPublic(removed);
}

module.exports = {
  list,
  getById,
  create,
  patchById,
  deleteById,
};
