const { Model } = require('objection');

class BillOrder extends Model {
  static get tableName() {
    return 'bill_orders';
  }
}

module.exports = BillOrder;
