"use strict";

const fp = require("fastify-plugin");
const multipart = require("@fastify/multipart");

module.exports = fp(async function (fastify) {
  fastify.register(multipart, {
    limits: { fileSize: 2 * 1024 * 1024 },
  });
});
