const express = require('express');

const {
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
  listTestimonialsPublic,
  listTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('./content.controller');

const router = express.Router();

function requireAdminKey(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return res.status(403).json({ ok: false, message: 'Admin API key not configured' });
  }

  const provided = req.get('x-admin-key');
  if (!provided || provided !== expected) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }

  return next();
}

router.get('/', getContent);

router.get('/clinic-profile', getClinicProfilePublic);

router.get('/admin/clinic-profile', requireAdminKey, getClinicProfileAdmin);
router.put('/admin/clinic-profile', requireAdminKey, upsertClinicProfile);
router.patch('/admin/clinic-profile', requireAdminKey, patchClinicProfile);
router.delete('/admin/clinic-profile', requireAdminKey, deleteClinicProfile);

router.get('/testimonials', listTestimonialsPublic);

router.get('/admin/testimonials', requireAdminKey, listTestimonialsAdmin);
router.post('/admin/testimonials', requireAdminKey, createTestimonial);
router.patch('/admin/testimonials/:id', requireAdminKey, updateTestimonial);
router.delete('/admin/testimonials/:id', requireAdminKey, deleteTestimonial);

router.get('/programs', listProgramsPublic);

router.get('/admin/programs', requireAdminKey, listProgramsAdmin);
router.post('/admin/programs', requireAdminKey, createProgram);
router.patch('/admin/programs/:id', requireAdminKey, updateProgram);
router.delete('/admin/programs/:id', requireAdminKey, deleteProgram);

router.get('/:section', getContentSection);

router.put('/', requireAdminKey, putContent);
router.put('/:section', requireAdminKey, putContentSection);

module.exports = router;
