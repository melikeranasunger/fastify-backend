// src/routes/auth.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function authRoutes(fastify, options) {
  // Kullanıcı Girişi(Login)
  fastify.post('/auth/signup', async (request, reply) => {
    try {
      const { name, email, password } = request.body;
      if (!name || !email || !password) {
        return reply.code(400).send({ hata: 'Name, email ve password zorunludur.' });
      }
  //Aynı email var mı kontrolü
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return reply.code(400).send({ hata: 'Bu e-posta zaten kayıtlı.' });
      }
  // Şifreyi hashleme
      const hashedPassword = await bcrypt.hash(password, 10);
  //Kullanıcıyı oluşturma 
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });

      return reply.code(201).send({ mesaj: 'Kullanıcı oluşturuldu.', user: { id: user.id, name, email } });
    } catch (err) {
      return reply.code(500).send({ hata: 'Sunucu hatası.' });
    }
  });

  // Kullanıcı girişi (Login)
  fastify.post('/auth/login', async (request, reply) => {
    try {
      const { email, password } = request.body;
      if (!email || !password) {
        return reply.code(400).send({ hata: 'Email ve password gerekli.' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return reply.code(400).send({ hata: 'Geçersiz email veya geçersiz şifre tekrar deneyin.' });
  // Şifreyi kontrol etme 
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return reply.code(400).send({ hata: 'Yanlış şifre.' });
  //JWTtoken oluşturma 
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'gizliAnahtar123', { expiresIn: '1h' });

      return reply.send({mesaj:'Giriş başarılı,token' });
    } catch (err) {
      console.error(err);
      return reply.code(500).send({ hata: 'Sunucu hatası.' });
    }
  });
}

module.exports = authRoutes;

