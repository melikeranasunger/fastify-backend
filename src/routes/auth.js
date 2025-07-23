const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function authRoutes(fastify, options) {
  // KAYIT
  fastify.post('/auth/signup', async (request, reply) => {
    try {
      const { name, email, password } = request.body;

      if (!name || !email || !password) {
        return reply.code(400).send({ hata: 'Name, email ve password zorunludur.' });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.code(400).send({ hata: 'Bu e-posta zaten kayıtlı.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      return reply.code(201).send({
        mesaj: 'Kullanıcı başarıyla oluşturuldu.',
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      console.error('Signup Hatası:', error);
      return reply.code(500).send({ hata: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' });
    }
  });

  // GİRİŞ
  fastify.post('/auth/login', async (request, reply) => {
    try {
      const { email, password } = request.body;

      if (!email || !password) {
        return reply.code(400).send({ hata: 'Email ve şifre zorunludur.' });
      }

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return reply.code(401).send({ hata: 'Geçersiz giriş bilgileri.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return reply.code(401).send({ hata: 'Geçersiz giriş bilgileri.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        'gizliAnahtar123',
        { expiresIn: '1h' }
      );

      return reply.send({ mesaj: 'Giriş başarılı.', token });
    } catch (error) {
      console.error('Login Hatası:', error);
      return reply.code(500).send({ hata: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' });
    }
  });
}

module.exports = authRoutes;
