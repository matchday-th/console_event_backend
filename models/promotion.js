const { Model } = require('objection');

class Promotion extends Model {
  static get tableName() {
    return 'promotions';
  }
}

module.exports = Promotion;
