const { Model } = require('objection');

class MatchService extends Model {
  static get tableName() {
    return 'match_services';
  }
}

module.exports = MatchService;
