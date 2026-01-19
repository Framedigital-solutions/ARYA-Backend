const notificationsService = require('./notifications.service');
const { sendSuccess } = require('../../utils/response');

async function getAdminNotifications(req, res, next) {
  try {
    const { limit } = req.query;
    const limitPerType = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(20, Number(limit))) : 5;
    const data = await notificationsService.getAdminNotifications({ limitPerType });
    return sendSuccess(res, { data });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getAdminNotifications };
