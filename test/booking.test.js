const { test } = require('tap');
const { request } = require('undici');
const { start, close } = require('./setup');

test('Booking Routes', async t => {
  // Test server başlat
  const fastify = await start();
  const port = fastify.server.address().port;
  const AUTH_URL = `http://localhost:${port}/api/auth`;
  const BOOKING_URL = `http://localhost:${port}/api/bookings`;

  // Token al (login)
  const loginRes = await request(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
  });
  t.equal(loginRes.statusCode, 200, 'Login 200 dönmeli');
  const loginData = await loginRes.body.json();
  const token = loginData.token;
  t.ok(token, 'Token dönmeli');

  //Booking oluştur
  const postRes = await request(BOOKING_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      roomId: 1,
      startDate: '2025-10-05',
      endDate: '2025-10-06'
    })
  });
  t.equal(postRes.statusCode, 201, 'Booking 201 dönmeli');
  const postData = await postRes.body.json();
  t.match(postData, { roomId: 1 }, 'Booking doğru oda ile oluşturuldu');

  //Booking listele
  const getRes = await request(BOOKING_URL, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  t.equal(getRes.statusCode, 200, 'Booking listesi 200 dönmeli');
  const bookings = await getRes.body.json();
  t.ok(Array.isArray(bookings), 'Booking listesi array olmalı');

  // Test server kapat
  await close();
});


