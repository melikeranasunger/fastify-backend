module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ Yeni bir kullanıcı bağlandı:', socket.id);

    const token = socket.handshake.auth.token;
    console.log('Gelen token:', token);

    socket.on('disconnect', () => {
      console.log('❌ Kullanıcı ayrıldı:', socket.id);
    });
  });
};
