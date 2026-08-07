// models/superAdmin.js
// Mirrors App/Models/SuperAdmin in the arena backend, which is what mints the
// md_console token via `auth.authenticator('SuperAdmin')` on /md-console/login.
// Table created in arena-prod-2/database/migrations/1747131691097_super_admin_schema.js
const { Model } = require('objection');

class SuperAdmin extends Model {
  static get tableName() {
    return 'super_admins';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
    };
  }
}

module.exports = SuperAdmin;
