const { test } = require('tap');
const { request } = require('undici');
const { start, close } = require('./setup');

test('Auth Routes', async t => {
  const fastify = await start();
  const port = fastify.server.address().port;
  const BASE_URL = `http://localhost:${port}/api/auth`;

  // Signup - Yeni kullanıcı oluştur
  const signupRes = await request(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'melike@example.com', password: '123456' })
  });
  t.equal(signupRes.statusCode, 200, 'Signup başarılı olmalı');
  const signupData = await signupRes.body.json();
  t.match(signupData, { message: 'User created' });

  // Geçerli login
  const loginRes = await request(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
  });
  t.equal(loginRes.statusCode, 200, 'Status 200 olmalı');
  const loginData = await loginRes.body.json();
  t.ok(loginData.token, 'Token dönmeli');

  // Yanlış şifre
  const wrongRes = await request(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'yanlis' })
  });
  t.equal(wrongRes.statusCode, 401, 'Yanlış şifre 401 dönmeli');

  // Eksik body
  const emptyRes = await request(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  t.equal(emptyRes.statusCode, 400, 'Eksik body 400 dönmeli');
  // Token ile profil
  const profileRes = await request(`${BASE_URL}/profile`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${loginData.token}` }
  });
  t.equal(profileRes.statusCode, 200, 'Token ile profile başarılı');

  // Tokensız profil
  const noTokenRes = await request(`${BASE_URL}/profile`, {
    method: 'GET'
  });
  t.equal(noTokenRes.statusCode, 401, 'Token olmadan 401 dönmeli');

  await close();
});


