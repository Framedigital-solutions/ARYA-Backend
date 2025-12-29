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

router.post('/', createAppointment);
router.get('/', listAppointments);

router.get('/requests', requireAdminKey, listAppointmentRequests);
router.post('/requests', requireAdminKey, createAppointmentRequest);
router.get('/requests/:id', requireAdminKey, getAppointmentRequest);
router.patch('/requests/:id', requireAdminKey, patchAppointmentRequest);
router.delete('/requests/:id', requireAdminKey, deleteAppointmentRequest);

module.exports = router;
