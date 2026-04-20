"use strict";

const { staffController } = require("../../controller/staffController");

module.exports = async function (fastify) {
  fastify.post("/staff", staffController.createStaff);
  fastify.get("/provider/:provider/staff", staffController.getStaffByProvider);
  fastify.get("/staff/provider/:provider", staffController.getStaffByProvider);
};
