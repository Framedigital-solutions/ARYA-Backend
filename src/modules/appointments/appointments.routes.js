const express = require('express');

const {
  createAppointment,
  listAppointments,
  listAppointmentRequests,
  getAppointmentRequest,
  createAppointmentRequest,
  patchAppointmentRequest,
  deleteAppointmentRequest,
} = require('./appointments.controller');

const { requireAdminAuth, requireAdminPermission } = require('../../middlewares/requireAdminAuth');

const router = express.Router();

router.post('/', createAppointment);
router.get('/', listAppointments);

router.get('/requests', requireAdminAuth, requireAdminPermission('appointments.manage'), listAppointmentRequests);
router.post('/requests', requireAdminAuth, requireAdminPermission('appointments.manage'), createAppointmentRequest);
router.get('/requests/:id', requireAdminAuth, requireAdminPermission('appointments.manage'), getAppointmentRequest);
router.patch('/requests/:id', requireAdminAuth, requireAdminPermission('appointments.manage'), patchAppointmentRequest);
router.delete('/requests/:id', requireAdminAuth, requireAdminPermission('appointments.manage'), deleteAppointmentRequest);

module.exports = router;
