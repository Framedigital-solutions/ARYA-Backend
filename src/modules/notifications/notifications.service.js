const AppointmentRequest = require('../../models/AppointmentRequest');
const ContactInquiry = require('../../models/ContactInquiry');
const Feedback = require('../../models/Feedback');

function snippet(text, max = 80) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function toCreatedAt(doc) {
  if (!doc || typeof doc !== 'object') return '';
  return String(doc.createdAt || doc.create_at || doc.updatedAt || doc.update_at || '');
}

async function getAdminNotifications({ limitPerType = 5 } = {}) {
  const [appointmentsNew, inquiriesNew, feedbackPending] = await Promise.all([
    AppointmentRequest.countDocuments({ status: 'new' }),
    ContactInquiry.countDocuments({ status: 'new' }),
    Feedback.countDocuments({ status: 'pending' }),
  ]);

  const [recentAppointments, recentInquiries, recentFeedback] = await Promise.all([
    AppointmentRequest.find({ status: 'new' }).sort({ createdAt: -1 }).limit(limitPerType).lean(),
    ContactInquiry.find({ status: 'new' }).sort({ createdAt: -1 }).limit(limitPerType).lean(),
    Feedback.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(limitPerType).lean(),
  ]);

  const items = [
    ...(recentAppointments || []).map((a) => ({
      type: 'appointment',
      tab: 'appointments',
      id: a && a.id ? String(a.id) : '',
      title: a && a.name ? String(a.name) : 'Appointment Request',
      subtitle: snippet(`${a && a.phone ? a.phone : ''}${a && (a.preferred_date || a.date) ? ` • ${a.preferred_date || a.date}` : ''}`),
      createdAt: toCreatedAt(a),
    })),
    ...(recentInquiries || []).map((i) => ({
      type: 'inquiry',
      tab: 'inquiries',
      id: i && i.id ? String(i.id) : '',
      title: i && i.name ? String(i.name) : 'Inquiry',
      subtitle: snippet(i && i.message ? i.message : ''),
      createdAt: toCreatedAt(i),
    })),
    ...(recentFeedback || []).map((f) => ({
      type: 'feedback',
      tab: 'feedback',
      id: f && f.id ? String(f.id) : '',
      title: f && f.name ? String(f.name) : 'Feedback',
      subtitle: snippet(`${Number.isFinite(f && f.rating ? Number(f.rating) : NaN) ? `Rating: ${Number(f.rating)} • ` : ''}${f && f.message ? f.message : ''}`),
      createdAt: toCreatedAt(f),
    })),
  ]
    .filter((it) => it && it.id)
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

  const totalNew = Number(appointmentsNew || 0) + Number(inquiriesNew || 0) + Number(feedbackPending || 0);

  return {
    counts: {
      appointmentsNew: Number(appointmentsNew || 0),
      inquiriesNew: Number(inquiriesNew || 0),
      feedbackPending: Number(feedbackPending || 0),
      totalNew,
    },
    items,
  };
}

module.exports = { getAdminNotifications };
