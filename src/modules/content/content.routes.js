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
} = require('./content.controller');

const { requireAdminAuth } = require('../../middlewares/requireAdminAuth');

const router = express.Router();

router.get('/', getContent);

router.get('/home', getHomePublic);

router.get('/admin/home', requireAdminAuth, getHomeAdmin);
router.put('/admin/home', requireAdminAuth, upsertHome);
router.patch('/admin/home', requireAdminAuth, patchHome);
router.delete('/admin/home', requireAdminAuth, deleteHome);

router.get('/clinic-profile', getClinicProfilePublic);

router.get('/admin/clinic-profile', requireAdminAuth, getClinicProfileAdmin);
router.put('/admin/clinic-profile', requireAdminAuth, upsertClinicProfile);
router.patch('/admin/clinic-profile', requireAdminAuth, patchClinicProfile);
router.delete('/admin/clinic-profile', requireAdminAuth, deleteClinicProfile);

router.get('/testimonials', listTestimonialsPublic);

router.get('/admin/testimonials', requireAdminAuth, listTestimonialsAdmin);
router.post('/admin/testimonials', requireAdminAuth, createTestimonial);
router.patch('/admin/testimonials/:id', requireAdminAuth, updateTestimonial);
router.delete('/admin/testimonials/:id', requireAdminAuth, deleteTestimonial);

router.get('/programs', listProgramsPublic);

router.get('/admin/programs', requireAdminAuth, listProgramsAdmin);
router.post('/admin/programs', requireAdminAuth, createProgram);
router.patch('/admin/programs/:id', requireAdminAuth, updateProgram);
router.delete('/admin/programs/:id', requireAdminAuth, deleteProgram);

router.get('/:section', getContentSection);

router.put('/', requireAdminAuth, putContent);
router.put('/:section', requireAdminAuth, putContentSection);

module.exports = router;
