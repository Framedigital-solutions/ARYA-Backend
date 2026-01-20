const crypto = require('crypto');

const CareProgram = require('../../models/CareProgram');
const { inferIconType, generateBulletPoints } = require('./carePrograms.defaults');

function toPlain(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  const { _id, ...rest } = doc;
  return rest;
}

function normalizeImage(image) {
  if (!image || typeof image !== 'object') return { url: '', publicId: '' };
  return {
    url: typeof image.url === 'string' ? String(image.url) : '',
    publicId: typeof image.publicId === 'string' ? String(image.publicId) : '',
  };
}

async function listPublic() {
  const docs = await CareProgram.find({ isDeleted: false, status: 'active' })
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();
  return docs.map(toPlain);
}

async function listAdmin() {
  const docs = await CareProgram.find({ isDeleted: false })
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();
  return docs.map(toPlain);
}

async function getById(id) {
  const doc = await CareProgram.findOne({ id, isDeleted: false }).lean();
  return doc ? toPlain(doc) : undefined;
}

async function create(payload) {
  const now = new Date().toISOString();

  const title = String(payload.title || '').trim();
  const shortDescription = typeof payload.shortDescription === 'string' ? String(payload.shortDescription) : '';

  const iconType = inferIconType({ title, iconType: payload.iconType });
  const bulletPoints = generateBulletPoints({ title, iconType, bulletPoints: payload.bulletPoints });

  const item = {
    id: crypto.randomUUID(),
    title,
    shortDescription,
    iconType,
    bulletPoints,
    image: normalizeImage(payload.image),
    status: payload.status === 'inactive' ? 'inactive' : 'active',
    displayOrder: Number.isFinite(Number(payload.displayOrder)) ? Number(payload.displayOrder) : 0,
    isDeleted: false,
    deletedAt: '',
    createdAt: now,
    updatedAt: now,
  };

  await CareProgram.create(item);
  return item;
}

async function patchById(id, patch) {
  const current = await CareProgram.findOne({ id, isDeleted: false }).lean();
  if (!current) {
    const err = new Error('Program not found');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date().toISOString();

  const nextTitle = typeof patch.title !== 'undefined' ? String(patch.title || '').trim() : String(current.title || '').trim();
  const nextShort = typeof patch.shortDescription !== 'undefined' ? String(patch.shortDescription || '') : String(current.shortDescription || '');

  const iconType = typeof patch.iconType !== 'undefined' ? inferIconType({ title: nextTitle, iconType: patch.iconType }) : String(current.iconType || '');

  const bulletPoints =
    typeof patch.bulletPoints !== 'undefined'
      ? generateBulletPoints({ title: nextTitle, iconType, bulletPoints: patch.bulletPoints })
      : Array.isArray(current.bulletPoints)
        ? current.bulletPoints
        : [];

  const next = {
    ...current,
    ...(patch || {}),
    title: nextTitle,
    shortDescription: nextShort,
    iconType,
    bulletPoints: Array.isArray(bulletPoints) ? bulletPoints.slice(0, 3) : [],
    image: typeof patch.image !== 'undefined' ? normalizeImage(patch.image) : normalizeImage(current.image),
    status: patch && patch.status === 'inactive' ? 'inactive' : (patch && patch.status === 'active' ? 'active' : current.status || 'active'),
    displayOrder: typeof patch.displayOrder !== 'undefined' ? Number(patch.displayOrder || 0) : Number(current.displayOrder || 0),
    updatedAt: now,
  };

  const saved = await CareProgram.findOneAndUpdate({ id }, { $set: next }, { new: true, lean: true });
  return saved ? toPlain(saved) : toPlain(next);
}

async function softDeleteById(id) {
  const current = await CareProgram.findOne({ id, isDeleted: false }).lean();
  if (!current) {
    const err = new Error('Program not found');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date().toISOString();
  const next = {
    ...current,
    isDeleted: true,
    deletedAt: now,
    status: 'inactive',
    updatedAt: now,
  };

  const saved = await CareProgram.findOneAndUpdate({ id }, { $set: next }, { new: true, lean: true });
  return saved ? toPlain(saved) : toPlain(next);
}

module.exports = {
  listPublic,
  listAdmin,
  getById,
  create,
  patchById,
  softDeleteById,
};
