const crypto = require('crypto');

const Feedback = require('../../models/Feedback');

function toPlain(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  const { _id, ...rest } = doc;
  return rest;
}

async function create(payload) {
  const now = new Date().toISOString();
  const item = {
    ...payload,
    id: crypto.randomUUID(),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    create_at: now,
    update_at: now,
  };

  await Feedback.create(item);
  return item;
}

async function list() {
  const docs = await Feedback.find({}).lean();
  return docs.map(toPlain);
}

async function getById(id) {
  const doc = await Feedback.findOne({ id }).lean();
  return doc ? toPlain(doc) : undefined;
}

async function patchById(id, patch) {
  const now = new Date().toISOString();
  const doc = await Feedback.findOneAndUpdate(
    { id },
    {
      $set: {
        ...patch,
        updatedAt: now,
        update_at: now,
      },
    },
    { new: true, lean: true }
  );

  if (!doc) {
    const err = new Error('Feedback not found');
    err.statusCode = 404;
    throw err;
  }

  return toPlain(doc);
}

async function deleteById(id) {
  const removed = await Feedback.findOneAndDelete({ id }).lean();
  if (!removed) {
    const err = new Error('Feedback not found');
    err.statusCode = 404;
    throw err;
  }
  return toPlain(removed);
}

module.exports = { create, list, getById, patchById, deleteById };
