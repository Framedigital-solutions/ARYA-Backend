const settingsService = require('./settings.service');
const { SettingCreateSchema, SettingPatchSchema } = require('./settings.validator');

async function listSettings(req, res, next) {
  try {
    const data = await settingsService.list();
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getSetting(req, res, next) {
  try {
    const { id } = req.params;
    const data = await settingsService.getById(id);
    if (!data) {
      return res.status(404).json({ ok: false, message: 'Setting not found' });
    }
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function createSetting(req, res, next) {
  try {
    const parsed = SettingCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const created = await settingsService.create(parsed.data);
    return res.status(201).json({ ok: true, message: 'Setting created', data: created });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function patchSetting(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = SettingPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const updated = await settingsService.patchById(id, parsed.data);
    return res.json({ ok: true, message: 'Setting updated', data: updated });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function deleteSetting(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await settingsService.deleteById(id);
    return res.json({ ok: true, message: 'Setting deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

module.exports = { listSettings, getSetting, createSetting, patchSetting, deleteSetting };
