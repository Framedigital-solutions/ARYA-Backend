const mongoose = require('mongoose');

const ContactInquirySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false, default: '' },
    message: { type: String, required: true },
    source: { type: String, required: false, default: '' },
    status: { type: String, required: true, default: 'new' },
    assigned_to_user_id: { type: String, required: false, default: '' },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
    create_at: { type: String, required: true },
    update_at: { type: String, required: true },
  },
  { collection: 'contact_inquiries', versionKey: false }
);

module.exports = mongoose.models.ContactInquiry || mongoose.model('ContactInquiry', ContactInquirySchema);
