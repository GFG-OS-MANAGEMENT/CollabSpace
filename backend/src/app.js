const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins.includes('*') ? '*' : env.corsOrigins,
    })
  );
  app.use(express.json({ limit: '100kb' }));

  if (!env.isTest) {
    app.use(
      '/api',
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: {
          error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' },
        },
      })
    );
  }

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'collabspace-api', uptime: Math.round(process.uptime()) });
  });

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
