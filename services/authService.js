const Providers = require("../models/providers");

async function findUser({username, password}) {

     return await Providers.query()
                  .where('url_nickname', username)
                  .orWhere('phone_number', username)
                  .first();
}

module.exports.authService = { findUser }