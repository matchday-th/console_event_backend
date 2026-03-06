const { Model } = require('objection');

class Member extends Model {
  static get tableName() {
    return 'members';
  }
}

module.exports = Member;
