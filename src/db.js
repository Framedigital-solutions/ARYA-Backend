const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');

const Feedback = require('./models/Feedback');
const AdminUser = require('./models/AdminUser');
const adminUsersService = require('./modules/adminUsers/adminUsers.service');

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
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const count = await AdminUser.estimatedDocumentCount();
  if (count > 0) return;

  const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';
  const nextEmail = email || (isDev ? 'admin@example.com' : '');
  const nextPassword = password || (isDev ? 'Admin@12345' : '');
  if (!nextEmail || !nextPassword) return;

  const name = process.env.BOOTSTRAP_ADMIN_NAME || 'Admin';
  await adminUsersService.create({
    name,
    email: nextEmail,
    password: nextPassword,
    role: 'admin',
    is_active: true,
  });
}

async function connectDb() {
  const uri = process.env.MONGODB_URI;
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

  return mongoose.connection;
}

module.exports = { connectDb };
