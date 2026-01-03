const {
  AppointmentSchema,
  AppointmentRequestCreateSchema,
  AppointmentRequestPatchSchema,
} = require('./appointments.validator');
const appointmentService = require('./appointments.service');

async function createAppointment(req, res, next) {
  try {
    const parsed = AppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        message: 'Validation error',
        errors: parsed.error.flatten(),
      });
    }

    const saved = await appointmentService.create(parsed.data);

    return res.status(201).json({
      ok: true,
      message: 'Appointment request received',
      data: saved,
    });
  } catch (err) {
    return next(err);
  }
}

async function listAppointments(req, res, next) {
  try {
    const items = await appointmentService.list();
    return res.json({ ok: true, data: items });
  } catch (err) {
    return next(err);
  }
}

async function listAppointmentRequests(req, res, next) {
  try {
    const { status } = req.query;
    const items = await appointmentService.listRequests({ status });
    return res.json({ ok: true, data: items });
  } catch (err) {
    return next(err);
  }
}

async function getAppointmentRequest(req, res, next) {
  try {
    const { id } = req.params;
    const data = await appointmentService.getById(id);
    if (!data) {
      return res.status(404).json({ ok: false, message: 'Appointment request not found' });
    }
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function createAppointmentRequest(req, res, next) {
  try {
    const parsed = AppointmentRequestCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }
    const saved = await appointmentService.create(parsed.data);
    return res.status(201).json({ ok: true, message: 'Appointment request created', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function patchAppointmentRequest(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = AppointmentRequestPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }
    const saved = await appointmentService.patchById(id, parsed.data);
    return res.json({ ok: true, message: 'Appointment request updated', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function deleteAppointmentRequest(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await appointmentService.deleteById(id);
    return res.json({ ok: true, message: 'Appointment request deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

module.exports = {
  createAppointment,
  listAppointments,
  listAppointmentRequests,
  getAppointmentRequest,
  createAppointmentRequest,
  patchAppointmentRequest,
  deleteAppointmentRequest,
};
