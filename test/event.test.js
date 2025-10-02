const { test } = require('tap');
const { request } = require('undici');
const { start, close } = require('./setup');

test('Event Routes', async t => {
  const fastify = await start();
  const port = fastify.server.address().port;
  const AUTH_URL = `http://localhost:${port}/api/auth`;
  const EVENT_URL = `http://localhost:${port}/api/events`;

  // 1️⃣ Token al
  const loginRes = await request(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
  });
  const loginData = await loginRes.body.json();
  const token = loginData.token;

  // 2️⃣ Event oluştur
  const postRes = await request(EVENT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name: 'Test Event', date: '2025-10-05' })
  });
  t.equal(postRes.statusCode, 201, 'Event 201 dönmeli');

  // 3️⃣ Event listele
  const getRes = await request(EVENT_URL, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  t.equal(getRes.statusCode, 200, 'Event listesi 200 dönmeli');

  await close();
});


