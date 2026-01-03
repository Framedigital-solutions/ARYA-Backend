const contentService = require('./content.service');
const { ProgramCreateSchema, ProgramUpdateSchema } = require('./programs.validator');
const { ClinicProfileUpsertSchema, ClinicProfilePatchSchema } = require('./clinicProfile.validator');
const { TestimonialCreateSchema, TestimonialUpdateSchema } = require('./testimonials.validator');
const { HomeUpsertSchema, HomePatchSchema } = require('./home.validator');

async function getContent(req, res, next) {
  try {
    const data = await contentService.getAll();
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function listProgramsPublic(req, res, next) {
  try {
    const data = await contentService.listPrograms({ includeUnpublished: false });
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function listProgramsAdmin(req, res, next) {
  try {
    const data = await contentService.listPrograms({ includeUnpublished: true });
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function createProgram(req, res, next) {
  try {
    const parsed = ProgramCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const created = await contentService.createProgram(parsed.data);
    return res.status(201).json({ ok: true, message: 'Program created', data: created });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function updateProgram(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = ProgramUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const updated = await contentService.updateProgram(id, parsed.data);
    return res.json({ ok: true, message: 'Program updated', data: updated });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function deleteProgram(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await contentService.deleteProgram(id);
    return res.json({ ok: true, message: 'Program deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function getClinicProfilePublic(req, res, next) {
  try {
    const data = await contentService.getClinicProfile();
    if (!data) {
      return res.status(404).json({ ok: false, message: 'Clinic profile not found' });
    }
    return res.json({ ok: true, data });
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
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const saved = await contentService.upsertClinicProfile(parsed.data);
    return res.json({ ok: true, message: 'Clinic profile updated', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function patchClinicProfile(req, res, next) {
  try {
    const parsed = ClinicProfilePatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const saved = await contentService.patchClinicProfile(parsed.data);
    return res.json({ ok: true, message: 'Clinic profile updated', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function deleteClinicProfile(req, res, next) {
  try {
    const removed = await contentService.deleteClinicProfile();
    return res.json({ ok: true, message: 'Clinic profile deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function getHomePublic(req, res, next) {
  try {
    const data = await contentService.getHome();
    return res.json({ ok: true, data });
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
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const saved = await contentService.upsertHome(parsed.data);
    return res.json({ ok: true, message: 'Home content updated', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function patchHome(req, res, next) {
  try {
    const parsed = HomePatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const saved = await contentService.patchHome(parsed.data);
    return res.json({ ok: true, message: 'Home content updated', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function deleteHome(req, res, next) {
  try {
    const removed = await contentService.deleteHome();
    return res.json({ ok: true, message: 'Home content reset', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function listTestimonialsPublic(req, res, next) {
  try {
    const data = await contentService.listTestimonials({ includeUnpublished: false });
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function listTestimonialsAdmin(req, res, next) {
  try {
    const data = await contentService.listTestimonials({ includeUnpublished: true });
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function createTestimonial(req, res, next) {
  try {
    const parsed = TestimonialCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const created = await contentService.createTestimonial(parsed.data);
    return res.status(201).json({ ok: true, message: 'Testimonial created', data: created });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function updateTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = TestimonialUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const updated = await contentService.updateTestimonial(id, parsed.data);
    return res.json({ ok: true, message: 'Testimonial updated', data: updated });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function deleteTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await contentService.deleteTestimonial(id);
    return res.json({ ok: true, message: 'Testimonial deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function getContentSection(req, res, next) {
  try {
    const { section } = req.params;
    const data = await contentService.getSection(section);
    if (typeof data === 'undefined') {
      return res.status(404).json({ ok: false, message: 'Content section not found' });
    }
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function putContent(req, res, next) {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ ok: false, message: 'Body must be a JSON object' });
    }

    const saved = await contentService.setAll(body);
    return res.json({ ok: true, message: 'Content updated', data: saved });
  } catch (err) {
    return next(err);
  }
}

async function putContentSection(req, res, next) {
  try {
    const { section } = req.params;
    const body = req.body;
    if (typeof body === 'undefined') {
      return res.status(400).json({ ok: false, message: 'Body is required' });
    }

    const saved = await contentService.setSection(section, body);
    return res.json({ ok: true, message: 'Content updated', data: saved[section] });
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
