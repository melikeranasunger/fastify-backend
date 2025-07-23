const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middlewares/verifyToken');  // JWT doğrulama
const { isBookingOverlapping } = require('../utils/bookingUtils');  // Çakışma kontrol fonksiyonu

const prisma = new PrismaClient();

async function bookingRoutes(fastify, options) {
  // Rezervasyon oluşturma (POST)
  fastify.post('/bookings', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const { roomId, startTime, endTime } = request.body;
      const userId = request.user.id;

      console.log("JWT den gelen user id:", userId);

      // Kullanıcı doğrulama kontrolü
      if (!userId) {
        return reply.code(401).send({ hata: 'Kullanıcı doğrulanamadı. Token geçersiz.' });
      }

      // Zorunlu alan kontrolü
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
        data: {
          roomId,
          userId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
        },
      });

      return reply.code(201).send({
        mesaj: 'Rezervasyon oluşturuldu',
        rezervasyon: newBooking,
      });
    } catch (error) {
      console.error('Rezervasyon Hatası:', error);
      console.error('Hata detayları:', error.stack);
      return reply.code(500).send({
        hata: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin',
      });
    }
  });
  

  // Tüm rezervasyonları getir (GET)
  fastify.get('/bookings', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const bookings = await prisma.booking.findMany({
        include: { room: true, user: true },
      });
      return bookings;
    } catch (error) {
      return reply.code(500).send({
        hata: 'Rezervasyonlar getirilemedi.',
      });
    }
  });

  // Belirli rezervasyonu getir (GET)
  fastify.get('/bookings/:id', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const id = parseInt(request.params.id);

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: { room: true, user: true },
      });

      if (!booking) {
        return reply.code(404).send({ hata: 'Rezervasyon bulunamadı.' });
      }

      return booking;
    } catch (error) {
      console.error('Rezervasyon Getirme Hatası:', error);
      console.error('Hata detayları:', error.stack);
      return reply.code(500).send({
        hata: 'Rezervasyon getirilemedi.',
      });
    }
  });

  // Rezervasyonu güncelle (PUT)
  fastify.put('/bookings/:id', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const id = parseInt(request.params.id);
      const { startTime, endTime } = request.body;

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          startTime: new Date(startTime),
          endTime: new Date(endTime),
        },
      });

      return {
        mesaj: 'Rezervasyon güncellendi.',
        rezervasyon: updatedBooking,
      };
    } catch (error) {
      console.error('Rezervasyon Güncelleme Hatası:', error);
      console.error('Hata detayları:', error.stack);
      return reply.code(400).send({
        hata: 'Güncelleme başarısız.',
      });
    }
  });

  // Rezervasyon sil (DELETE)
  fastify.delete('/bookings/:id', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const id = parseInt(request.params.id);
      await prisma.booking.delete({ where: { id } });

      return { mesaj: 'Rezervasyon silindi.' };
    } catch (error) {
      console.error('Rezervasyon Silme Hatası:', error);
      console.error('Hata detayları:', error.stack);
      return reply.code(400).send({
        hata: 'Silme işlemi başarısız.',
      });
    }
  });
}

module.exports = bookingRoutes;
