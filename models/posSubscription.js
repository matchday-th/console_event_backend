const { Model } = require('objection');

class PosSubscription extends Model {
  static get tableName() {
    return 'pos_subscriptions';
  }

  static get relationMappings() {
    const Providers = require('./providers');
    return {
      provider: {
        relation: Model.BelongsToOneRelation,
        modelClass: Providers,
        join: {
          from: 'pos_subscriptions.provider_id',
          to: 'providers.id',
        },
      },
    };
  }
}

module.exports = PosSubscription;
