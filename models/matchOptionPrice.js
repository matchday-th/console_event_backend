const { Model } = require('objection');
const OptionPrice = require('./optionPrice');

class MatchOptionPrice extends Model {
  static get tableName() {
    return 'match_option_prices';
  }

  static get relationMappings() {
        return {
            option_price: {
                relation: Model.BelongsToOneRelation,
                modelClass: OptionPrice,
                join: {
                    from: 'match_option_prices.option_price_id',
                    to: 'option_prices.id'
                }
            },
        };
    }
}

module.exports = MatchOptionPrice;
