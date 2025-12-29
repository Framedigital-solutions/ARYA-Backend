const { FeedbackCreateSchema } = require('./feedback.validator');
const feedbackService = require('./feedback.service');

async function createFeedback(req, res, next) {
  try {
    const parsed = FeedbackCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const saved = await feedbackService.create(parsed.data);

    return res.status(201).json({
      ok: true,
      message: 'Feedback received',
      data: saved,
    });
  } catch (err) {
    return next(err);
  }
}

async function listFeedback(req, res, next) {
  try {
    const { status } = req.query;
    const items = await feedbackService.list();

    const filtered = status
      ? items.filter((i) => i && i.status === status)
      : items;

    const sorted = [...filtered].sort((a, b) => {
      const at = a && (a.createdAt || a.create_at) ? String(a.createdAt || a.create_at) : '';
      const bt = b && (b.createdAt || b.create_at) ? String(b.createdAt || b.create_at) : '';
      return bt.localeCompare(at);
    });

    return res.json({ ok: true, data: sorted });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createFeedback, listFeedback };
