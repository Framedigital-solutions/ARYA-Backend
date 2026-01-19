const { sendError } = require('../utils/response');

function errorHandler(err, req, res, next) {
  const status = Number(err.statusCode || err.status || 500);

  const isProd = process.env.NODE_ENV === 'production';

  const message =
    isProd && status >= 500
      ? 'Internal server error'
      : err.message || 'Something went wrong';

  if (!isProd) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return sendError(res, {
    status,
    message,
    error: isProd ? null : { stack: err && err.stack ? err.stack : '' },
  });
}

module.exports = { errorHandler };
