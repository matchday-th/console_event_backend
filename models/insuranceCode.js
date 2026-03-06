const { Model } = require('objection');

class InsuranceCode extends Model {
  static get tableName() {
    return "insurance_codes";
  }
}

module.exports = InsuranceCode;
