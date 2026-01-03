const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', (req, res) => {
  const conn = mongoose.connection;
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    db: {
      readyState: conn && typeof conn.readyState === 'number' ? conn.readyState : null,
      name: conn && typeof conn.name === 'string' ? conn.name : '',
      host: conn && typeof conn.host === 'string' ? conn.host : '',
    },
  });
});

module.exports = router;
