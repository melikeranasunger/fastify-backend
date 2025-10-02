// src/app.js
const fastify = require('fastify');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const eventRoutes = require('./routes/event');
const statisticsRoutes = require('./routes/statistics');
const cors = require('@fastify/cors');
const helmet = require('@fastify/helmet');
const jwt = require('@fastify/jwt');

function buildFastify() {
  const app = fastify({ logger: true });

  // Güvenlik ve CORS
  app.register(cors, { origin: '*' });
  app.register(helmet);

  // JWT Plugin
  const jwt = require('@fastify/jwt');
  app.register(jwt, {
    secret: 'supersecret'  // Production’da .env üzerinden okunmalı
  });

  // JWT Middleware: authenticate dekoratörü
  app.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // JSON Parsing 
  app.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
    try {
      const json = JSON.parse(body);
      done(null, json);
    } catch (err) {
      done(err, undefined);
    }
  });

  // Routes
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(bookingRoutes, { prefix: '/api/bookings' });
  app.register(eventRoutes, { prefix: '/api/events' });
  app.register(statisticsRoutes, { prefix: '/api/statistics' });

  return app;
}

module.exports = buildFastify;

