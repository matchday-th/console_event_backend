'use strict';

const { Model } = require('objection');

class Staff extends Model {
  static get tableName() {
    return 'staff';
  }
}

module.exports = Staff;
