const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const Feedback = require('./models/Feedback');
const AdminUser = require('./models/AdminUser');
const CareProgram = require('./models/CareProgram');
const DoctorsTimeline = require('./models/DoctorsTimeline');
const adminUsersService = require('./modules/adminUsers/adminUsers.service');
const { inferIconType, generateBulletPoints } = require('./modules/carePrograms/carePrograms.defaults');

async function seedFeedbackIfEmpty() {
  const count = await Feedback.estimatedDocumentCount();
  if (count > 0) return;

  const filePath = path.join(__dirname, 'data', 'feedback.json');
  let items;
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    items = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err && err.code === 'ENOENT') return;
    throw err;
  }

  const now = new Date().toISOString();
  const ops = items
    .filter((i) => i && typeof i === 'object' && typeof i.id === 'string' && i.id)
    .map((i) => {
      const createdAt = typeof i.createdAt === 'string' && i.createdAt ? i.createdAt : now;
      const updatedAt = typeof i.updatedAt === 'string' && i.updatedAt ? i.updatedAt : createdAt;
      const create_at = typeof i.create_at === 'string' && i.create_at ? i.create_at : createdAt;
      const update_at = typeof i.update_at === 'string' && i.update_at ? i.update_at : updatedAt;

      const doc = {
        ...i,
        status: 'approved',
        createdAt,
        updatedAt,
        create_at,
        update_at,
      };

      return {
        updateOne: {
          filter: { id: i.id },
          update: { $setOnInsert: doc },
          upsert: true,
        },
      };
    });

  if (!ops.length) return;
  await Feedback.bulkWrite(ops, { ordered: false });
}

async function seedBootstrapAdminIfEmpty() {
  const envEmail = process.env.ADMIN_EMAIL;
  const envPassword = process.env.ADMIN_PASSWORD;
  const envReset = String(process.env.ADMIN_RESET || '').toLowerCase() === 'true';

  const desiredEmail = String(envEmail || '').trim().toLowerCase();
  const desiredPassword = String(envPassword || '');
  if (!desiredEmail || !desiredPassword) return;

  const desiredName = String(process.env.ADMIN_NAME || 'Super Admin');
  const shouldReset = envReset;

  const passwordHash = String(desiredPassword).startsWith('$2') ? String(desiredPassword) : bcrypt.hashSync(String(desiredPassword), 12);

  const existing = await AdminUser.findOne({ email: desiredEmail }).lean();
  if (!existing) {
    const now = new Date().toISOString();
    await AdminUser.create({
      id: crypto.randomUUID(),
      name: desiredName,
      email: desiredEmail,
      password_hash: passwordHash,
      role: 'super_admin',
      status: 'active',
      is_active: true,
      permissions: {},
      last_login_at: '',
      token_version: 0,
      created_at: now,
      update_at: now,
    });
    return;
  }

  if (shouldReset) {
    await adminUsersService.patchById(existing.id, {
      name: desiredName,
      password: desiredPassword,
      role: 'super_admin',
      is_active: true,
      status: 'active',
    });
  }
}

async function seedCareProgramsIfEmpty() {
  const count = await CareProgram.estimatedDocumentCount();
  if (count > 0) return;

  const now = new Date().toISOString();

  const defaults = [
    { title: 'Paralysis Recovery Program', shortDescription: 'Supportive care focused on movement and daily comfort.', displayOrder: 1 },
    { title: 'Polio Management', shortDescription: 'Gentle long-term care for mobility and quality of life.', displayOrder: 2 },
    { title: 'Neural Care & Wellness', shortDescription: 'Whole-body wellness support for nerves, sleep, and stress.', displayOrder: 3 },
    { title: 'Gonorrhea Treatment', shortDescription: 'Private, supportive care with a wellness-first approach.', displayOrder: 4 },
    { title: 'Jaundice Treatment', shortDescription: 'Gentle recovery support with diet and lifestyle guidance.', displayOrder: 5 },
    { title: 'Eczema Treatment', shortDescription: 'Skin comfort support with simple lifestyle guidance.', displayOrder: 6 },
    { title: 'Asthma Treatment', shortDescription: 'Breathing comfort support with trigger and lifestyle guidance.', displayOrder: 7 },
    { title: 'Arthritis Treatment', shortDescription: 'Support for pain, stiffness, and daily movement comfort.', displayOrder: 8 },
    { title: 'Vata / Sciatica Treatment', shortDescription: 'Support for nerve pain and mobility with gentle care.', displayOrder: 9 },
  ];

  const docs = defaults.map((d) => {
    const iconType = inferIconType({ title: d.title, iconType: '' });
    const bulletPoints = generateBulletPoints({ title: d.title, iconType, bulletPoints: [] });
    return {
      id: crypto.randomUUID(),
      title: d.title,
      shortDescription: d.shortDescription,
      iconType,
      bulletPoints,
      image: { url: '', publicId: '' },
      status: 'active',
      displayOrder: d.displayOrder,
      isDeleted: false,
      deletedAt: '',
      createdAt: now,
      updatedAt: now,
    };
  });

  await CareProgram.insertMany(docs, { ordered: false });
}

async function seedDoctorsTimelineIfEmpty() {
  const count = await DoctorsTimeline.estimatedDocumentCount();
  if (count > 0) return;

  const now = new Date().toISOString();

  await DoctorsTimeline.create({
    id: 'doctors_timeline_main',
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
  });
}

async function connectDb() {
  const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';

  const uri = process.env.MONGODB_URI || (isDev ? 'mongodb://127.0.0.1:27017/arya' : '');
  if (!uri) {
    throw new Error('Missing MONGODB_URI');
  }

  const dbName = process.env.MONGODB_DB_NAME || 'arya';

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    ...(dbName ? { dbName } : {}),
  });

  await seedFeedbackIfEmpty();
  await seedBootstrapAdminIfEmpty();
  await seedCareProgramsIfEmpty();
  await seedDoctorsTimelineIfEmpty();

  return mongoose.connection;
}

module.exports = { connectDb };
