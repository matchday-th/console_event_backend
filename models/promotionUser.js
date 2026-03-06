const { Model } = require('objection');

class PromotionUser extends Model {
  static get tableName() {
    return 'promotion_users';
  }
}

module.exports = PromotionUser;
