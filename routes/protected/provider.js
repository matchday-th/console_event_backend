// ~/routes/protected/auth.js

"use strict";

const Providers = require("../../models/providers");

module.exports = async function (fastify) {

    //get providers
    fastify.get("/providers", async (request, reply) => {

        const { page = 1, perPage = 20, search = '' } = request.query;

        let query = Providers.query()
            .select('id', 'fullname', 'url_nickname', 'phone_number')
            .where(function() {
                    this.where('removed', 0).orWhereNull('removed');
                })

        if (search) {
            query = query.where('fullname', 'like', `%${search}%`);
        }

        const result = await query.page(page - 1, perPage);

        const lastPage = Math.ceil(result.total / perPage);

        return reply.send({
            total: result.total,
            page: parseInt(page),
            perPage: parseInt(perPage),
            data: result.results,
            lastPage
        });
    });
}
