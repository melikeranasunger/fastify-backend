const { test } = require('tap');
const buildFastify = require('../src/server');

let fastify;
let token;

test('Fastify başlat ve kullanıcı oluştur → token al', async (t) => {
  fastify = await buildFastify();

  // Kullanıcı kaydı
  await fastify.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      email: 'testuser@example.com',
      password: '123456'
    }
  });

  // Giriş yap → token al
  const loginRes = await fastify.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      email: 'testuser@example.com',
      password: '123456'
    }
  });

  const loginData = JSON.parse(loginRes.payload);
  token = loginData.token;
  t.ok(token, 'Token alındı');
});

test('GET /events boş liste döner', async (t) => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/api/events',
    headers: {
      authorization: `Bearer ${token}`
    }
  });
  t.equal(response.statusCode, 200);
  const body = JSON.parse(response.payload);
  t.ok(Array.isArray(body));
});

test('POST /events yeni event oluşturur', async (t) => {
  const response = await fastify.inject({
    method: 'POST',
    url: '/api/events',
    headers: {
      authorization: `Bearer ${token}`
    },
    payload: {
      title: 'Test Event',
      description: 'Test description',
      date: new Date().toISOString(),
      roomId: 1
    }
  });
  t.equal(response.statusCode, 201);
  const body = JSON.parse(response.payload);
  t.equal(body.title, 'Test Event');
});

test('GET /events/:id varolan event getirir', async (t) => {
  const postRes = await fastify.inject({
    method: 'POST',
    url: '/api/events',
    headers: {
      authorization: `Bearer ${token}`
    },
    payload: {
      title: 'GetById Event',
      description: 'Desc',
      date: new Date().toISOString(),
      roomId: 1
    }
  });
  const created = JSON.parse(postRes.payload);

  const getRes = await fastify.inject({
    method: 'GET',
    url: `/api/events/${created.id}`,
    headers: {
      authorization: `Bearer ${token}`
    }
  });

  t.equal(getRes.statusCode, 200);
  const body = JSON.parse(getRes.payload);
  t.equal(body.id, created.id);
});

test('PUT /events/:id event günceller', async (t) => {
  const postRes = await fastify.inject({
    method: 'POST',
    url: '/api/events',
    headers: {
      authorization: `Bearer ${token}`
    },
    payload: {
      title: 'Update Event',
      description: 'Desc',
      date: new Date().toISOString(),
      roomId: 1
    }
  });
  const created = JSON.parse(postRes.payload);

  const putRes = await fastify.inject({
    method: 'PUT',
    url: `/api/events/${created.id}`,
    headers: {
      authorization: `Bearer ${token}`
    },
    payload: {
      title: 'Updated Title',
      description: 'Updated Desc',
      date: new Date().toISOString(),
      roomId: 1
    }
  });

  t.equal(putRes.statusCode, 200);
  const body = JSON.parse(putRes.payload);
  t.equal(body.title, 'Updated Title');
});

test('DELETE /events/:id event siler', async (t) => {
  const postRes = await fastify.inject({
    method: 'POST',
    url: '/api/events',
    headers: {
      authorization: `Bearer ${token}`
    },
    payload: {
      title: 'Delete Event',
      description: 'Desc',
      date: new Date().toISOString(),
      roomId: 1
    }
  });
  const created = JSON.parse(postRes.payload);

  const delRes = await fastify.inject({
    method: 'DELETE',
    url: `/api/events/${created.id}`,
    headers: {
      authorization: `Bearer ${token}`
    }
  });

  t.equal(delRes.statusCode, 204);

  const getRes = await fastify.inject({
    method: 'GET',
    url: `/api/events/${created.id}`,
    headers: {
      authorization: `Bearer ${token}`
    }
  });

  t.equal(getRes.statusCode, 404);
});

