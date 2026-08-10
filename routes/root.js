"use strict";

const { authController } = require('../controller/authController');

module.exports = async function (fastify, opts) {
  // Provider impersonation: mints an Arena token from a provider id alone, with
  // no password. The JWT is signed with the shared APP_KEY that every arena
  // backend trusts, so leaving this open is not just a console bypass -- it is
  // an estate-wide token oracle for any provider id. Super-admin only.
  //
  // This file is mounted by the PUBLIC AutoLoad register (no auth hook), so the
  // guard has to be declared per-route here rather than inherited.
  fastify.post(
    "/login",
    { onRequest: [fastify.authenticate], preHandler: [fastify.requireSuperAdmin] },
    authController.login
  );
};
