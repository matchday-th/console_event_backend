const Staff = require("../models/staff");
const bcrypt = require("bcrypt");

async function getStaffByProvider({ provider }) {
  const knex = Staff.knex();
  const tableName = "staff";

  const hasProviderId = await knex.schema.hasColumn(tableName, "provider_id");
  const hasStaff = await knex.schema.hasColumn(tableName, "staff");

  if (!hasProviderId && !hasStaff) {
    const err = new Error("No provider_id/staff column found in staff table");
    err.code = "PROVIDER_COLUMN_NOT_FOUND";
    throw err;
  }

  const providerColumn = hasProviderId ? "provider_id" : "staff";

  return await Staff.query().from(tableName).where(providerColumn, provider);
}

async function createStaff({ username, password, level, provider_id }) {
  const existingStaff = await Staff.query()
    .from("staff")
    .where("username", username)
    .first();

  if (existingStaff) {
    const err = new Error("username already exists");
    err.code = "USERNAME_EXISTS";
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    return await Staff.query()
      .from("staff")
      .insert({
        username,
        password: hashedPassword,
        level,
        fullname: username,
        provider_id,
      });
  } catch (err) {
    if (err && (err.code === "ER_DUP_ENTRY" || err.errno === 1062)) {
      const duplicateErr = new Error("username already exists");
      duplicateErr.code = "USERNAME_EXISTS";
      throw duplicateErr;
    }

    throw err;
  }
}

module.exports.staffService = {
  getStaffByProvider,
  createStaff,
};
