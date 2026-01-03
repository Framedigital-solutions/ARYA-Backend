const express = require('express');

const {
  createContact,
  listInquiries,
  getInquiry,
  createInquiry,
  patchInquiry,
  deleteInquiry,
} = require('./contact.controller');

const { requireAdminAuth } = require('../../middlewares/requireAdminAuth');

const router = express.Router();

router.post('/', createContact);

router.get('/inquiries', requireAdminAuth, listInquiries);
router.post('/inquiries', requireAdminAuth, createInquiry);
router.get('/inquiries/:id', requireAdminAuth, getInquiry);
router.patch('/inquiries/:id', requireAdminAuth, patchInquiry);
router.delete('/inquiries/:id', requireAdminAuth, deleteInquiry);

module.exports = router;
