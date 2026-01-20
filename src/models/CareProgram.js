const mongoose = require('mongoose');

const CareProgramSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    title: { type: String, required: true },
    shortDescription: { type: String, required: true, default: '' },
    iconType: { type: String, required: true, default: '' },
    bulletPoints: { type: [String], required: true, default: [] },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    status: { type: String, required: true, default: 'active' },
    displayOrder: { type: Number, required: true, default: 0 },
    isDeleted: { type: Boolean, required: true, default: false },
    deletedAt: { type: String, default: '' },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { collection: 'care_programs', versionKey: false }
);

CareProgramSchema.index({ displayOrder: 1 });
CareProgramSchema.index({ status: 1, isDeleted: 1 });

module.exports = mongoose.models.CareProgram || mongoose.model('CareProgram', CareProgramSchema);
