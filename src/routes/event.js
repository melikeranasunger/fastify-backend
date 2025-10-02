// src/routes/event.js
const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middleware/verifyToken');

const prisma = new PrismaClient();

async function eventRoutes(fastify, options) {
  // Create Event
  fastify.post('/api/events', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const { name, date, location, roomId } = request.body;

      if (!name || !date || !location || !roomId) {
        return reply.code(400).send({ hata: 'name, date, location ve roomId zorunludur.' });
      }

      const event = await prisma.event.create({
        data: { name, date: new Date(date), location, roomId },
      });

      // 🔔 Yeni etkinlik bildirimi
      fastify.io.emit('event_created', event);

      return reply.code(201).send(event);
    } catch (err) {
      console.error(err);
      return reply.code(500).send({ hata: 'Etkinlik oluşturulurken hata oluştu.' });
    }
  });

  // Get all events
  fastify.get('/api/events', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const events = await prisma.event.findMany();
      return reply.send(events);
    } catch (err) {
      console.error(err);
      return reply.code(500).send({ hata: 'Etkinlikler getirilirken hata oluştu.' });
    }
  });

  // Get single event
  fastify.get('/api/events/:id', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const { id } = request.params;
      const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });

      if (!event) return reply.code(404).send({ hata: 'Etkinlik bulunamadı.' });

      return reply.send(event);
    } catch (err) {
      console.error(err);
      return reply.code(500).send({ hata: 'Etkinlik getirilirken hata oluştu.' });
    }
  });

  // Update event
  fastify.put('/api/events/:id', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { name, date, location, roomId } = request.body;

      const updated = await prisma.event.update({
        where: { id: parseInt(id) },
        data: { name, date: new Date(date), location, roomId },
      });

      // 🔔 Güncelleme bildirimi
      fastify.io.emit('event_updated', updated);

      return reply.send(updated);
    } catch (err) {
      console.error(err);
      return reply.code(500).send({ hata: 'Etkinlik güncellenirken hata oluştu.' });
    }
  });

  // Delete event
  fastify.delete('/api/events/:id', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const { id } = request.params;
      await prisma.event.delete({ where: { id: parseInt(id) } });

      // 🔔 Silme bildirimi
      fastify.io.emit('event_deleted', { id });

      return reply.code(204).send();
    } catch (err) {
      console.error(err);
      return reply.code(500).send({ hata: 'Etkinlik silinirken hata oluştu.' });
    }
  });
}

module.exports = eventRoutes;
