require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');
const { sendSuccess } = require('./utils/response');

const app = express();

app.set('etag', false);
app.set('trust proxy', 1);

const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (isDev) return cb(null, true);
      if (!corsOrigins.length) return cb(null, true);
      if (corsOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const isRateLimitDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: isRateLimitDev ? 5000 : 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  })
);

app.get('/', (req, res) => {
  return sendSuccess(res, { message: 'Server is running', data: { running: true } });
});

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
  next();
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
