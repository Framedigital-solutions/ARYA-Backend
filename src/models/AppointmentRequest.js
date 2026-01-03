const mongoose = require('mongoose');

const AppointmentRequestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: false, default: '' },
    preferred_date: { type: String, required: false, default: '' },
    preferred_time: { type: String, required: false, default: '' },
    notes: { type: String, required: false, default: '' },
    date: { type: String, required: false, default: '' },
    time: { type: String, required: false, default: '' },
    reason: { type: String, required: false, default: '' },
    status: { type: String, required: true, default: 'new' },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
    create_at: { type: String, required: true },
    update_at: { type: String, required: true },
  },
  { collection: 'appointment_requests', versionKey: false }
);

module.exports = mongoose.models.AppointmentRequest || mongoose.model('AppointmentRequest', AppointmentRequestSchema);
