// knexfile.js
require('dotenv').config(); // load .env file

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    },
    // connection: {
    //   host:'localhost',
    //   user: 'root',
    //   password: 'admin',
    //   database: 'console_event',
    // },
    // migrations: {
    //   directory: './database/migrations', // folder for migration files
    // },
    // seeds: {
    //   directory: './database/seeds', // folder for seed files
    // },
  },

  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    },
    // migrations: {
    //   directory: './migrations',
    // },
    // seeds: {
    //   directory: './seeds',
    // },
  },
};

