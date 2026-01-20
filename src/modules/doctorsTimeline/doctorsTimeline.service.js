const crypto = require('crypto');

const DoctorsTimeline = require('../../models/DoctorsTimeline');

const DOC_ID = 'doctors_timeline_main';

function nowIso() {
  return new Date().toISOString();
}

function toPlain(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  const { _id, ...rest } = doc;
  return rest;
}

function normalizeFounders(founders) {
  if (!Array.isArray(founders)) return [];
  return founders.map((s) => String(s || '').trim()).filter(Boolean).slice(0, 20);
}

function normalizeItems(items, existingItems) {
  const now = nowIso();
  const baseExisting = Array.isArray(existingItems) ? existingItems : [];

  const norm = Array.isArray(items)
    ? items
        .filter((it) => it && typeof it === 'object')
        .map((it) => {
          const id = it.id ? String(it.id) : crypto.randomUUID();
          const prev = baseExisting.find((p) => String(p && p.id) === id) || null;
          const createdAt = prev && prev.createdAt ? String(prev.createdAt) : now;

          return {
            id,
            doctorName: String(it.doctorName || '').trim(),
            qualification: typeof it.qualification === 'string' ? String(it.qualification) : '',
            position: Number.isFinite(Number(it.position)) ? Number(it.position) : 0,
            status: it.status === 'inactive' ? 'inactive' : 'active',
            isDeleted: Boolean(it.isDeleted),
            deletedAt: typeof it.deletedAt === 'string' ? String(it.deletedAt) : '',
            createdAt,
            updatedAt: now,
          };
        })
    : [];

  return norm;
}

function sortItems(items) {
  const list = Array.isArray(items) ? items : [];
  const pos = (it) => (Number.isFinite(Number(it && it.position)) ? Number(it.position) : 0);
  return [...list].sort((a, b) => pos(a) - pos(b));
}

async function getOrCreateDefault() {
  const existing = await DoctorsTimeline.findOne({ id: DOC_ID }).lean();
  if (existing) return toPlain(existing);

  const now = nowIso();
  const created = {
    id: DOC_ID,
    title: 'Doctors Journey',
    tagline: 'From founders to next generation doctors.',
    yearLabel: 'Year of Establishment',
    yearOfEstablishment: '1985',
    foundersLabel: 'Founder',
    founders: ['Dr Subhag Lal Gupta', 'Dr Vishnu Kant Gupta'],
    timelineItems: [
      {
        id: crypto.randomUUID(),
        doctorName: 'Dr Subhag Lal Gupta\nDr Vishnu Kant Gupta',
        qualification: 'Beginning a journey of natural healing',
        position: 1,
        status: 'active',
        isDeleted: false,
        deletedAt: '',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        doctorName: 'Dr. Ratan Lal Gupta',
        qualification: 'B.H.M.S (BU) MD',
        position: 2,
        status: 'active',
        isDeleted: false,
        deletedAt: '',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        doctorName: 'Dr. Dharam Kumar Gupta',
        qualification: 'B.H.M.S (BU)',
        position: 3,
        status: 'active',
        isDeleted: false,
        deletedAt: '',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        doctorName: 'Dr Chandra Bhusan Kumar',
        qualification: 'B.H.M.S (BU)',
        position: 4,
        status: 'active',
        isDeleted: false,
        deletedAt: '',
        createdAt: now,
        updatedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  await DoctorsTimeline.create(created);
  return created;
}

async function getPublic() {
  const doc = await getOrCreateDefault();
  const items = sortItems(doc.timelineItems)
    .filter((it) => it && it.isDeleted !== true)
    .filter((it) => String(it.status || 'active') === 'active');

  return {
    ...doc,
    founders: normalizeFounders(doc.founders),
    timelineItems: items,
  };
}

async function getAdmin() {
  const doc = await getOrCreateDefault();
  const items = sortItems(doc.timelineItems).filter((it) => it && it.isDeleted !== true);
  return {
    ...doc,
    founders: normalizeFounders(doc.founders),
    timelineItems: items,
  };
}

async function upsertAdmin(payload) {
  const current = await getOrCreateDefault();
  const now = nowIso();

  const next = {
    ...current,
    title: typeof payload.title === 'string' ? String(payload.title) : String(current.title || ''),
    tagline: typeof payload.tagline === 'string' ? String(payload.tagline) : String(current.tagline || ''),
    yearLabel: typeof payload.yearLabel === 'string' ? String(payload.yearLabel) : String(current.yearLabel || 'Year of Establishment'),
    yearOfEstablishment:
      typeof payload.yearOfEstablishment === 'string' ? String(payload.yearOfEstablishment) : String(current.yearOfEstablishment || ''),
    foundersLabel: typeof payload.foundersLabel === 'string' ? String(payload.foundersLabel) : String(current.foundersLabel || 'Founder'),
    founders: normalizeFounders(payload.founders ?? current.founders),
    updatedAt: now,
  };

  const saved = await DoctorsTimeline.findOneAndUpdate({ id: DOC_ID }, { $set: next }, { upsert: true, new: true, lean: true });
  return saved ? toPlain(saved) : next;
}

async function patchAdmin(patch) {
  const current = await getOrCreateDefault();
  return upsertAdmin({
    title: typeof patch.title !== 'undefined' ? patch.title : current.title,
    tagline: typeof patch.tagline !== 'undefined' ? patch.tagline : current.tagline,
    yearLabel: typeof patch.yearLabel !== 'undefined' ? patch.yearLabel : current.yearLabel,
    yearOfEstablishment: typeof patch.yearOfEstablishment !== 'undefined' ? patch.yearOfEstablishment : current.yearOfEstablishment,
    foundersLabel: typeof patch.foundersLabel !== 'undefined' ? patch.foundersLabel : current.foundersLabel,
    founders: typeof patch.founders !== 'undefined' ? patch.founders : current.founders,
  });
}

async function addItem(payload) {
  const current = await getOrCreateDefault();
  const now = nowIso();

  const item = {
    id: crypto.randomUUID(),
    doctorName: String(payload.doctorName || '').trim(),
    qualification: typeof payload.qualification === 'string' ? String(payload.qualification) : '',
    position: Number.isFinite(Number(payload.position)) ? Number(payload.position) : 0,
    status: payload.status === 'inactive' ? 'inactive' : 'active',
    isDeleted: false,
    deletedAt: '',
    createdAt: now,
    updatedAt: now,
  };

  const nextItems = [...(Array.isArray(current.timelineItems) ? current.timelineItems : []), item];

  const saved = await DoctorsTimeline.findOneAndUpdate(
    { id: DOC_ID },
    { $set: { timelineItems: nextItems, updatedAt: now } },
    { new: true, lean: true }
  );

  return saved ? toPlain(saved) : { ...current, timelineItems: nextItems };
}

async function patchItem(itemId, patch) {
  const current = await getOrCreateDefault();
  const now = nowIso();

  const items = Array.isArray(current.timelineItems) ? current.timelineItems : [];
  const idx = items.findIndex((it) => String(it && it.id) === String(itemId));
  if (idx < 0 || (items[idx] && items[idx].isDeleted)) {
    const err = new Error('Timeline item not found');
    err.statusCode = 404;
    throw err;
  }

  const prev = items[idx];
  const nextItem = {
    ...prev,
    ...(patch || {}),
    doctorName: typeof patch.doctorName !== 'undefined' ? String(patch.doctorName || '').trim() : String(prev.doctorName || ''),
    qualification: typeof patch.qualification !== 'undefined' ? String(patch.qualification || '') : String(prev.qualification || ''),
    position: typeof patch.position !== 'undefined' ? Number(patch.position || 0) : Number(prev.position || 0),
    status: patch && patch.status === 'inactive' ? 'inactive' : (patch && patch.status === 'active' ? 'active' : prev.status || 'active'),
    updatedAt: now,
  };

  const nextItems = [...items];
  nextItems[idx] = nextItem;

  const saved = await DoctorsTimeline.findOneAndUpdate(
    { id: DOC_ID },
    { $set: { timelineItems: nextItems, updatedAt: now } },
    { new: true, lean: true }
  );

  return saved ? toPlain(saved) : { ...current, timelineItems: nextItems };
}

async function deleteItem(itemId) {
  const current = await getOrCreateDefault();
  const now = nowIso();

  const items = Array.isArray(current.timelineItems) ? current.timelineItems : [];
  const idx = items.findIndex((it) => String(it && it.id) === String(itemId));
  if (idx < 0 || (items[idx] && items[idx].isDeleted)) {
    const err = new Error('Timeline item not found');
    err.statusCode = 404;
    throw err;
  }

  const prev = items[idx];
  const nextItem = { ...prev, isDeleted: true, deletedAt: now, status: 'inactive', updatedAt: now };

  const nextItems = [...items];
  nextItems[idx] = nextItem;

  const saved = await DoctorsTimeline.findOneAndUpdate(
    { id: DOC_ID },
    { $set: { timelineItems: nextItems, updatedAt: now } },
    { new: true, lean: true }
  );

  return saved ? toPlain(saved) : { ...current, timelineItems: nextItems };
}

async function reorder(ids) {
  const current = await getOrCreateDefault();
  const now = nowIso();

  const items = Array.isArray(current.timelineItems) ? current.timelineItems : [];
  const idList = Array.isArray(ids) ? ids.map((s) => String(s)) : [];

  const posById = new Map();
  idList.forEach((id, i) => {
    posById.set(String(id), i + 1);
  });

  const nextItems = items.map((it) => {
    const id = String(it && it.id ? it.id : '');
    if (!id || !posById.has(id)) return it;
    return { ...it, position: posById.get(id), updatedAt: now };
  });

  const saved = await DoctorsTimeline.findOneAndUpdate(
    { id: DOC_ID },
    { $set: { timelineItems: nextItems, updatedAt: now } },
    { new: true, lean: true }
  );

  return saved ? toPlain(saved) : { ...current, timelineItems: nextItems };
}

module.exports = {
  getPublic,
  getAdmin,
  upsertAdmin,
  patchAdmin,
  addItem,
  patchItem,
  deleteItem,
  reorder,
  getOrCreateDefault,
};
