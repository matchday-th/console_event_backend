const { Model } = require('objection');

class PaymentOption extends Model {
  static get tableName() {
    return 'payment_options';
  }
}

module.exports = PaymentOption;
