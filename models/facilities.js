const { Model } = require('objection');

class Facilities extends Model {
  static get tableName() {
    return 'facilities';
  }
}

module.exports = Facilities;
