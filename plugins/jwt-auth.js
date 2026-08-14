const fp = require('fastify-plugin');
const Provider = require('../models/providers');
const SuperAdmin = require('../models/superAdmin');

module.exports = fp(async function (fastify, opts) {
  fastify.register(require('@fastify/jwt'), {
    secret: process.env.APP_KEY,
  })

  // Create authentication decorator
  fastify.decorate('authenticate', async function(request, reply) {
   
    try {
      // Verify JWT token from Authorization header
      const res =  await request.jwtVerify();

      // The console's own token (md_console, from /md-console/login) is minted
      // by the arena backend's SuperAdmin authenticator, so its uid indexes
      // super_admins -- NOT providers. Looking it up in providers only ever
      // matched when a super-admin id happened to collide with a provider id.
      // The /api/login impersonation token is a Provider token, hence both.
      const user = res.sub === 'SuperAdmin'
        ? await SuperAdmin.query().findById(res.uid)
        : await Provider.query().findById(res.uid);

      if (!user) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      request.user = user; // add user data to request.user
      request.authSubject = res.sub;

    } catch (err) {
      console.log(err);
      reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid or missing JWT token'
      })
    }
  })

  // Runs after `authenticate`, which is what populates request.authSubject.
  // Impersonation and other console-only actions must not be reachable with a
  // Provider token -- only with a super-admin's own md_console token.
  //
  // Two modes. `shadow` (the default) logs what real console traffic actually
  // carries but lets it through; `enforce` rejects. This exists because the
  // first enforcing rollout had to be reverted and the reason was never
  // established -- md-console/login demonstrably mints subject "SuperAdmin"
  // (arena-prod-2 config/auth.js) against the same adonis_db, so the failure was
  // something else. Shadow first, read the logs, then flip LOGIN_GUARD=enforce.
  //
  // NOTE: `authenticate` still runs and still rejects anonymous callers even in
  // shadow mode. That is the part that closes the token oracle; this decorator
  // only narrows an already-authenticated caller down to super-admins.
  const GUARD_MODE = String(process.env.LOGIN_GUARD || 'shadow').toLowerCase();

  fastify.decorate('requireSuperAdmin', async function (request, reply) {
    if (request.authSubject === 'SuperAdmin') return;

    const seen = {
      sub: request.authSubject,
      uid: request.user && request.user.id,
      route: request.url
    };

    if (GUARD_MODE !== 'enforce') {
      request.log.warn(seen, 'login_guard: non-SuperAdmin allowed through (shadow mode)');
      return;
    }

    request.log.warn(seen, 'login_guard: non-SuperAdmin BLOCKED');
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Super admin only'
    });
  })
});

