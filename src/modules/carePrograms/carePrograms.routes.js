const express = require('express');

const { requireAdminAuth, requireAdminPermission } = require('../../middlewares/requireAdminAuth');

const {
  listPublic,
  listAdmin,
  createAdmin,
  patchAdmin,
  deleteAdmin,
} = require('./carePrograms.controller');

const router = express.Router();

router.get('/', listPublic);

router.get('/admin', requireAdminAuth, requireAdminPermission('content.manage'), listAdmin);
router.post('/admin', requireAdminAuth, requireAdminPermission('content.manage'), createAdmin);
router.patch('/admin/:id', requireAdminAuth, requireAdminPermission('content.manage'), patchAdmin);
router.delete('/admin/:id', requireAdminAuth, requireAdminPermission('content.manage'), deleteAdmin);

module.exports = router;
