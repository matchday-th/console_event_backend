const { Model } = require('objection');

class Court extends Model {
  static get tableName() {
    return 'courts';
  }
}

module.exports = Court;
