const { ContactSchema } = require('./contact.validator');
const { ContactInquiryCreateSchema, ContactInquiryPatchSchema } = require('./inquiries.validator');
const contactService = require('./contact.service');

async function createContact(req, res, next) {
  try {
    const parsed = ContactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        message: 'Validation error',
        errors: parsed.error.flatten(),
      });
    }

    const saved = await contactService.create({
      ...parsed.data,
      source: 'ask_the_doctor',
    });

    return res.status(201).json({
      ok: true,
      message: 'Message received',
      data: saved,
    });
  } catch (err) {
    return next(err);
  }
}

async function listInquiries(req, res, next) {
  try {
    const { status, assigned_to_user_id } = req.query;
    const data = await contactService.list({ status, assigned_to_user_id });
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getInquiry(req, res, next) {
  try {
    const { id } = req.params;
    const data = await contactService.getById(id);
    if (!data) {
      return res.status(404).json({ ok: false, message: 'Inquiry not found' });
    }
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function createInquiry(req, res, next) {
  try {
    const parsed = ContactInquiryCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const saved = await contactService.create(parsed.data);
    return res.status(201).json({ ok: true, message: 'Inquiry created', data: saved });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function patchInquiry(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = ContactInquiryPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: 'Validation error', errors: parsed.error.flatten() });
    }

    const updated = await contactService.patchById(id, parsed.data);
    return res.json({ ok: true, message: 'Inquiry updated', data: updated });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    return next(err);
  }
}

async function deleteInquiry(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await contactService.deleteById(id);
    return res.json({ ok: true, message: 'Inquiry deleted', data: removed });
  } catch (err) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).json({ ok: false, message: err.message });
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
