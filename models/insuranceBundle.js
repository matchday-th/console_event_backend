const { Model } = require('objection');

class InsuranceBundle extends Model {
  static get tableName() {
    return 'insurance_bundles';
  }
}

module.exports = InsuranceBundle;
