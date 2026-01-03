const express = require('express');

const { createFeedback, listFeedback, patchFeedback, deleteFeedback } = require('./feedback.controller');

const { requireAdminAuth } = require('../../middlewares/requireAdminAuth');

const router = express.Router();

router.post('/', createFeedback);
router.get('/', listFeedback);

router.get('/admin', requireAdminAuth, listFeedback);
router.patch('/:id', requireAdminAuth, patchFeedback);
router.delete('/:id', requireAdminAuth, deleteFeedback);

module.exports = router;
