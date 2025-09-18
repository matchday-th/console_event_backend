"use strict";
const bcrypt = require('bcrypt');
const Providers = require('../models/providers');

module.exports = async function (fastify, opts) {

  fastify.get("/", async function (request, reply) {
    return reply.send({ message: "Console Event is serve..." });
  });

  fastify.post("/login", async function (request, reply) {
    try{
      const { username, password } = request.body;

      if (!username || !password) {
        return reply.status(400).send({ mesage: "Username and password are required", field: "Fields" });
      }

      const user = await Providers.query()
                  .where('url_nickname', username)
                  .orWhere('phone_number', username)
                  .first();
      if (!user) {
        return reply.status(401).send({ message: 'Invalid username', field: 'Username' });
      }

      // compare password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return reply.status(401).send({ message: 'Invalid password', field : 'Password' });
      }

      const token = fastify.jwt.sign(
        { uid: user.id , sub: "Arena" }
      );

      return reply.send({ token });

    }catch(e){
      console.log(e);
      return reply.status(500).send({
        message:'Try again !',
        field: "Internal Server Error"
      })

    }
    
  });

};
