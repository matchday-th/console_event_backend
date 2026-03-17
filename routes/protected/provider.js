// ~/routes/protected/provider.js

"use strict";

const { authController } = require("../../controller/authController");

module.exports = async function (fastify) {
    fastify.put('/provider/:id/change-password', authController.changePassword);
}
