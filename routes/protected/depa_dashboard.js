"use strict";

const { depaDashboardController } = require('../../controller/depaDashboardController');

module.exports = async function (fastify) {
  fastify.get('/md-console/depa-dashboard', depaDashboardController.snapshot);
};
