const Providers = require("../models/providers");

async function getProviders({ page, perPage, search }) {
    let query = Providers.query()
            .select('id', 'fullname', 'url_nickname', 'phone_number')

    if (search) {
        query = query.where('fullname', 'like', `%${search}%`);
    }

    return await query.page(page - 1, perPage);
}

async function getProviderIdFullnameList() {
    return await Providers.query()
        .select('id', 'fullname')
        .orderBy('fullname', 'asc');
}

module.exports.providerLoginService = { getProviders, getProviderIdFullnameList }
