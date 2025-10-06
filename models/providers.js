// models/Provider.js
const { Model } = require('objection');
const ProviderSetting = require('./providerSetting');

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
  static get relationMappings() {
    const ProviderSport = require('./providerSport');

    return {
      provider_sports: {
        relation: Model.HasManyRelation,
        modelClass: ProviderSport,
        join: {
          from: 'providers.id',
          to: 'provider_sports.provider_id',
        },
      },
      provider_setting: {
        relation: Model.HasOneRelation,
        modelClass: ProviderSetting,
        join: {
          from: 'providers.id',
          to: 'provider_settings.provider_id',
        },
      },
    };
  }

}

module.exports = Providers;
