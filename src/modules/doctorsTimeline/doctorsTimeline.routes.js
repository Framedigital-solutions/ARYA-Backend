const express = require('express');

const { requireAdminAuth, requireAdminPermission } = require('../../middlewares/requireAdminAuth');

const {
  getPublic,
  getAdmin,
  upsertAdmin,
  patchAdmin,
  addItem,
  patchItem,
  deleteItem,
  reorder,
} = require('./doctorsTimeline.controller');

const router = express.Router();

router.get('/', getPublic);

router.get('/admin', requireAdminAuth, requireAdminPermission('content.manage'), getAdmin);
router.put('/admin', requireAdminAuth, requireAdminPermission('content.manage'), upsertAdmin);
router.patch('/admin', requireAdminAuth, requireAdminPermission('content.manage'), patchAdmin);

router.post('/admin/items', requireAdminAuth, requireAdminPermission('content.manage'), addItem);
router.patch('/admin/items/:itemId', requireAdminAuth, requireAdminPermission('content.manage'), patchItem);
router.delete('/admin/items/:itemId', requireAdminAuth, requireAdminPermission('content.manage'), deleteItem);

router.patch('/admin/reorder', requireAdminAuth, requireAdminPermission('content.manage'), reorder);

module.exports = router;
