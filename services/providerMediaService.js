const Providers = require("../models/providers");
const Facilities = require("../models/facilities");
const FacilityProviders = require("../models/facilityProviders");
const Photos = require("../models/photos");

async function getFacilityProviders({ providerId } = {}) {
  if (!providerId) {
    throw new Error("providerId is required");
  }

  return await FacilityProviders.query()
    .select("*")
    .where("provider_id", providerId);
}

async function getFacilities() {
  return await Facilities.query()
    .select("*");
}

async function getPhotosByProviderId({ providerId }) {
  if (!providerId) {
    throw new Error("providerId is required");
  }

  return await Photos.query()
    .select("*")
    .where("provider_id", providerId)
    .orderBy("id", "asc");
}

async function createProviderPhotos({ providerId, images }) {
  const rows = (images || []).map((image) => ({
    provider_id: providerId,
    image,
  }));

  if (!rows.length) {
    return [];
  }

  return await Photos.query().insert(rows);
}

async function getTableList() {
  const knex = Providers.knex();
  if (!knex) {
    throw new Error("Database connection is not initialized");
  }

  const result = await knex.raw("SHOW TABLES");
  const rows = Array.isArray(result) ? result[0] : result;
  return (rows || [])
    .map((row) => {
      const value = row && typeof row === "object" ? Object.values(row)[0] : null;
      return value ?? row;
    })
    .filter((name) => !!name);
}

async function createFacilityProviders({ items }) {
  const rows = (items || []).map((item) => {
    const row = {
      provider_id: item.provider_id,
      facility_id: item.facility_id,
    };
    if (item.detail !== undefined) {
      row.detail = item.detail;
    }
    return row;
  });

  if (!rows.length) {
    return [];
  }

  return await FacilityProviders.query().insert(rows);
}

module.exports.providerMediaService = {
  getFacilityProviders,
  getFacilities,
  getPhotosByProviderId,
  getTableList,
  createFacilityProviders,
  createProviderPhotos,
};
