const { Model } = require('objection');

class FacilityProviders extends Model {
  static get tableName() {
    return 'facility_providers';
  }
}

module.exports = FacilityProviders;
