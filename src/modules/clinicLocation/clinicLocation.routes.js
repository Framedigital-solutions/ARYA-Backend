const express = require('express');

const {
  getActive,
  listAdmin,
  parseLink,
  createAdmin,
  patchAdmin,
  setActiveAdmin,
  disableAdmin,
} = require('./clinicLocation.controller');

const { requireAdminAuth, requireAdminPermission } = require('../../middlewares/requireAdminAuth');

const router = express.Router();

router.get('/active', getActive);

router.get('/admin', requireAdminAuth, requireAdminPermission('content.manage'), listAdmin);
router.post('/admin/parse', requireAdminAuth, requireAdminPermission('content.manage'), parseLink);
router.post('/admin', requireAdminAuth, requireAdminPermission('content.manage'), createAdmin);
router.patch('/admin/:id', requireAdminAuth, requireAdminPermission('content.manage'), patchAdmin);
router.patch('/admin/:id/activate', requireAdminAuth, requireAdminPermission('content.manage'), setActiveAdmin);
router.patch('/admin/:id/disable', requireAdminAuth, requireAdminPermission('content.manage'), disableAdmin);

module.exports = router;
