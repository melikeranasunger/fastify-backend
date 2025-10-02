const buildFastify = require('./app');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const fastify = buildFastify();
const PORT = process.env.PORT || 3000;

// HTTP server içine Fastify
const server = createServer(fastify.server);

// Socket.io entegrasyonu
const io = new Server(server, {                    
  cors: { origin: "*" },
});
fastify.decorate('io', io);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Token gerekli"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "gizliAnahtar123");
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Geçersiz token"));
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Yeni client bağlandı:', socket.user.id);
  socket.on('disconnect', () => {
    console.log('❌ Client ayrıldı:', socket.user.id);
  });
});

// Normal çalıştırma için listen
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 Fastify + Socket.io sunucusu çalışıyor: http://localhost:${3000}`);
  });
}

// Testlerde kullanılmak üzere export
module.exports = { fastify, server };

