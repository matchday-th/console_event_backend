const { Model } = require('objection');
const CourtType = require('./courtType');

class ProviderSport extends Model {
  static get tableName() {
    return 'provider_sports';
  }

  static get relationMappings() {
    const Provider = require('./providers');
    const Sport = require('./sport');
    

    return {
      provider: {
        relation: Model.BelongsToOneRelation,
        modelClass: Provider,
        join: {
          from: 'provider_sports.provider_id',
          to: 'providers.id',
        },
      },
      sport: {
        relation: Model.BelongsToOneRelation,
        modelClass: Sport,
        join: {
          from: 'provider_sports.sport_id',
          to: 'sports.id',
        },
      },
      court_types: {
        relation: Model.HasManyRelation,
        modelClass: CourtType,
        join: {
          from: 'provider_sports.id',
          to: 'court_types.provider_sport_id',
        },
      },
    };
  }
}

module.exports = ProviderSport;
