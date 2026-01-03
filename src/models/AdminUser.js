const mongoose = require('mongoose');

const AdminUserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, required: true },
    is_active: { type: Boolean, required: true, default: true },
    last_login_at: { type: String, required: false, default: '' },
    created_at: { type: String, required: true },
    update_at: { type: String, required: true },
  },
  { collection: 'admin_users', versionKey: false }
);

module.exports = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);
