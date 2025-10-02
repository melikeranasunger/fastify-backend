const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middleware/verifyToken');
const { isBookingOverlapping } = require('../utils/bookingUtils');

const prisma = new PrismaClient();

async function bookingRoutes(fastify) {

  // 🔹 Rezervasyon oluşturma (POST)
  fastify.post('/', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const { roomId, startTime, endTime } = request.body;

      if (!roomId || !startTime || !endTime) {
        return reply.code(400).send({ hata: 'roomId, startTime ve endTime zorunludur.' });
      }

      // Çakışma kontrolü
      const isOverlapping = await isBookingOverlapping(prisma, roomId, startTime, endTime);
      if (isOverlapping) {
        return reply.code(409).send({ hata: 'Bu saatlerde bir rezervasyon mevcut.' });
      }

      // Rezervasyon oluştur
      const newBooking = await prisma.booking.create({
        data: { roomId, userId, startTime: new Date(startTime), endTime: new Date(endTime) },
      });

      // Real-time bildirim gönder
      fastify.io.emit('booking_created', newBooking);

      return reply.code(201).send({ mesaj: 'Rezervasyon oluşturuldu', rezervasyon: newBooking });
    } catch (error) {
      console.error('Rezervasyon Hatası:', error);
      return reply.code(500).send({ hata: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' });
    }
  });

  // 🔹 Tüm rezervasyonları listele (GET)
  fastify.get('/', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const bookings = await prisma.booking.findMany({ include: { room: true, user: true } });
      return bookings;
    } catch (error) {
      return reply.code(500).send({ hata: 'Rezervasyonlar getirilemedi.' });
    }
  });

  // 🔹 Belirli rezervasyonu getir (GET /:id)
  fastify.get('/:id', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const id = parseInt(request.params.id);
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: { room: true, user: true },
      });

      if (!booking) return reply.code(404).send({ hata: 'Rezervasyon bulunamadı.' });

      return booking;
    } catch (error) {
      console.error('Rezervasyon Getirme Hatası:', error);
      return reply.code(500).send({ hata: 'Rezervasyon getirilemedi.' });
    }
  });

  // 🔹 Rezervasyonu güncelle (PUT /:id)
  fastify.put('/:id', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const id = parseInt(request.params.id);
      const { startTime, endTime } = request.body;

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { startTime: new Date(startTime), endTime: new Date(endTime) },
      });

      // 🔔 Real-time güncelleme bildirimi
      fastify.io.emit('booking_updated', updatedBooking);

      return { mesaj: 'Rezervasyon güncellendi.', rezervasyon: updatedBooking };
    } catch (error) {
      console.error('Rezervasyon Güncelleme Hatası:', error);
      return reply.code(400).send({ hata: 'Güncelleme başarısız.' });
    }
  });

  // 🔹 Rezervasyonu sil (DELETE /:id)
  fastify.delete('/:id', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const id = parseInt(request.params.id);
      await prisma.booking.delete({ where: { id } });

      // 🔔 Real-time silme bildirimi
      fastify.io.emit('booking_deleted', { id });

      return { mesaj: 'Rezervasyon silindi.' };
    } catch (error) {
      console.error('Rezervasyon Silme Hatası:', error);
      return reply.code(400).send({ hata: 'Silme işlemi başarısız.' });
    }
  });
}

module.exports = bookingRoutes;


