const { Model } = require('objection');

class Sport extends Model {
  static get tableName() {
    return 'sports';
  }
}

module.exports = Sport;
