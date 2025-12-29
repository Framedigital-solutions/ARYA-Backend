const path = require('path');
const crypto = require('crypto');

const { readJsonArray, writeJsonArray } = require('../../utils/fileStore');

const filePath = path.join(__dirname, '..', '..', 'data', 'adminUsers.json');

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
  const items = await readJsonArray(filePath);
  return items.map(toPublic);
}

async function getById(id) {
  const items = await readJsonArray(filePath);
  const found = items.find((u) => u && u.id === id);
  return found ? toPublic(found) : undefined;
}

async function create(payload) {
  const items = await readJsonArray(filePath);

  const email = normalizeEmail(payload.email);
  const exists = items.some((u) => normalizeEmail(u && u.email) === email);
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
    last_login_at: '',
    created_at: now,
    update_at: now,
  };

  await writeJsonArray(filePath, [...items, user]);
  return toPublic(user);
}

async function patchById(id, patch) {
  const items = await readJsonArray(filePath);
  const idx = items.findIndex((u) => u && u.id === id);
  if (idx < 0) {
    const err = new Error('Admin user not found');
    err.statusCode = 404;
    throw err;
  }

  const current = items[idx];

  if (typeof patch.email !== 'undefined') {
    const nextEmail = normalizeEmail(patch.email);
    const exists = items.some((u) => u && u.id !== id && normalizeEmail(u.email) === nextEmail);
    if (exists) {
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
    update_at: now,
  };

  const nextItems = [...items];
  nextItems[idx] = next;
  await writeJsonArray(filePath, nextItems);
  return toPublic(next);
}

async function deleteById(id) {
  const items = await readJsonArray(filePath);
  const idx = items.findIndex((u) => u && u.id === id);
  if (idx < 0) {
    const err = new Error('Admin user not found');
    err.statusCode = 404;
    throw err;
  }

  const removed = items[idx];
  const nextItems = items.filter((u) => u && u.id !== id);
  await writeJsonArray(filePath, nextItems);
  return toPublic(removed);
}

module.exports = {
  list,
  getById,
  create,
  patchById,
  deleteById,
};
