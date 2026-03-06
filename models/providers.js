// models/Provider.js
const { Model } = require('objection');
const ProviderSetting = require('./providerSetting');
const ProviderTaxData = require('./providerTaxData');
const PosSubscription = require('./posSubscription');

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
      tax_data: {
        relation: Model.BelongsToOneRelation,
        modelClass: ProviderTaxData,
        join: {
          from: 'providers.provider_tax_data_id',
          to: 'provider_tax_data.id',
        },
      },
      provider_tax_data: {
        relation: Model.BelongsToOneRelation,
        modelClass: ProviderTaxData,
        join: {
          from: 'providers.provider_tax_data_id',
          to: 'provider_tax_data.id',
        },
      },
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
      settings: {
        relation: Model.HasOneRelation,
        modelClass: ProviderSetting,
        join: {
          from: 'providers.id',
          to: 'provider_settings.provider_id',
        },
      },
      packages: {
        relation: Model.HasManyRelation,
        modelClass: PosSubscription,
        join: {
          from: 'providers.id',
          to: 'pos_subscriptions.provider_id',
        },
      },
      pos_subscriptions: {
        relation: Model.HasManyRelation,
        modelClass: PosSubscription,
        join: {
          from: 'providers.id',
          to: 'pos_subscriptions.provider_id',
        },
      },
    };
  }

}

module.exports = Providers;
