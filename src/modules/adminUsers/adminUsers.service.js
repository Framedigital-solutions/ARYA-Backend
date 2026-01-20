const crypto = require('crypto');

const bcrypt = require('bcryptjs');

const AdminUser = require('../../models/AdminUser');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashPassword(password) {
  const raw = String(password || '');
  if (raw.startsWith('$2')) return raw;
  return bcrypt.hashSync(raw, 12);
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
    status: typeof payload.status === 'string' && payload.status ? String(payload.status) : (payload.is_active === false ? 'inactive' : 'active'),
    is_active: typeof payload.is_active === 'boolean' ? payload.is_active : true,
    permissions: payload && payload.permissions && typeof payload.permissions === 'object' ? payload.permissions : {},
    last_login_at: '',
    token_version: 0,
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
  const shouldBumpTokenVersion =
    Object.prototype.hasOwnProperty.call(patch || {}, 'password') ||
    Object.prototype.hasOwnProperty.call(patch || {}, 'role') ||
    Object.prototype.hasOwnProperty.call(patch || {}, 'is_active') ||
    Object.prototype.hasOwnProperty.call(patch || {}, 'status');

  const currentTv = typeof current.token_version === 'number' ? current.token_version : 0;
  const next = {
    ...current,
    ...patch,
    email: typeof patch.email !== 'undefined' ? normalizeEmail(patch.email) : current.email,
    password_hash: typeof patch.password !== 'undefined' ? hashPassword(patch.password) : current.password_hash,
    status:
      typeof patch.status !== 'undefined' && patch.status
        ? String(patch.status)
        : typeof patch.is_active !== 'undefined'
          ? (patch.is_active === false ? 'inactive' : 'active')
          : current.status || (current.is_active === false ? 'inactive' : 'active'),
    permissions:
      typeof patch.permissions !== 'undefined' && patch.permissions && typeof patch.permissions === 'object'
        ? patch.permissions
        : current.permissions || {},
    token_version: shouldBumpTokenVersion ? currentTv + 1 : currentTv,
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
