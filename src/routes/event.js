const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

async function eventRoutes(fastify, options) {
  fastify.get('/', getAllEvents);
  fastify.get('/:id', getEventById);
  fastify.post('/', createEvent);
  fastify.put('/:id', updateEvent);
  fastify.delete('/:id', deleteEvent);
}

module.exports = eventRoutes;

