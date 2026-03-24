const { Model } = require('objection');
const Promotion = require('./promotion');

class PromotionUser extends Model {
  static get tableName() {
    return 'promotion_users';
  }

  static get relationMappings() {
    return {
      promotion: {
        relation: Model.BelongsToOneRelation,
        modelClass: Promotion,
        join: {
          from: 'promotion_users.promotion_id',
          to: 'promotions.id',
        },
      },
      match: {
        relation: Model.BelongsToOneRelation,
        modelClass: require.resolve('./match'),
        join: {
          from: 'promotion_users.match_id',
          to: 'matches.id',
        },
      },
    };
  }
}

module.exports = PromotionUser;
