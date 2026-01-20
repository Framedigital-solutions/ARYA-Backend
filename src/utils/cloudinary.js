const { v2: cloudinary } = require('cloudinary');

let configured = false;

function ensureCloudinaryConfigured() {
  if (configured) return cloudinary;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const err = new Error('Cloudinary not configured (missing CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET)');
    err.statusCode = 500;
    throw err;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  configured = true;
  return cloudinary;
}

module.exports = {
  cloudinary,
  ensureCloudinaryConfigured,
};
