const { Model } = require('objection');

class OptionPrice extends Model {
  static get tableName() {
    return 'option_prices';
  }
}

module.exports = OptionPrice;
