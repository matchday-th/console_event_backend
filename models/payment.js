const { Model } = require('objection');

class Payment extends Model {
  static get tableName() {
    return 'payments';
  }
}

module.exports = Payment;
