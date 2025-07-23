// test/setup.js
const buildFastify = require('../src/app');

let fastify;

async function start() {
  fastify = buildFastify();
  await fastify.listen({ port: 0 }); // Random kullanılabilir port
  return fastify;
}

async function close() {
  await fastify.close();
}

module.exports = { start, close };

