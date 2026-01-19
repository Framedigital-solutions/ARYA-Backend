const express = require('express');
const mongoose = require('mongoose');
const { sendSuccess } = require('../../utils/response');

const router = express.Router();

router.get('/', (req, res) => {
  const conn = mongoose.connection;
  return sendSuccess(res, {
    message: 'OK',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db: {
        readyState: conn && typeof conn.readyState === 'number' ? conn.readyState : null,
        name: conn && typeof conn.name === 'string' ? conn.name : '',
        host: conn && typeof conn.host === 'string' ? conn.host : '',
      },
    },
  });
});

module.exports = router;
