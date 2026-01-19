const settingsService = require('./settings.service');
const { SettingCreateSchema, SettingPatchSchema } = require('./settings.validator');
const { sendError, sendSuccess } = require('../../utils/response');

async function listSettings(req, res, next) {
  try {
    const data = await settingsService.list();
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function getSetting(req, res, next) {
  try {
    const { id } = req.params;
    const data = await settingsService.getById(id);
    if (!data) {
      return sendError(res, { status: 404, message: 'Setting not found' });
    }
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function createSetting(req, res, next) {
  try {
    const parsed = SettingCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const created = await settingsService.create(parsed.data);
    return sendSuccess(res, { status: 201, message: 'Setting created', data: created });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function patchSetting(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = SettingPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const updated = await settingsService.patchById(id, parsed.data);
    return sendSuccess(res, { message: 'Setting updated', data: updated });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function deleteSetting(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await settingsService.deleteById(id);
    return sendSuccess(res, { message: 'Setting deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

module.exports = { listSettings, getSetting, createSetting, patchSetting, deleteSetting };
