const { Model } = require('objection');

class ProviderSetting extends Model {
  static get tableName() {
    return 'provider_settings';
  }
}

module.exports = ProviderSetting;
