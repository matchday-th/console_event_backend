const Providers = require("../models/providers");

async function findUser({id}) {

     return await Providers.query()
                  .where('id', id)
                  .first();
}

module.exports.authService = { findUser }