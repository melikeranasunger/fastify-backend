// src/app.js

const Fastify = require('fastify');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const roomRoutes = require('./routes/room');
const eventRoutes = require('./routes/event');

function buildFastify() {
  const fastify = Fastify();

  // Sağlık testi endpointi
  fastify.get('/', async () => {
    return { status: 'ok' };
  });

  // Route kayıtları
  fastify.register(authRoutes, { prefix: '/api/auth' });
  fastify.register(bookingRoutes, { prefix: '/api/bookings' });
  fastify.register(roomRoutes, { prefix: '/api/rooms' });
  fastify.register(eventRoutes, { prefix: '/api/events' });

  return fastify;
}

module.exports = buildFastify;


