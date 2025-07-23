const app = require('./server');
const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

require('./socket')(io); // src/socket/index.js dosyasını çağırır

const PORT = process.env.PORT || 3002;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
