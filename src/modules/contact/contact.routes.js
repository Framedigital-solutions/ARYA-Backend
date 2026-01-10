const express = require('express');

const {
  createContact,
  listInquiries,
  getInquiry,
  createInquiry,
  patchInquiry,
  deleteInquiry,
} = require('./contact.controller');

const { requireAdminAuth, requireAdminPermission } = require('../../middlewares/requireAdminAuth');

const router = express.Router();

router.post('/', createContact);

router.get('/inquiries', requireAdminAuth, requireAdminPermission('inquiries.manage'), listInquiries);
router.post('/inquiries', requireAdminAuth, requireAdminPermission('inquiries.manage'), createInquiry);
router.get('/inquiries/:id', requireAdminAuth, requireAdminPermission('inquiries.manage'), getInquiry);
router.patch('/inquiries/:id', requireAdminAuth, requireAdminPermission('inquiries.manage'), patchInquiry);
router.delete('/inquiries/:id', requireAdminAuth, requireAdminPermission('inquiries.manage'), deleteInquiry);

module.exports = router;
