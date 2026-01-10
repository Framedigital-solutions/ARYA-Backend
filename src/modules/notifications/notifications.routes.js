const express = require('express');

const { getAdminNotifications } = require('./notifications.controller');
const { requireAdminAuth, requireAdminPermission } = require('../../middlewares/requireAdminAuth');

const router = express.Router();

router.get('/admin', requireAdminAuth, requireAdminPermission('notifications.read'), getAdminNotifications);

module.exports = router;
