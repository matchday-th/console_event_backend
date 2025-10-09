const { Model } = require('objection');
const CourtType = require('./courtType');
const MatchOptionPrice = require('./matchOptionPrice');
const MatchDiscount = require('./matchDiscount');
const PaymentDetail = require('./paymentDetail');

class Match extends Model {
    static get tableName() {
        return 'matches';
    }

    static get relationMappings() {
        return {
            court_type: {
                relation: Model.BelongsToOneRelation,
                modelClass: CourtType,
                join: {
                    from: 'matches.provider_sport_id',
                    to: 'court_types.provider_sport_id'
                }
            },
            match_option_price: {
                relation: Model.BelongsToOneRelation,
                modelClass: MatchOptionPrice,
                join: {
                    from: 'matches.id',
                    to: 'match_option_prices.match_id'
                }
            },
            match_discount: {
                relation: Model.BelongsToOneRelation,
                modelClass: MatchDiscount,
                join: {
                    from: 'matches.id',
                    to: 'match_discounts.match_id'
                }
            },
            payment_details: {
                relation: Model.HasManyRelation,
                modelClass: PaymentDetail,
                join: {
                from: 'matches.id',
                to: 'payment_details.match_id',
                },
            }
        };
    }
}

module.exports = Match;
