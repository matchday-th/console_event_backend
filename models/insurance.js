const { Model } = require('objection');

class PromotionUser extends Model {
  static get tableName() {
    return 'insurance';
  }
}

module.exports = PromotionUser;
