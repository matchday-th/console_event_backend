"use strict";

const { authController } = require('../controller/authController');

module.exports = async function (fastify, opts) {
  fastify.post("/login", authController.login);
};
