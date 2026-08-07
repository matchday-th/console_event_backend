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

  // Public routes. AutoLoad recurses into subdirectories, so routes/protected
  // MUST be excluded here -- otherwise every protected route also gets mounted
  // at /api/protected/* with no auth hook, which is exactly what the frontend
  // calls. Leaving it out made the whole admin surface (change-password, staff,
  // roles, provider access) reachable unauthenticated from the internet.
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { prefix: '/api' },
    ignoreFilter: (filePath) => filePath.includes('/protected/')
  });

  // Protected Routes (Require Authentication)
  // Mounted at /api/protected so the single authenticated copy lives where the
  // console already calls it. Previously this used `opts`, which carries no
  // prefix, so the authenticated copy sat unused at the root (/provider_logins)
  // while the unauthenticated one served real traffic.
  fastify.register(async function (instance) {
    instance.addHook('onRequest', async function (request, reply) {
      await fastify.authenticate(request, reply);
    });

    instance.register(AutoLoad, {
      dir: path.join(__dirname, "routes/protected"),
      options: { prefix: '/api/protected' }
    });
  });

}
