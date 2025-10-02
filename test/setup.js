// test/setup.js
const buildFastify = require('../src/app');

let fastify;

async function start() {
  fastify = buildFastify();
  await fastify.listen({ port:0 });// 0 = random boş port seçer
  return fastify;
}

async function close() {
  if (fastify) {
    await fastify.close();
  }
}

module.exports = { start, close };



