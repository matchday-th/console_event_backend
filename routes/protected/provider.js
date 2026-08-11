// ~/routes/protected/provider.js

"use strict";

const { authController } = require("../../controller/authController");
const { providerMediaController } = require("../../controller/providerMediaController");
const { providerLoginController } = require("../../controller/providerLoginController");
const { roleController } = require("../../controller/roleController");

module.exports = async function (fastify) {
    fastify.put('/provider/:id/change-password', authController.changePassword);
    fastify.get('/provider/:id/roles', roleController.getRolesByProvider);
    fastify.post('/provider/:id/roles', roleController.createRole);
    fastify.put('/provider/:id/roles/:roleId', roleController.updateRole);
    fastify.delete('/provider/:id/roles/:roleId', roleController.deleteRole);
    fastify.get('/provider/:id/media', providerMediaController.getProviderMedia);
    fastify.put('/provider/:id/media', providerMediaController.createProviderPhoto);
    fastify.put('/provider/:id/media/liff', providerMediaController.updateProviderLiffMedia);
    fastify.put('/provider/:id/logo', providerMediaController.updateProviderLogo);
    fastify.put('/provider/:id/settings', providerMediaController.updateProviderSettings);
    fastify.put('/provider/:id/public-fields', providerMediaController.updateProviderPublicFields);
    fastify.put('/court/:id', providerMediaController.updateCourt);
    fastify.put('/court-type/:id', providerMediaController.updateCourtType);
    fastify.get('/provider/list', providerLoginController.getProviderIdFullnameList);
    fastify.get('/provider/facilities', providerMediaController.getFacilitiesList);
    fastify.post('/provider/facility_providers', providerMediaController.createFacilityProvider);
    fastify.get('/provider/promotion-users', providerMediaController.getPromotionUsersIndex);
}
 
