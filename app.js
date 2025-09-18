'use strict'

const path = require('node:path')
const AutoLoad = require('@fastify/autoload')

module.exports = async function (fastify, opts) {

  fastify.get("/", async function (request, reply) {
    return reply.send({ message: "Console Event is serve..." });
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    encapsulate: false,
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { prefix: '/api' }
  });

  // Protected Routes (Require Authentication)
  fastify.register(async function (instance) {
    instance.addHook('onRequest', async function (request, reply) {
    await fastify.authenticate(request, reply);
  });

    // Load all protected routes
    instance.register(AutoLoad, {
      dir: path.join(__dirname, "routes/protected"),
      options: Object.assign({}, opts)
    });
  }, );

}
