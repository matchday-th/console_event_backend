const { Model } = require('objection');

class PaymentDetail extends Model {
  static get tableName() {
    return 'payment_details';
  }
}

module.exports = PaymentDetail;
