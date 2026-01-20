const doctorsTimelineService = require('./doctorsTimeline.service');
const {
  TimelineItemCreateSchema,
  TimelineItemUpdateSchema,
  DoctorsTimelineUpsertSchema,
  DoctorsTimelinePatchSchema,
  ReorderSchema,
} = require('./doctorsTimeline.validator');

const { sendError, sendSuccess } = require('../../utils/response');

async function getPublic(req, res, next) {
  try {
    const data = await doctorsTimelineService.getPublic();
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function getAdmin(req, res, next) {
  try {
    const data = await doctorsTimelineService.getAdmin();
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function upsertAdmin(req, res, next) {
  try {
    const parsed = DoctorsTimelineUpsertSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const saved = await doctorsTimelineService.upsertAdmin(parsed.data);
    return sendSuccess(res, { message: 'Doctors timeline updated', data: saved });
  } catch (err) {
    return next(err);
  }
}

async function patchAdmin(req, res, next) {
  try {
    const parsed = DoctorsTimelinePatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const saved = await doctorsTimelineService.patchAdmin(parsed.data);
    return sendSuccess(res, { message: 'Doctors timeline updated', data: saved });
  } catch (err) {
    return next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const parsed = TimelineItemCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const saved = await doctorsTimelineService.addItem(parsed.data);
    return sendSuccess(res, { status: 201, message: 'Doctor added', data: saved });
  } catch (err) {
    return next(err);
  }
}

async function patchItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const parsed = TimelineItemUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const saved = await doctorsTimelineService.patchItem(itemId, parsed.data);
    return sendSuccess(res, { message: 'Doctor updated', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function deleteItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const saved = await doctorsTimelineService.deleteItem(itemId);
    return sendSuccess(res, { message: 'Doctor removed', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function reorder(req, res, next) {
  try {
    const parsed = ReorderSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const saved = await doctorsTimelineService.reorder(parsed.data.ids);
    return sendSuccess(res, { message: 'Order updated', data: saved });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getPublic,
  getAdmin,
  upsertAdmin,
  patchAdmin,
  addItem,
  patchItem,
  deleteItem,
  reorder,
};
