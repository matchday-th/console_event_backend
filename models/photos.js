const { Model } = require('objection');

class Photos extends Model {
  static get tableName() {
    return 'photos';
  }
}

module.exports = Photos;
