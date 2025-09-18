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


module.exports.providerLoginController = { getProviders }