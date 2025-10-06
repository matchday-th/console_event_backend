const { Model } = require('objection');

class TimeSlot extends Model {
  static get tableName() {
    return 'time_slots';
  }
}

module.exports = TimeSlot;
