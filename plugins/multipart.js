"use strict";

const fp = require("fastify-plugin");
const multipart = require("@fastify/multipart");

module.exports = fp(async function (fastify) {
  fastify.register(multipart, {
    // 10 MB per file.
    limits: { fileSize: 10 * 1024 * 1024 },
  });
});
