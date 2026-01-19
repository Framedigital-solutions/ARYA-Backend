const { sendError } = require('../utils/response');

function notFound(req, res) {
  return sendError(res, { status: 404, message: 'Route not found' });
}

module.exports = { notFound };
