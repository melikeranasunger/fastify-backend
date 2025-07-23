// test/auth.test.js

const { test } = require('tap');
const buildFastify = require('../src/app'); // ✅ server.js değil, app.js çağırıyoruz

const password = '123456';

test('Auth testleri', async (t) => {
  const fastify = buildFastify(); // bellekte sunucu başlat
  await fastify.ready();          // tüm plugin'leri yükle

  await t.test('Kullanıcı kaydı ve başarılı giriş', async (t) => {
    const email = `test${Date.now()}@mail.com`;

    const signupRes = await fastify.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {  name: 'Test Kullanıcı',email, password },
    });
    t.equal(signupRes.statusCode, 201, 'Signup status 201 olmalı');

    const loginRes = await fastify.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email, password },
    });
    t.equal(loginRes.statusCode, 200, 'Login status 200 olmalı');
  });

  await t.test('Giriş başarısız (yanlış şifre)', async (t) => {
    const email = `test${Date.now()}@mail.com`;

    await fastify.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: { email, password },
    });

    const res = await fastify.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email, password: 'yanlisSifre' },
    });
    t.notEqual(res.statusCode, 200, 'Yanlış şifre ile login başarılı olmamalı');
  });

  await fastify.close(); // sunucuyu kapat
});


