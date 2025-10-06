const { Model } = require('objection');
const Promotion = require('./promotion');

class MatchDiscount extends Model {
  static get tableName() {
    return 'match_discounts';
  }
  static get relationMappings() {
        return {
            promotion: {
                relation: Model.BelongsToOneRelation,
                modelClass: Promotion,
                join: {
                    from: 'match_discounts.promotion_id',
                    to: 'promotions.id'
                }
            },
        };
    }
}

module.exports = MatchDiscount;
