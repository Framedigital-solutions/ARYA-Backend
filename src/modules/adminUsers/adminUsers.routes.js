const express = require('express');

const {
  listAdminUsers,
  getAdminUser,
  createAdminUser,
  patchAdminUser,
  deleteAdminUser,
} = require('./adminUsers.controller');

const { requireAdminAuth } = require('../../middlewares/requireAdminAuth');

const router = express.Router();

router.get('/', requireAdminAuth, listAdminUsers);
router.post('/', requireAdminAuth, createAdminUser);
router.get('/:id', requireAdminAuth, getAdminUser);
router.patch('/:id', requireAdminAuth, patchAdminUser);
router.delete('/:id', requireAdminAuth, deleteAdminUser);

module.exports = router;
