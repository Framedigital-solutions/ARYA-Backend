const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    key: { type: String, required: true, index: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: String, default: '' },
    createdAt: { type: String, default: '' },
    updatedAt: { type: String, default: '' },
    create_at: { type: String, default: '' },
    update_at: { type: String, default: '' },
  },
  { collection: 'settings', versionKey: false }
);

module.exports = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
