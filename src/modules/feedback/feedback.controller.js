const { FeedbackCreateSchema, FeedbackPatchSchema } = require('./feedback.validator');
const feedbackService = require('./feedback.service');
const { sendError, sendSuccess } = require('../../utils/response');

async function createFeedback(req, res, next) {
  try {
    const parsed = FeedbackCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const saved = await feedbackService.create(parsed.data);

    return sendSuccess(res, { status: 201, message: 'Feedback received', data: saved });
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

    return sendSuccess(res, { data: sorted });
  } catch (err) {
    return next(err);
  }
}

async function patchFeedback(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = FeedbackPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const updated = await feedbackService.patchById(id, parsed.data);
    return sendSuccess(res, { message: 'Feedback updated', data: updated });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function deleteFeedback(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await feedbackService.deleteById(id);
    return sendSuccess(res, { message: 'Feedback deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

module.exports = { createFeedback, listFeedback, patchFeedback, deleteFeedback };
