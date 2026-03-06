const { Model } = require('objection');

class UsedInventory extends Model {
  static get tableName() {
    return 'used_inventories';
  }
}

module.exports = UsedInventory;
