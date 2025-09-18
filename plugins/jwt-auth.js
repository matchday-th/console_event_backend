const fp = require('fastify-plugin');
const Provider = require('../models/providers');

module.exports = fp(async function (fastify, opts) {
  fastify.register(require('@fastify/jwt'), {
    secret: process.env.APP_KEY,
  })

  // Create authentication decorator
  fastify.decorate('authenticate', async function(request, reply) {
   
    try {
      // Verify JWT token from Authorization header
      const res =  await request.jwtVerify();
      const user = await Provider.query().findById(res.uid);

      if (!user) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      request.user = user; // add user data to request.user
      
    } catch (err) {
      console.log(err);
      reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid or missing JWT token'
      })
    }
  })
});

