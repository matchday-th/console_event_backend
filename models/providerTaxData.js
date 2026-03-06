const { Model } = require('objection');

class ProviderTaxData extends Model {
  static get tableName() {
    return 'provider_tax_data';
  }
}

module.exports = ProviderTaxData;
