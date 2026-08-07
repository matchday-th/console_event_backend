// ~/routes/protected/auth.js

"use strict";

const { providerLoginController } = require("../../controller/providerLoginController");

module.exports = async function (fastify) {
    fastify.get('/provider_logins', providerLoginController.getProviders);
    // Kick a provider (revoked:true) or reinstate one (revoked:false). Kicking
    // invalidates every live token for that provider on its next request.
    fastify.put('/provider/:id/access', providerLoginController.setProviderAccess);
}
