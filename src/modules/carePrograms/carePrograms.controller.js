const careProgramsService = require('./carePrograms.service');
const { CareProgramCreateSchema, CareProgramUpdateSchema } = require('./carePrograms.validator');
const { sendError, sendSuccess } = require('../../utils/response');

async function listPublic(req, res, next) {
  try {
    const data = await careProgramsService.listPublic();
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function listAdmin(req, res, next) {
  try {
    const data = await careProgramsService.listAdmin();
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function createAdmin(req, res, next) {
  try {
    const parsed = CareProgramCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const created = await careProgramsService.create(parsed.data);
    return sendSuccess(res, { status: 201, message: 'Program created', data: created });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function patchAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = CareProgramUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const updated = await careProgramsService.patchById(id, parsed.data);
    return sendSuccess(res, { message: 'Program updated', data: updated });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function deleteAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await careProgramsService.softDeleteById(id);
    return sendSuccess(res, { message: 'Program deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

module.exports = {
  listPublic,
  listAdmin,
  createAdmin,
  patchAdmin,
  deleteAdmin,
};
