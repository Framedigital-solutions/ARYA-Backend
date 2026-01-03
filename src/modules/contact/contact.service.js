const crypto = require('crypto');

const ContactInquiry = require('../../models/ContactInquiry');

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

  await ContactInquiry.create(item);
  return item;
}

async function list({ status, assigned_to_user_id } = {}) {
  const query = {};
  if (status) query.status = status;
  if (assigned_to_user_id) query.assigned_to_user_id = assigned_to_user_id;
  return ContactInquiry.find(query).lean();
}

async function getById(id) {
  return ContactInquiry.findOne({ id }).lean();
}

async function patchById(id, patch) {
  const now = new Date().toISOString();

  const saved = await ContactInquiry.findOneAndUpdate(
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

  if (!saved) {
    const err = new Error('Inquiry not found');
    err.statusCode = 404;
    throw err;
  }

  return saved;
}

async function deleteById(id) {
  const removed = await ContactInquiry.findOneAndDelete({ id }).lean();
  if (!removed) {
    const err = new Error('Inquiry not found');
    err.statusCode = 404;
    throw err;
  }
  return removed;
}

module.exports = {
  create,
  list,
  getById,
  patchById,
  deleteById,
};
