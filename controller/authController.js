const { authService } = require("../services/authService");
const bcrypt = require('bcrypt');

async function login(request, reply) {
    try{
      const { username, password } = request.body;

      if (!username || !password) {
        return reply.status(400).send({ mesage: "Username and password are required", field: "Fields" });
      }

      const user = await authService.findUser({username, password});
      if (!user) {
        return reply.status(401).send({ message: 'Invalid username', field: 'Username' });
      }

      // compare password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return reply.status(401).send({ message: 'Invalid password', field : 'Password' });
      }

      const token = request.server.jwt.sign(
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
}

module.exports.authController = { login };