const Providers = require("../models/providers");
const bcrypt = require("bcrypt");

async function findUser({id}) {
     return await Providers.query()
                  .where('id', id)
                  .first();
}

async function changeProviderPassword({ id, password }) {
     const hashedPassword = await bcrypt.hash(password, 10);
     return await Providers.query()
          .findById(id)
          .patch({ password: hashedPassword });
}

module.exports.authService = { findUser, changeProviderPassword }
