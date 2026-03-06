const { Model } = require('objection');

class Bill extends Model {
  static get tableName() {
    return 'bills';
  }
}

module.exports = Bill;
