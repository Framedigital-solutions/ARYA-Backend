const express = require('express');

const rateLimit = require('express-rate-limit');

const { login, refresh, logout, me } = require('./auth.controller');

const { requireAdminAuth } = require('../../middlewares/requireAdminAuth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAdminAuth, me);

module.exports = router;
