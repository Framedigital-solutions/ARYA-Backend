const express = require('express');

const { createFeedback, listFeedback, patchFeedback, deleteFeedback } = require('./feedback.controller');

const { requireAdminAuth, requireAdminPermission } = require('../../middlewares/requireAdminAuth');

const router = express.Router();

router.post('/', createFeedback);
router.get('/', listFeedback);

router.get('/admin', requireAdminAuth, requireAdminPermission('feedback.manage'), listFeedback);
router.patch('/:id', requireAdminAuth, requireAdminPermission('feedback.manage'), patchFeedback);
router.delete('/:id', requireAdminAuth, requireAdminPermission('feedback.manage'), deleteFeedback);

module.exports = router;
