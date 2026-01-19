const contentService = require('./content.service');
const { ProgramCreateSchema, ProgramUpdateSchema } = require('./programs.validator');
const { ClinicProfileUpsertSchema, ClinicProfilePatchSchema } = require('./clinicProfile.validator');
const { TestimonialCreateSchema, TestimonialUpdateSchema } = require('./testimonials.validator');
const { HomeUpsertSchema, HomePatchSchema } = require('./home.validator');
const { sendError, sendSuccess } = require('../../utils/response');

async function getContent(req, res, next) {
  try {
    const data = await contentService.getAll();
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function listProgramsPublic(req, res, next) {
  try {
    const data = await contentService.listPrograms({ includeUnpublished: false });
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function listProgramsAdmin(req, res, next) {
  try {
    const data = await contentService.listPrograms({ includeUnpublished: true });
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function createProgram(req, res, next) {
  try {
    const parsed = ProgramCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const created = await contentService.createProgram(parsed.data);
    return sendSuccess(res, { status: 201, message: 'Program created', data: created });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function updateProgram(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = ProgramUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const updated = await contentService.updateProgram(id, parsed.data);
    return sendSuccess(res, { message: 'Program updated', data: updated });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function deleteProgram(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await contentService.deleteProgram(id);
    return sendSuccess(res, { message: 'Program deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function getClinicProfilePublic(req, res, next) {
  try {
    const data = await contentService.getClinicProfile();
    if (!data) {
      return sendError(res, { status: 404, message: 'Clinic profile not found' });
    }
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function getClinicProfileAdmin(req, res, next) {
  return getClinicProfilePublic(req, res, next);
}

async function upsertClinicProfile(req, res, next) {
  try {
    const parsed = ClinicProfileUpsertSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const saved = await contentService.upsertClinicProfile(parsed.data);
    return sendSuccess(res, { message: 'Clinic profile updated', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function patchClinicProfile(req, res, next) {
  try {
    const parsed = ClinicProfilePatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const saved = await contentService.patchClinicProfile(parsed.data);
    return sendSuccess(res, { message: 'Clinic profile updated', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function deleteClinicProfile(req, res, next) {
  try {
    const removed = await contentService.deleteClinicProfile();
    return sendSuccess(res, { message: 'Clinic profile deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function getHomePublic(req, res, next) {
  try {
    const data = await contentService.getHome();
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function getHomeAdmin(req, res, next) {
  return getHomePublic(req, res, next);
}

async function upsertHome(req, res, next) {
  try {
    const parsed = HomeUpsertSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const saved = await contentService.upsertHome(parsed.data);
    return sendSuccess(res, { message: 'Home content updated', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function patchHome(req, res, next) {
  try {
    const parsed = HomePatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const saved = await contentService.patchHome(parsed.data);
    return sendSuccess(res, { message: 'Home content updated', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function deleteHome(req, res, next) {
  try {
    const removed = await contentService.deleteHome();
    return sendSuccess(res, { message: 'Home content reset', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function listTestimonialsPublic(req, res, next) {
  try {
    const data = await contentService.listTestimonials({ includeUnpublished: false });
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function listTestimonialsAdmin(req, res, next) {
  try {
    const data = await contentService.listTestimonials({ includeUnpublished: true });
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function createTestimonial(req, res, next) {
  try {
    const parsed = TestimonialCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const created = await contentService.createTestimonial(parsed.data);
    return sendSuccess(res, { status: 201, message: 'Testimonial created', data: created });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function updateTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = TestimonialUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const updated = await contentService.updateTestimonial(id, parsed.data);
    return sendSuccess(res, { message: 'Testimonial updated', data: updated });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function deleteTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await contentService.deleteTestimonial(id);
    return sendSuccess(res, { message: 'Testimonial deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function getContentSection(req, res, next) {
  try {
    const { section } = req.params;
    const data = await contentService.getSection(section);
    if (typeof data === 'undefined') {
      return sendError(res, { status: 404, message: 'Content section not found' });
    }
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function putContent(req, res, next) {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return sendError(res, { status: 400, message: 'Body must be a JSON object' });
    }

    const saved = await contentService.setAll(body);
    return sendSuccess(res, { message: 'Content updated', data: saved });
  } catch (err) {
    return next(err);
  }
}

async function putContentSection(req, res, next) {
  try {
    const { section } = req.params;
    const body = req.body;
    if (typeof body === 'undefined') {
      return sendError(res, { status: 400, message: 'Body is required' });
    }

    const saved = await contentService.setSection(section, body);
    return sendSuccess(res, { message: 'Content updated', data: saved[section] });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getContent,
  getContentSection,
  putContent,
  putContentSection,
  listProgramsPublic,
  listProgramsAdmin,
  createProgram,
  updateProgram,
  deleteProgram,
  getClinicProfilePublic,
  getClinicProfileAdmin,
  upsertClinicProfile,
  patchClinicProfile,
  deleteClinicProfile,
  getHomePublic,
  getHomeAdmin,
  upsertHome,
  patchHome,
  deleteHome,
  listTestimonialsPublic,
  listTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
