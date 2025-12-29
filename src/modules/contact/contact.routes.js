const express = require('express');

const {
  createContact,
  listInquiries,
  getInquiry,
  createInquiry,
  patchInquiry,
  deleteInquiry,
} = require('./contact.controller');

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

router.post('/', createContact);

router.get('/inquiries', requireAdminKey, listInquiries);
router.post('/inquiries', requireAdminKey, createInquiry);
router.get('/inquiries/:id', requireAdminKey, getInquiry);
router.patch('/inquiries/:id', requireAdminKey, patchInquiry);
router.delete('/inquiries/:id', requireAdminKey, deleteInquiry);

module.exports = router;
