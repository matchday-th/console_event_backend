const { authService } = require("../services/authService");

async function login(request, reply) {
    try{
      const { id } = request.body;

      if (!id) {
        return reply.status(400).send({ mesage: "Required ID", field: "Fields" });
      }

      const user = await authService.findUser({ id });
      if (!user) {
        return reply.status(401).send({ message: 'Invalid id', field: 'Id' });
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

async function changePassword(request, reply) {
    try {
      const { id } = request.params;
      const { password } = request.body || {};

      if (!id) {
        return reply.status(400).send({ message: "Required ID", field: "id" });
      }

      if (!password) {
        return reply.status(400).send({ message: "Required password", field: "password" });
      }

      const updated = await authService.changeProviderPassword({ id, password });
      if (!updated) {
        return reply.status(404).send({ message: "Provider not found", field: "id" });
      }

      return reply.send({ message: "Password updated" });
    } catch (e) {
      console.log(e);
      return reply.status(500).send({
        message:'Try again !',
        field: "Internal Server Error"
      });
    }
}

module.exports.authController = { login, changePassword };
