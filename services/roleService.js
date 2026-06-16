const { Model } = require("objection");

function mapRolePermissions(role, permissions) {
  return {
    id: role.id,
    name: role.name,
    permissions: permissions.map((permission) => ({
      feature_id: permission.feature_id,
      active: Boolean(permission.active),
    })),
  };
}

async function getDefaultPermissions(knex) {
  const rows = await knex("permissions")
    .distinct("feature_id")
    .whereNotNull("feature_id")
    .orderBy("feature_id", "asc");

  return rows.map((row) => ({
    feature_id: row.feature_id,
    active: false,
  }));
}

function mergeWithDefaultPermissions(permissions, defaultPermissions) {
  const permissionsByFeature = permissions.reduce((acc, permission) => {
    acc[permission.feature_id] = {
      feature_id: permission.feature_id,
      active: Boolean(permission.active),
    };

    return acc;
  }, {});

  return defaultPermissions.map((permission) => (
    permissionsByFeature[permission.feature_id] || permission
  ));
}

function buildPermissionRows({ roleId, permissions }) {
  return permissions.map((permission) => ({
    role_id: roleId,
    feature_id: permission.feature_id,
    active: permission.active ? 1 : 0,
    can_create: 0,
    can_read: 0,
    can_update: 0,
    can_delete: 0,
  }));
}

async function getRolesByProvider({ providerId }) {
  const knex = Model.knex();

  const roles = await knex("roles")
    .select("id", "name")
    .where("provider_id", providerId)
    .orderBy("id", "asc");

  if (!roles.length) {
    return [];
  }

  const roleIds = roles.map((role) => role.id);
  const permissions = await knex("permissions")
    .select("role_id", "feature_id", "active")
    .whereIn("role_id", roleIds)
    .orderBy("feature_id", "asc");
  const defaultPermissions = await getDefaultPermissions(knex);

  const permissionsByRole = permissions.reduce((acc, permission) => {
    if (!acc[permission.role_id]) {
      acc[permission.role_id] = [];
    }

    acc[permission.role_id].push({
      feature_id: permission.feature_id,
      active: Boolean(permission.active),
    });

    return acc;
  }, {});

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    permissions: mergeWithDefaultPermissions(
      permissionsByRole[role.id] || [],
      defaultPermissions
    ),
  }));
}

async function getRoleByProvider({ providerId, roleId, trx }) {
  const knex = trx || Model.knex();
  const role = await knex("roles")
    .select("id", "name")
    .where({ id: roleId, provider_id: providerId })
    .first();

  if (!role) {
    return null;
  }

  const permissions = await knex("permissions")
    .select("feature_id", "active")
    .where("role_id", role.id)
    .orderBy("feature_id", "asc");
  const defaultPermissions = await getDefaultPermissions(knex);

  return mapRolePermissions(role, mergeWithDefaultPermissions(permissions, defaultPermissions));
}

async function createRole({ providerId, name, permissions }) {
  const knex = Model.knex();

  return await knex.transaction(async (trx) => {
    const safePermissions = permissions.length ? permissions : await getDefaultPermissions(trx);
    const [roleId] = await trx("roles").insert({
      provider_id: providerId,
      name,
    });

    if (safePermissions.length) {
      await trx("permissions").insert(buildPermissionRows({ roleId, permissions: safePermissions }));
    }

    return await getRoleByProvider({ providerId, roleId, trx });
  });
}

async function updateRole({ providerId, roleId, name, permissions }) {
  const knex = Model.knex();

  return await knex.transaction(async (trx) => {
    const safePermissions = permissions.length ? permissions : await getDefaultPermissions(trx);
    const role = await trx("roles")
      .select("id")
      .where({ id: roleId, provider_id: providerId })
      .first();

    if (!role) {
      return null;
    }

    await trx("roles").where("id", roleId).update({ name });
    await trx("permissions").where("role_id", roleId).delete();

    if (safePermissions.length) {
      await trx("permissions").insert(buildPermissionRows({ roleId, permissions: safePermissions }));
    }

    return await getRoleByProvider({ providerId, roleId, trx });
  });
}

async function deleteRole({ providerId, roleId }) {
  const knex = Model.knex();

  return await knex.transaction(async (trx) => {
    const role = await trx("roles")
      .select("id")
      .where({ id: roleId, provider_id: providerId })
      .first();

    if (!role) {
      return false;
    }

    await trx("permissions").where("role_id", roleId).delete();
    await trx("roles").where("id", roleId).delete();

    return true;
  });
}

module.exports.roleService = {
  getRolesByProvider,
  createRole,
  updateRole,
  deleteRole,
};
