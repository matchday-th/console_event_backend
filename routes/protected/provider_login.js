// ~/routes/protected/auth.js

"use strict";

const { providerLoginController } = require("../../controller/providerLoginController");

module.exports = async function (fastify) {
    fastify.get('/provider_logins', providerLoginController.getProviders);
}
