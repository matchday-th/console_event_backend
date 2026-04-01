// ~/routes/protected/provider.js

"use strict";

const { authController } = require("../../controller/authController");
const { providerMediaController } = require("../../controller/providerMediaController");

module.exports = async function (fastify) {
    fastify.put('/provider/:id/change-password', authController.changePassword);
    fastify.get('/provider/:id/media', providerMediaController.getProviderMedia);
    fastify.put('/provider/:id/media', providerMediaController.createProviderPhoto);
    fastify.put('/provider/:id/logo', providerMediaController.updateProviderLogo);
    fastify.put('/provider/:id/settings', providerMediaController.updateProviderSettings);
    fastify.get('/provider/facilities', providerMediaController.getFacilitiesList);
    fastify.post('/provider/facility_providers', providerMediaController.createFacilityProvider);
    fastify.get('/provider/promotion-users', providerMediaController.getPromotionUsersIndex);
}
 
