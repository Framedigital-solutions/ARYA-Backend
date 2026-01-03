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

const { requireAdminAuth } = require('../../middlewares/requireAdminAuth');

const router = express.Router();

router.post('/', createAppointment);
router.get('/', listAppointments);

router.get('/requests', requireAdminAuth, listAppointmentRequests);
router.post('/requests', requireAdminAuth, createAppointmentRequest);
router.get('/requests/:id', requireAdminAuth, getAppointmentRequest);
router.patch('/requests/:id', requireAdminAuth, patchAppointmentRequest);
router.delete('/requests/:id', requireAdminAuth, deleteAppointmentRequest);

module.exports = router;
