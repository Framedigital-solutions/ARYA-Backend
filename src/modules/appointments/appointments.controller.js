const {
  AppointmentSchema,
  AppointmentRequestCreateSchema,
  AppointmentRequestPatchSchema,
} = require('./appointments.validator');
const appointmentService = require('./appointments.service');
const { 
  sendError, 
  sendSuccess 
} = require('../../utils/response');

async function createAppointment(req, res, next) {
  try {
    const parsed = AppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, {
        status: 400,
        message: 'Validation error',
        error: parsed.error.flatten(),
      });
    }

    const saved = await appointmentService.create(parsed.data);

    return sendSuccess(res, { status: 201, message: 'Appointment request received', data: saved });
  } catch (err) {
    return next(err);
  }
}

async function listAppointments(req, res, next) {
  try {
    const items = await appointmentService.list();
    return sendSuccess(res, { data: items });
  } catch (err) {
    return next(err);
  }
}

async function listAppointmentRequests(req, res, next) {
  try {
    const { status } = req.query;
    const items = await appointmentService.listRequests({ status });
    return sendSuccess(res, { data: items });
  } catch (err) {
    return next(err);
  }
}

async function getAppointmentRequest(req, res, next) {
  try {
    const { id } = req.params;
    const data = await appointmentService.getById(id);
    if (!data) {
      return sendError(res, { status: 404, message: 'Appointment request not found' });
    }
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function createAppointmentRequest(req, res, next) {
  try {
    const parsed = AppointmentRequestCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }
    const saved = await appointmentService.create(parsed.data);
    return sendSuccess(res, { status: 201, message: 'Appointment request created', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function patchAppointmentRequest(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = AppointmentRequestPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }
    const saved = await appointmentService.patchById(id, parsed.data);
    return sendSuccess(res, { message: 'Appointment request updated', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function deleteAppointmentRequest(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await appointmentService.deleteById(id);
    return sendSuccess(res, { message: 'Appointment request deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
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
