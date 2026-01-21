const clinicLocationService = require('./clinicLocation.service');
const { ClinicLocationCreateSchema, ClinicLocationPatchSchema, ParseLinkSchema } = require('./clinicLocation.validator');
const { sendError, sendSuccess } = require('../../utils/response');

async function getActive(req, res, next) {
  try {
    const data = await clinicLocationService.getActivePublic();
    if (!data) return sendError(res, { status: 404, message: 'Location not found' });
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function listAdmin(req, res, next) {
  try {
    const data = await clinicLocationService.listAdmin();
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function parseLink(req, res, next) {
  try {
    const parsed = ParseLinkSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const info = await clinicLocationService.parseGoogleMapLink(parsed.data.googleMapLink);
    if (!info.embedMapUrl || info.latitude === null || info.longitude === null) {
      return sendError(res, { status: 400, message: 'Could not extract latitude/longitude from the Google Maps link' });
    }

    return sendSuccess(res, {
      data: {
        googleMapLink: info.googleMapLink,
        embedMapUrl: info.embedMapUrl,
        latitude: info.latitude,
        longitude: info.longitude,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function createAdmin(req, res, next) {
  try {
    const parsed = ClinicLocationCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const created = await clinicLocationService.createAndActivate(parsed.data);
    return sendSuccess(res, { status: 201, message: 'Location saved', data: created });
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
    const parsed = ClinicLocationPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const updated = await clinicLocationService.patchById(id, parsed.data);
    return sendSuccess(res, { message: 'Location updated', data: updated });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function setActiveAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await clinicLocationService.setActive(id);
    return sendSuccess(res, { message: 'Location activated', data: updated });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function disableAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await clinicLocationService.disable(id);
    return sendSuccess(res, { message: 'Location disabled', data: updated });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

module.exports = {
  getActive,
  listAdmin,
  parseLink,
  createAdmin,
  patchAdmin,
  setActiveAdmin,
  disableAdmin,
};
