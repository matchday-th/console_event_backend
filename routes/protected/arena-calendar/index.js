"use strict";

const { arenaCalendarController } = require("../../../controller/arenaCalendarController");

module.exports = async function (fastify) {
    fastify.get('/profile/:id', arenaCalendarController.profile);
    fastify.post('/matches/:id', arenaCalendarController.matches);
}