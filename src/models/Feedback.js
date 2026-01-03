const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    message: { type: String, required: true },
    status: { type: String, required: true, default: 'pending' },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
    create_at: { type: String, required: true },
    update_at: { type: String, required: true },
  },
  { collection: 'feedback', versionKey: false }
);

module.exports = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
