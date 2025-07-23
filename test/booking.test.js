const { test } = require('tap');
const { request } = require('undici');

const email = `melike${Date.now()}@test.com`;
const password = '123456';

let token;
let roomId;

test('Rezervasyon testleri (JWT ile)', async (t) => {
  // Kayıt
  await t.test('Signup ve Login', async (t) => {
    await request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Melike', email, password })
    });

    const loginRes = await request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const body = await loginRes.body.json();
    token = body.token;
    t.ok(token, 'Token alınmalı');
  });

  // Oda oluştur
  await t.test('Oda oluşturma', async (t) => {
    const res = await request('http://localhost:3000/api/rooms', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Toplantı Odası',
        capacity: 5,
        location: 'Kat 1'
      })
    });

    const body = await res.body.json();
    roomId = body.oda.id;
    t.equal(res.statusCode, 201, 'Oda başarılı şekilde oluşturulmalı');
  });

  // Geçerli rezervasyon oluştur
  await t.test('İlk rezervasyon başarılı olmalı', async (t) => {
    const res = await request('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        roomId,
        startTime: '2025-07-01T10:00:00.000Z',
        endTime: '2025-07-01T11:00:00.000Z'
      })
    });

    const body = await res.body.json();
    t.equal(res.statusCode, 201, 'İlk rezervasyon başarılı olmalı');
  });

  // Çakışma testi
  await t.test('Çakışan rezervasyon reddedilmeli', async (t) => {
    const res = await request('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        roomId,
        startTime: '2025-07-01T10:30:00.000Z',
        endTime: '2025-07-01T11:30:00.000Z'
      })
    });

    const body = await res.body.json();
    t.equal(res.statusCode, 409, 'Çakışan rezervasyon 409 dönmeli');
    t.match(body.hata, /mevcut/, 'Hata mesajı çakışmayı belirtmeli');
  });
});
