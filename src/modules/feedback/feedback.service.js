const path = require('path');
const crypto = require('crypto');

const { appendJsonArray, readJsonArray } = require('../../utils/fileStore');

const filePath = path.join(__dirname, '..', '..', 'data', 'feedback.json');

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

  await appendJsonArray(filePath, item);
  return item;
}

async function list() {
  return readJsonArray(filePath);
}

module.exports = { create, list };
