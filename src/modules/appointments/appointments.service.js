const path = require('path');
const crypto = require('crypto');

const { readJsonArray, appendJsonArray, writeJsonArray } = require('../../utils/fileStore');

const filePath = path.join(__dirname, '..', '..', 'data', 'appointments.json');

function normalizeItem(item) {
  const now = new Date().toISOString();
  const base = item && typeof item === 'object' ? item : {};

  const preferred_date =
    typeof base.preferred_date === 'string'
      ? base.preferred_date
      : typeof base.date === 'string'
        ? base.date
        : '';

  const preferred_time =
    typeof base.preferred_time === 'string'
      ? base.preferred_time
      : typeof base.time === 'string'
        ? base.time
        : '';

  const notes =
    typeof base.notes === 'string'
      ? base.notes
      : typeof base.reason === 'string'
        ? base.reason
        : '';

  const legacyDate = typeof base.date === 'string' ? base.date : preferred_date;
  const legacyTime = typeof base.time === 'string' ? base.time : preferred_time;
  const legacyReason = typeof base.reason === 'string' ? base.reason : notes;

  const createdAt = base.createdAt || base.create_at || now;
  const updatedAt = base.updatedAt || base.update_at || createdAt;

  return {
    ...base,
    id: base.id || crypto.randomUUID(),
    email: typeof base.email === 'string' ? base.email : '',
    preferred_date,
    preferred_time,
    notes,
    date: legacyDate,
    time: legacyTime,
    reason: legacyReason,
    status: typeof base.status === 'string' ? base.status : 'new',
    createdAt,
    updatedAt,
    create_at: base.create_at || createdAt,
    update_at: base.update_at || updatedAt,
  };
}

async function create(payload) {
  const now = new Date().toISOString();
  const normalized = normalizeItem(payload);
  const item = {
    ...normalized,
    id: crypto.randomUUID(),
    status: typeof normalized.status === 'string' ? normalized.status : 'new',
    createdAt: now,
    updatedAt: now,
    create_at: now,
    update_at: now,
  };

  await appendJsonArray(filePath, item);
  return item;
}

async function list() {
  const items = await readJsonArray(filePath);
  return items.map(normalizeItem);
}

async function listRequests({ status } = {}) {
  const items = await list();
  if (status) return items.filter((i) => i && i.status === status);
  return items;
}

async function getById(id) {
  const items = await list();
  return items.find((i) => i && i.id === id);
}

async function patchById(id, patch) {
  const items = (await readJsonArray(filePath)).map(normalizeItem);
  const idx = items.findIndex((i) => i && i.id === id);
  if (idx < 0) {
    const err = new Error('Appointment request not found');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date().toISOString();
  const current = items[idx];

  const merged = normalizeItem({
    ...current,
    ...patch,
    preferred_date:
      typeof patch.preferred_date !== 'undefined'
        ? patch.preferred_date
        : typeof patch.date !== 'undefined'
          ? patch.date
          : current.preferred_date,
    preferred_time:
      typeof patch.preferred_time !== 'undefined'
        ? patch.preferred_time
        : typeof patch.time !== 'undefined'
          ? patch.time
          : current.preferred_time,
    notes:
      typeof patch.notes !== 'undefined'
        ? patch.notes
        : typeof patch.reason !== 'undefined'
          ? patch.reason
          : current.notes,
  });

  const next = {
    ...merged,
    updatedAt: now,
    update_at: now,
  };

  const nextItems = [...items];
  nextItems[idx] = next;
  await writeJsonArray(filePath, nextItems);
  return next;
}

async function deleteById(id) {
  const items = (await readJsonArray(filePath)).map(normalizeItem);
  const idx = items.findIndex((i) => i && i.id === id);
  if (idx < 0) {
    const err = new Error('Appointment request not found');
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
  listRequests,
  getById,
  patchById,
  deleteById,
};
