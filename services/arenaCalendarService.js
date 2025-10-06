const Match = require("../models/match");
const Providers = require("../models/providers");

async function providerById(id) {
    return await Providers.query()
        .findById(id)
        .withGraphFetched('provider_sports.[sport, court_types.[courts, time_slots]]')
        .withGraphFetched('provider_setting')
}

async function matches(id, time_start, time_end){
    return await Match.query()
            .where('provider_id', id)
            .where('cancel', 0)
            .where('deleted', 0)
            .whereBetween('time_start', [time_start, time_end])
            .withGraphFetched('court_type.[courts, provider_sport.[sport]]')
            .withGraphFetched('match_option_price.[option_price]')
            // .withGraphFetched('match_discount.[promotion(selectedField)]')
            // .modifiers({
            //     selectedField(builder) {
            //       builder.select('name', 'id', 'type', 'value', 'price');
            //     }
            // })

}

module.exports.arenaCalendarService = { providerById, matches }
