'use strict';

const fp = require('fastify-plugin');
const Knex = require('knex');
const { Model } = require('objection')

module.exports = fp(async function (fastify, opts) {
  // Initialize Knex with the knexfile configuration
  const knexConfig = require('../knexfile.js')[process.env.NODE_ENV || 'development'];
  const knex = Knex(knexConfig);

  // Test database connection
  try {
    await knex.raw('SELECT 1');
    console.log(`🚀 Server running at: http://localhost:3001`);
    console.log('Database connected successfully');
  } catch (error) {
    console.log('Database connection failed:', error);
    throw error; // Rethrow to prevent Fastify from starting if DB connection fails
  }

  // Add Knex to the Fastify instance
  fastify.decorate('db', knex); 
  Model.knex(knex);

  // Cleanup Knex on Fastify shutdown
  fastify.addHook('onClose', async (fastifyInstance) => {
    await knex.destroy();
  });
});