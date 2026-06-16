const { roleService } = require("../services/roleService");

function parsePositiveId(value, field) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    const err = new Error(`Valid ${field} is required`);
    err.code = "VALIDATION_ERROR";
    err.field = field;
    throw err;
  }

  return parsed;
}

function parseActive(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;

  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "yes"].includes(normalized);
}

function parseRolePayload(body = {}) {
  const payload = body.data && typeof body.data === "object" ? body.data : body;
  const name = String(payload.name || "").trim();

  if (!name) {
    const err = new Error("name is required");
    err.code = "VALIDATION_ERROR";
    err.field = "name";
    throw err;
  }

  if (payload.permissions === undefined || payload.permissions === null) {
    return { name, permissions: [] };
  }

  if (!Array.isArray(payload.permissions)) {
    const err = new Error("permissions must be an array");
    err.code = "VALIDATION_ERROR";
    err.field = "permissions";
    throw err;
  }

  const permissions = payload.permissions.map((permission, index) => {
    const featureId = String(permission && permission.feature_id ? permission.feature_id : "").trim();

    if (!featureId) {
      const err = new Error("permission feature_id is required");
      err.code = "VALIDATION_ERROR";
      err.field = `permissions.${index}.feature_id`;
      throw err;
    }

    return {
      feature_id: featureId,
      active: parseActive(permission.active),
    };
  });

  return { name, permissions };
}

async function getRolesByProvider(request, reply) {
  try {
    const providerId = parsePositiveId(request.params.id, "id");

    const roles = await roleService.getRolesByProvider({ providerId });

    return reply.send(roles);
  } catch (err) {
    console.log(err);
    if (err.code === "VALIDATION_ERROR") {
      return reply.code(400).send({ message: err.message, field: err.field });
    }
    return reply.code(500).send({ message: "Something went wrong!" });
  }
}

async function createRole(request, reply) {
  try {
    const providerId = parsePositiveId(request.params.id, "id");
    const payload = parseRolePayload(request.body || {});

    const role = await roleService.createRole({ providerId, ...payload });

    return reply.code(201).send(role);
  } catch (err) {
    console.log(err);
    if (err.code === "VALIDATION_ERROR") {
      return reply.code(400).send({ message: err.message, field: err.field });
    }
    return reply.code(500).send({ message: "Something went wrong!" });
  }
}

async function updateRole(request, reply) {
  try {
    const providerId = parsePositiveId(request.params.id, "id");
    const roleId = parsePositiveId(request.params.roleId, "roleId");
    const payload = parseRolePayload(request.body || {});

    const role = await roleService.updateRole({ providerId, roleId, ...payload });

    if (!role) {
      return reply.code(404).send({ message: "Role not found", field: "roleId" });
    }

    return reply.send(role);
  } catch (err) {
    console.log(err);
    if (err.code === "VALIDATION_ERROR") {
      return reply.code(400).send({ message: err.message, field: err.field });
    }
    return reply.code(500).send({ message: "Something went wrong!" });
  }
}

async function deleteRole(request, reply) {
  try {
    const providerId = parsePositiveId(request.params.id, "id");
    const roleId = parsePositiveId(request.params.roleId, "roleId");

    const deleted = await roleService.deleteRole({ providerId, roleId });

    if (!deleted) {
      return reply.code(404).send({ message: "Role not found", field: "roleId" });
    }

    return reply.send({ message: "Role deleted" });
  } catch (err) {
    console.log(err);
    if (err.code === "VALIDATION_ERROR") {
      return reply.code(400).send({ message: err.message, field: err.field });
    }
    return reply.code(500).send({ message: "Something went wrong!" });
  }
}

module.exports.roleController = {
  getRolesByProvider,
  createRole,
  updateRole,
  deleteRole,
};
