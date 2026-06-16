const { staffService } = require("../services/staffService");

async function getStaffByProvider(request, reply) {
  try {
    const { provider } = request.params;

    if (provider === undefined || provider === null || String(provider).trim() === "") {
      return reply.code(400).send({ message: "provider is required", field: "provider" });
    }

    const result = await staffService.getStaffByProvider({ provider });

    return reply.send({ data: result });
  } catch (err) {
    console.log(err);

    if (err.code === "PROVIDER_COLUMN_NOT_FOUND") {
      return reply.code(500).send({ message: "provider_id/staff column not found in staff table" });
    }

    return reply.code(500).send({ message: "Something went wrong!" });
  }
}

async function createStaff(request, reply) {
  try {
    const { username, password, level, provider_id } = request.body || {};

    if (username === undefined || username === null || String(username).trim() === "") {
      return reply.code(400).send({ message: "username is required", field: "username" });
    }

    if (password === undefined || password === null || String(password).trim() === "") {
      return reply.code(400).send({ message: "password is required", field: "password" });
    }

    if (level === undefined || level === null || String(level).trim() === "") {
      return reply.code(400).send({ message: "level is required", field: "level" });
    }

    if (provider_id === undefined || provider_id === null || String(provider_id).trim() === "") {
      return reply.code(400).send({ message: "provider_id is required", field: "provider_id" });
    }

    const result = await staffService.createStaff({ username, password, level, provider_id });

    return reply.code(201).send({ data: result });
  } catch (err) {
    console.log(err);
    if (err.code === "USERNAME_EXISTS") {
      return reply.code(409).send({ message: "username already exists", field: "username" });
    }
    return reply.code(500).send({ message: "Something went wrong!" });
  }
}

async function updateStaffRole(request, reply) {
  try {
    const staffId = Number.parseInt(request.params.id, 10);
    const body = request.body || {};

    if (Number.isNaN(staffId) || staffId <= 0) {
      return reply.code(400).send({ message: "Valid staff id is required", field: "id" });
    }

    if (!Object.prototype.hasOwnProperty.call(body, "role_id")) {
      return reply.code(400).send({ message: "role_id is required", field: "role_id" });
    }

    let roleId = null;
    if (body.role_id !== null && body.role_id !== undefined && body.role_id !== "") {
      roleId = Number.parseInt(body.role_id, 10);

      if (Number.isNaN(roleId) || roleId <= 0) {
        return reply.code(400).send({ message: "Valid role_id is required", field: "role_id" });
      }
    }

    const result = await staffService.updateStaffRole({ staffId, roleId });

    if (!result) {
      return reply.code(404).send({ message: "Staff not found", field: "id" });
    }

    return reply.send({ data: result });
  } catch (err) {
    console.log(err);
    if (err.code === "ROLE_NOT_FOUND") {
      return reply.code(404).send({ message: "Role not found", field: "role_id" });
    }
    return reply.code(500).send({ message: "Something went wrong!" });
  }
}

module.exports.staffController = {
  getStaffByProvider,
  createStaff,
  updateStaffRole,
};
