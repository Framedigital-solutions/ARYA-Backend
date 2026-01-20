const { sendError, sendSuccess } = require('../../utils/response');
const { ensureCloudinaryConfigured } = require('../../utils/cloudinary');

function uploadToCloudinary({ buffer, folder }) {
  const cld = ensureCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      {
        resource_type: 'image',
        folder,
      },
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      }
    );

    stream.end(buffer);
  });
}

async function uploadAdminImage(req, res, next) {
  try {
    const file = req.file;
    if (!file || !file.buffer) {
      return sendError(res, { status: 400, message: 'Missing file' });
    }

    const folder = String(process.env.CLOUDINARY_FOLDER || 'arya-homoeo-hall').trim() || 'arya-homoeo-hall';

    const result = await uploadToCloudinary({
      buffer: file.buffer,
      folder,
    });

    return sendSuccess(res, {
      status: 201,
      message: 'Uploaded',
      data: {
        url: result && result.secure_url ? String(result.secure_url) : '',
        publicId: result && result.public_id ? String(result.public_id) : '',
        width: result && typeof result.width === 'number' ? result.width : null,
        height: result && typeof result.height === 'number' ? result.height : null,
        format: result && result.format ? String(result.format) : null,
        bytes: result && typeof result.bytes === 'number' ? result.bytes : null,
      },
    });
  } catch (err) {
    if (err && err.statusCode) {
      return sendError(res, { status: err.statusCode, message: err.message });
    }
    return next(err);
  }
}

module.exports = {
  uploadAdminImage,
};
