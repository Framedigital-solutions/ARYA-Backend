const express = require('express');

const { createFeedback, listFeedback } = require('./feedback.controller');

const router = express.Router();

router.post('/', createFeedback);
router.get('/', listFeedback);

module.exports = router;
