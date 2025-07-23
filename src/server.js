const Fastify = require('fastify');
const { createServer } = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const bookingRoutes = require('./routes/booking');
const eventRoutes = require('./routes/event');

const fastify = Fastify({ logger: true });
const httpServer = createServer(fastify.server); // 👈 Fastify'nin iç sunucusunu HTTP ile sar

// Socket.io başlatılıyor
const io = socketIo(httpServer, {
  cors: {
    origin: '*', // Geliştirme aşamasında her yerden erişime açık
  }
});

// 👇 Handshake doğrulama (kullanıcı bağlantı kurarken token kontrolü)
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Token gerekli'));
  }

  try {
    const decoded = jwt.verify(token, 'gizliAnahtar');
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Geçersiz token'));
  }
});

// 👇 Socket bağlantısı kurulduğunda
io.on('connection', (socket) => {
  console.log('Yeni kullanıcı bağlandı:', socket.user.email);

  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.user.email);
  });
});

// Fastify route'larını kaydet
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(roomRoutes, { prefix: '/api/rooms' });
fastify.register(bookingRoutes, { prefix: '/api/bookings' });
fastify.register(eventRoutes, { prefix: '/api/events' });

// Fastify başlat
const start = async () => {
  try {
    await fastify.ready(); // fastify.server hazır olmadan httpServer başlamaz
    httpServer.listen(3001, () => {
      console.log('Sunucu http://localhost:3000 adresinde çalışıyor');
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

