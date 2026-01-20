const express = require('express');
const multer = require('multer');

const { uploadAdminImage } = require('./uploads.controller');
const { requireAdminAuth, requireAdminPermission } = require('../../middlewares/requireAdminAuth');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const mt = String((file && file.mimetype) || '').toLowerCase();
    const ok = mt === 'image/png' || mt === 'image/jpeg' || mt === 'image/jpg' || mt === 'image/webp';
    if (!ok) {
      const err = new Error('Only png/jpg/jpeg/webp images are allowed');
      err.statusCode = 400;
      return cb(err);
    }
    return cb(null, true);
  },
});

function uploadSingleImage(req, res, next) {
  return upload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err && err.code === 'LIMIT_FILE_SIZE') {
      err.statusCode = 400;
      err.message = 'File too large (max 5MB)';
    } else if (!err.statusCode) {
      err.statusCode = 400;
    }
    return next(err);
  });
}

router.post(
  '/admin/image',
  requireAdminAuth,
  requireAdminPermission('content.manage'),
  uploadSingleImage,
  uploadAdminImage
);

module.exports = router;
