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

const { requireAdminAuth, requireAdminPermission } = require('../../middlewares/requireAdminAuth');

const router = express.Router();

router.get('/', getContent);

router.get('/home', getHomePublic);

router.get('/admin/home', requireAdminAuth, requireAdminPermission('content.manage'), getHomeAdmin);
router.put('/admin/home', requireAdminAuth, requireAdminPermission('content.manage'), upsertHome);
router.patch('/admin/home', requireAdminAuth, requireAdminPermission('content.manage'), patchHome);
router.delete('/admin/home', requireAdminAuth, requireAdminPermission('content.manage'), deleteHome);

router.get('/clinic-profile', getClinicProfilePublic);

router.get('/admin/clinic-profile', requireAdminAuth, requireAdminPermission('content.manage'), getClinicProfileAdmin);
router.put('/admin/clinic-profile', requireAdminAuth, requireAdminPermission('content.manage'), upsertClinicProfile);
router.patch('/admin/clinic-profile', requireAdminAuth, requireAdminPermission('content.manage'), patchClinicProfile);
router.delete('/admin/clinic-profile', requireAdminAuth, requireAdminPermission('content.manage'), deleteClinicProfile);

router.get('/testimonials', listTestimonialsPublic);

router.get('/admin/testimonials', requireAdminAuth, requireAdminPermission('content.manage'), listTestimonialsAdmin);
router.post('/admin/testimonials', requireAdminAuth, requireAdminPermission('content.manage'), createTestimonial);
router.patch('/admin/testimonials/:id', requireAdminAuth, requireAdminPermission('content.manage'), updateTestimonial);
router.delete('/admin/testimonials/:id', requireAdminAuth, requireAdminPermission('content.manage'), deleteTestimonial);

router.get('/programs', listProgramsPublic);

router.get('/admin/programs', requireAdminAuth, requireAdminPermission('content.manage'), listProgramsAdmin);
router.post('/admin/programs', requireAdminAuth, requireAdminPermission('content.manage'), createProgram);
router.patch('/admin/programs/:id', requireAdminAuth, requireAdminPermission('content.manage'), updateProgram);
router.delete('/admin/programs/:id', requireAdminAuth, requireAdminPermission('content.manage'), deleteProgram);

router.get('/:section', getContentSection);

router.put('/', requireAdminAuth, requireAdminPermission('content.manage'), putContent);
router.put('/:section', requireAdminAuth, requireAdminPermission('content.manage'), putContentSection);

module.exports = router;
