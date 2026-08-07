const { providerLoginService } = require("../services/providerLoginService");

async function getProviders(request, reply) {
   try{
    const { page = 1, perPage = 20, search = '' } = request.query;
    
    const result = await providerLoginService.getProviders({ page, perPage, search });

    const lastPage = Math.ceil(result.total / perPage);

    return reply.send({
        total: result.total,
        page: parseInt(page),
        perPage: parseInt(perPage),
        data: result.results,
        lastPage
    });

   }catch(err){
    console.log(err);
    reply.code(500).send({message: 'Something went wrong!'})
   }
}

async function getProviderIdFullnameList(request, reply) {
   try {
    const result = await providerLoginService.getProviderIdFullnameList();
    return reply.send({ data: result });
   } catch (err) {
    console.log(err);
    reply.code(500).send({ message: 'Something went wrong!' });
   }
}

async function setProviderAccess(request, reply) {
   try {
    const { id } = request.params;
    const { revoked, reason } = request.body || {};

    if (!id) {
        return reply.status(400).send({ message: 'Required ID', field: 'id' });
    }
    if (typeof revoked !== 'boolean') {
        return reply.status(400).send({ message: 'Required boolean "revoked"', field: 'revoked' });
    }

    const result = await providerLoginService.setProviderAccess({ id, revoked, reason });
    if (!result) {
        return reply.status(404).send({ message: 'Provider not found', field: 'id' });
    }

    // Who did what, to whom. request.user comes from the @fastify/jwt verify.
    console.log(
        `[provider-access] actor=${request.user && request.user.uid} provider=${id} ` +
        `revoked=${revoked} reason=${reason || '-'}`
    );

    return reply.send({
        message: revoked ? 'Provider kicked' : 'Provider access restored',
        data: result,
    });
   } catch (err) {
    console.log(err);
    return reply.code(500).send({ message: 'Something went wrong!' });
   }
}

module.exports.providerLoginController = { getProviders, getProviderIdFullnameList, setProviderAccess }
