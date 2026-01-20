const mongoose = require('mongoose');

const DoctorsTimelineItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    doctorName: { type: String, required: true },
    qualification: { type: String, required: true, default: '' },
    position: { type: Number, required: true, default: 0 },
    status: { type: String, required: true, default: 'active' },
    isDeleted: { type: Boolean, required: true, default: false },
    deletedAt: { type: String, default: '' },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { _id: false }
);

const DoctorsTimelineSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    title: { type: String, required: true, default: '' },
    tagline: { type: String, required: true, default: '' },
    yearLabel: { type: String, required: true, default: 'Year of Establishment' },
    yearOfEstablishment: { type: String, required: true, default: '' },
    foundersLabel: { type: String, required: true, default: 'Founder' },
    founders: { type: [String], required: true, default: [] },
    timelineItems: { type: [DoctorsTimelineItemSchema], required: true, default: [] },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { collection: 'doctors_timeline', versionKey: false }
);

DoctorsTimelineSchema.index({ 'timelineItems.position': 1 });

module.exports = mongoose.models.DoctorsTimeline || mongoose.model('DoctorsTimeline', DoctorsTimelineSchema);
