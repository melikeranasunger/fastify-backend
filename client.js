const { io } = require('socket.io-client');

const token = 'BURAYA_TOKENIN_GELECEK'; // Bu kısmı login'den aldığın gerçek token ile değiştir

const socket = io('http://localhost:3000', {
  auth: {
    token
  }
});

socket.on('connect', () => {
  console.log('Socket bağlantısı kuruldu. ID:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('Bağlantı hatası:', err.message);
});
