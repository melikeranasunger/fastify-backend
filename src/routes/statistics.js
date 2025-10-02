const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middleware/verifyToken');

const prisma = new PrismaClient();

async function statisticsRoutes(fastify) {

  // 🔹 Toplam rezervasyon sayısı
  fastify.get('/total-bookings', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const total = await prisma.booking.count();
      return { totalBookings: total };
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ hata: 'Toplam rezervasyon alınamadı.' });
    }
  });

  // 🔹 Kullanıcı başına rezervasyon sayısı
  fastify.get('/bookings-per-user', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const result = await prisma.booking.groupBy({
        by: ['userId'],
        _count: { id: true },
      });
      return result.map(r => ({ userId: r.userId, bookings: r._count.id }));
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ hata: 'Kullanıcı rezervasyonları alınamadı.' });
    }
  });

  // 🔹 Tarihe göre rezervasyon sayısı (günlük)
  fastify.get('/daily-bookings', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const result = await prisma.$queryRaw`
        SELECT DATE("startTime") as date, COUNT(*) as bookings
        FROM "Booking"
        GROUP BY DATE("startTime")
        ORDER BY DATE("startTime")
      `;
      return result;
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ hata: 'Günlük rezervasyonlar alınamadı.' });
    }
  });

}

module.exports = statisticsRoutes;
