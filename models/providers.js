// models/Provider.js
const { Model } = require('objection');

class Providers extends Model {
  static get tableName() {
    return 'providers'; // matches your table name in MySQL
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
    };
  }

}

module.exports = Providers;
