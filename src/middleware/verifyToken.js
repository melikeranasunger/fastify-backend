// src/middleware/verifyToken.js
const jwt = require('jsonwebtoken');

function verifyToken(request, reply, done) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ hata: 'Token bulunamadı veya format hatalı.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'gizliAnahtar123';
    const decoded = jwt.verify(token, secret);

    request.user = decoded; // Token'daki bilgiyi request.user içine koyduk
    done(); // Middleware tamamlandı
  } catch (err) {
    return reply.code(401).send({ hata: 'Geçersiz veya süresi dolmuş token.' });
  }
}

module.exports = verifyToken;
