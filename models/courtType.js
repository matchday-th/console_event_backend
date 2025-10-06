const { Model } = require('objection');
const Court = require('./court');
const TimeSlot = require('./timeSlot');

class CourtType extends Model {
  static get tableName() {
    return 'court_types';
  }
  static get relationMappings() {
    const ProviderSport = require('./providerSport');

    return {
      courts: {
        relation: Model.HasManyRelation,
        modelClass: Court,
        join: {
          from: 'court_types.id',
          to: 'courts.court_type_id',
        },
      },
      time_slots: {
        relation: Model.HasManyRelation,
        modelClass: TimeSlot,
        join: {
          from: 'court_types.id',
          to: 'time_slots.court_type_id',
        },
      },
      provider_sport: {
        relation: Model.BelongsToOneRelation,
        modelClass: ProviderSport,
        join: {
          from: 'court_types.provider_sport_id',
          to: 'provider_sports.id',
        },
      },
    };
  }
}

module.exports = CourtType;
