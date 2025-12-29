const express = require('express');

const {
  listAdminUsers,
  getAdminUser,
  createAdminUser,
  patchAdminUser,
  deleteAdminUser,
} = require('./adminUsers.controller');

const router = express.Router();

function requireAdminKey(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return res.status(403).json({ ok: false, message: 'Admin API key not configured' });
  }

  const provided = req.get('x-admin-key');
  if (!provided || provided !== expected) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }

  return next();
}

router.get('/', requireAdminKey, listAdminUsers);
router.post('/', requireAdminKey, createAdminUser);
router.get('/:id', requireAdminKey, getAdminUser);
router.patch('/:id', requireAdminKey, patchAdminUser);
router.delete('/:id', requireAdminKey, deleteAdminUser);

module.exports = router;
