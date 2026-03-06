const { Model } = require('objection');

class PaymentReceipt extends Model {
  static get tableName() {
    return 'payment_receipts';
  }
}

module.exports = PaymentReceipt;
