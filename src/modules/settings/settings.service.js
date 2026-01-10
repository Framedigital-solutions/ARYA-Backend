const crypto = require('crypto');

const Setting = require('../../models/Setting');

function toPlain(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  const { _id, ...rest } = doc;
  return rest;
}

async function list() {
  const docs = await Setting.find({}).sort({ key: 1 }).lean();
  return docs.map(toPlain);
}

async function getById(id) {
  const doc = await Setting.findOne({ id }).lean();
  return doc ? toPlain(doc) : undefined;
}

async function create(payload) {
  const exists = await Setting.exists({ key: payload.key });
  if (exists) {
    const err = new Error('Setting key already exists');
    err.statusCode = 409;
    throw err;
  }

  const now = new Date().toISOString();
  const item = {
    id: crypto.randomUUID(),
    key: payload.key,
    value: payload.value,
    description: typeof payload.description === 'string' ? payload.description : '',
    createdAt: now,
    updatedAt: now,
    create_at: now,
    update_at: now,
  };

  await Setting.create(item);
  return item;
}

async function patchById(id, patch) {
  const current = await Setting.findOne({ id }).lean();
  if (!current) {
    const err = new Error('Setting not found');
    err.statusCode = 404;
    throw err;
  }

  if (typeof patch.key !== 'undefined' && patch.key !== current.key) {
    const keyExists = await Setting.exists({ id: { $ne: id }, key: patch.key });
    if (keyExists) {
      const err = new Error('Setting key already exists');
      err.statusCode = 409;
      throw err;
    }
  }

  const now = new Date().toISOString();
  const next = {
    ...current,
    ...patch,
    updatedAt: now,
    update_at: now,
  };

  const saved = await Setting.findOneAndUpdate({ id }, { $set: next }, { new: true, lean: true });
  return saved ? toPlain(saved) : toPlain(next);
}

async function deleteById(id) {
  const removed = await Setting.findOneAndDelete({ id }).lean();
  if (!removed) {
    const err = new Error('Setting not found');
    err.statusCode = 404;
    throw err;
  }
  return toPlain(removed);
}

module.exports = { list, getById, create, patchById, deleteById };
