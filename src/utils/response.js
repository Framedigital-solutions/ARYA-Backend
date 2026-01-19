function sendSuccess(res, { status = 200, message = 'OK', data = null } = {}) {
  return res.status(status).json({
    success: true,
    message,
    data,
    error: null,
  });
}

function sendError(res, { status = 500, message = 'Something went wrong', error = null } = {}) {
  return res.status(status).json({
    success: false,
    message,
    data: null,
    error,
  });
}

module.exports = { sendSuccess, sendError };
