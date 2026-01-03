const crypto = require('crypto');

const AppointmentRequest = require('../../models/AppointmentRequest');

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

  await AppointmentRequest.create(item);
  return item;
}

async function list() {
  const items = await AppointmentRequest.find({}).lean();
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
  const now = new Date().toISOString();
  const current = await AppointmentRequest.findOne({ id }).lean();
  if (!current) {
    const err = new Error('Appointment request not found');
    err.statusCode = 404;
    throw err;
  }

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

  const saved = await AppointmentRequest.findOneAndUpdate(
    { id },
    { $set: next },
    { new: true, lean: true }
  );

  return saved ? normalizeItem(saved) : next;
}

async function deleteById(id) {
  const removed = await AppointmentRequest.findOneAndDelete({ id }).lean();
  if (!removed) {
    const err = new Error('Appointment request not found');
    err.statusCode = 404;
    throw err;
  }
  return normalizeItem(removed);
}

module.exports = {
  create,
  list,
  listRequests,
  getById,
  patchById,
  deleteById,
};
