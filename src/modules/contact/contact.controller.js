const { ContactSchema } = require('./contact.validator');
const { ContactInquiryCreateSchema, ContactInquiryPatchSchema } = require('./inquiries.validator');
const contactService = require('./contact.service');
const { sendError, sendSuccess } = require('../../utils/response');

async function createContact(req, res, next) {
  try {
    const parsed = ContactSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const saved = await contactService.create({
      ...parsed.data,
      source: 'ask_the_doctor',
    });

    return sendSuccess(res, { status: 201, message: 'Message received', data: saved });
  } catch (err) {
    return next(err);
  }
}

async function listInquiries(req, res, next) {
  try {
    const { status, assigned_to_user_id } = req.query;
    const data = await contactService.list({ status, assigned_to_user_id });
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function getInquiry(req, res, next) {
  try {
    const { id } = req.params;
    const data = await contactService.getById(id);
    if (!data) {
      return sendError(res, { status: 404, message: 'Inquiry not found' });
    }
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

async function createInquiry(req, res, next) {
  try {
    const parsed = ContactInquiryCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const saved = await contactService.create(parsed.data);
    return sendSuccess(res, { status: 201, message: 'Inquiry created', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function patchInquiry(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = ContactInquiryPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, { status: 400, message: 'Validation error', error: parsed.error.flatten() });
    }

    const updated = await contactService.patchById(id, parsed.data);
    return sendSuccess(res, { message: 'Inquiry updated', data: updated });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

async function deleteInquiry(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await contactService.deleteById(id);
    return sendSuccess(res, { message: 'Inquiry deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

module.exports = {
  createContact,
  listInquiries,
  getInquiry,
  createInquiry,
  patchInquiry,
  deleteInquiry,
};
