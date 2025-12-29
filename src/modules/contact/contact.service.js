const path = require('path');
const crypto = require('crypto');

const { appendJsonArray, readJsonArray, writeJsonArray } = require('../../utils/fileStore');

const filePath = path.join(__dirname, '..', '..', 'data', 'contacts.json');

async function create(payload) {
  const now = new Date().toISOString();
  const item = {
    ...payload,
    id: crypto.randomUUID(),
    source: typeof payload.source === 'string' ? payload.source : '',
    status: typeof payload.status === 'string' ? payload.status : 'new',
    assigned_to_user_id: typeof payload.assigned_to_user_id === 'string' ? payload.assigned_to_user_id : '',
    createdAt: now,
    updatedAt: now,
    create_at: now,
    update_at: now,
  };

  await appendJsonArray(filePath, item);
  return item;
}

async function list({ status, assigned_to_user_id } = {}) {
  const items = await readJsonArray(filePath);
  let out = items;
  if (status) {
    out = out.filter((i) => i && i.status === status);
  }
  if (assigned_to_user_id) {
    out = out.filter((i) => i && i.assigned_to_user_id === assigned_to_user_id);
  }
  return out;
}

async function getById(id) {
  const items = await readJsonArray(filePath);
  return items.find((i) => i && i.id === id);
}

async function patchById(id, patch) {
  const items = await readJsonArray(filePath);
  const idx = items.findIndex((i) => i && i.id === id);
  if (idx < 0) {
    const err = new Error('Inquiry not found');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date().toISOString();
  const current = items[idx];
  const next = {
    ...current,
    ...patch,
    updatedAt: now,
    update_at: now,
  };

  const nextItems = [...items];
  nextItems[idx] = next;
  await writeJsonArray(filePath, nextItems);
  return next;
}

async function deleteById(id) {
  const items = await readJsonArray(filePath);
  const idx = items.findIndex((i) => i && i.id === id);
  if (idx < 0) {
    const err = new Error('Inquiry not found');
    err.statusCode = 404;
    throw err;
  }

  const removed = items[idx];
  const nextItems = items.filter((i) => i && i.id !== id);
  await writeJsonArray(filePath, nextItems);
  return removed;
}

module.exports = {
  create,
  list,
  getById,
  patchById,
  deleteById,
};
