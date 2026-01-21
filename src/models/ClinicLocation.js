const mongoose = require('mongoose');

const ClinicLocationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    clinicName: { type: String, required: true, default: '' },
    googleMapLink: { type: String, required: true, default: '' },
    embedMapUrl: { type: String, required: true, default: '' },
    latitude: { type: Number, required: true, default: 0 },
    longitude: { type: Number, required: true, default: 0 },
    addressText: { type: String, required: true, default: '' },
    status: { type: String, required: true, default: 'active' },
    createdAt: { type: String, required: true, default: '' },
    updatedAt: { type: String, required: true, default: '' },
  },
  { collection: 'clinic_locations', versionKey: false }
);

module.exports = mongoose.models.ClinicLocation || mongoose.model('ClinicLocation', ClinicLocationSchema);
