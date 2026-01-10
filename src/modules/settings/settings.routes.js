const express = require('express');

const {
  listSettings,
  getSetting,
  createSetting,
  patchSetting,
  deleteSetting,
} = require('./settings.controller');

const { requireAdminAuth, requireAdminPermission } = require('../../middlewares/requireAdminAuth');

const router = express.Router();

router.get('/', requireAdminAuth, requireAdminPermission('settings.manage'), listSettings);
router.post('/', requireAdminAuth, requireAdminPermission('settings.manage'), createSetting);
router.get('/:id', requireAdminAuth, requireAdminPermission('settings.manage'), getSetting);
router.patch('/:id', requireAdminAuth, requireAdminPermission('settings.manage'), patchSetting);
router.delete('/:id', requireAdminAuth, requireAdminPermission('settings.manage'), deleteSetting);

module.exports = router;
