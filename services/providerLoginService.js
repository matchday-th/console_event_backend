const Providers = require("../models/providers");

async function getProviders({ page, perPage, search }) {
    let query = Providers.query()
            .select('id', 'fullname', 'url_nickname', 'phone_number')
            .where(function() {
                    this.where('removed', 0).orWhereNull('removed');
                })

    if (search) {
        query = query.where('fullname', 'like', `%${search}%`);
    }

    return await query.page(page - 1, perPage);
}

module.exports.providerLoginService = { getProviders }
