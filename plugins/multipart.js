"use strict";

const fp = require("fastify-plugin");
const multipart = require("@fastify/multipart");

module.exports = fp(async function (fastify) {
  fastify.register(multipart, {
    // 15 MB per file. The console compresses gallery photos in the browser
    // first, so this is only the backstop for a raw upload.
    limits: { fileSize: 15 * 1024 * 1024 },
  });
});
