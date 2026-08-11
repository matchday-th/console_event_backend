const Providers = require("../models/providers");
const Facilities = require("../models/facilities");
const FacilityProviders = require("../models/facilityProviders");
const Photos = require("../models/photos");
const Court = require("../models/court");
const CourtType = require("../models/courtType");
const ProviderSetting = require("../models/providerSetting");

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

async function getProviderLogosById({ providerId }) {
  if (!providerId) {
    throw new Error("providerId is required");
  }

  return await Providers.query()
    .select('logo', "logo2","logo_backup", "logo2_backup", "liff_logo", "liff_bg_url")
    .where("id", providerId)
    .first();
}

async function getProviderLiffMediaById({ providerId }) {
  if (!providerId) {
    throw new Error("providerId is required");
  }

  return await Providers.query()
    .select("liff_logo", "liff_bg_url")
    .where("id", providerId)
    .first();
}

async function getProviderById({ providerId }) {
  if (!providerId) {
    throw new Error("providerId is required");
  }

  return await Providers.query()
    .where("id", providerId)
    .first();
}

async function updateProviderLogo({ providerId, logoType, url }) {
  if (!providerId) {
    throw new Error("providerId is required");
  }
  if (!logoType) {
    throw new Error("logoType is required");
  }

  const updated = await Providers.query()
    .patch({ [logoType]: url })
    .where("id", providerId);

  if (!updated) {
    return null;
  }

  return await getProviderLogosById({ providerId });
}

async function updateProviderLiffMedia({ providerId, field, url }) {
  if (!providerId) {
    throw new Error("providerId is required");
  }
  if (!field) {
    throw new Error("field is required");
  }

  const updated = await Providers.query()
    .patch({ [field]: url })
    .where("id", providerId);

  if (!updated) {
    return null;
  }

  return await getProviderLiffMediaById({ providerId });
}

async function updateProviderFields({ providerId, patch }) {
  if (!providerId) {
    throw new Error("providerId is required");
  }
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    throw new Error("patch is required");
  }

  const updated = await Providers.query().patchAndFetchById(providerId, patch);
  return updated || null;
}

async function updateCourtFields({ courtId, patch }) {
  if (!courtId) {
    throw new Error("courtId is required");
  }
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    throw new Error("patch is required");
  }

  const updated = await Court.query().patchAndFetchById(courtId, patch);
  return updated || null;
}

async function getCourtTypeById({ courtTypeId }) {
  if (!courtTypeId) {
    throw new Error("courtTypeId is required");
  }

  return await CourtType.query()
    .where("id", courtTypeId)
    .first();
}

async function updateCourtTypeFields({ courtTypeId, patch }) {
  if (!courtTypeId) {
    throw new Error("courtTypeId is required");
  }
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    throw new Error("patch is required");
  }

  const updated = await CourtType.query().patchAndFetchById(courtTypeId, patch);
  return updated || null;
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

async function getCourtTypesByProviderId({ providerId }) {
  if (!providerId) {
    throw new Error("providerId is required");
  }

  return await CourtType.query()
    .select("court_types.*")
    .joinRelated("provider_sport")
    .where("provider_sport.provider_id", providerId)
    .withGraphFetched("courts");
}

async function getCourtOrdersByProviderId({ providerId }) {
  if (!providerId) {
    throw new Error("providerId is required");
  }

  const setting = await ProviderSetting.query()
    .select("court_orders")
    .where("provider_id", providerId)
    .first();

  return setting ? setting.court_orders : null;
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

  const knex = FacilityProviders.knex && FacilityProviders.knex();
  const client = knex && knex.client && knex.client.config && knex.client.config.client;
  const usePerRow =
    rows.length > 1 && ["mysql", "mysql2", "sqlite3", "better-sqlite3"].includes(client);

  if (usePerRow) {
    return await FacilityProviders.transaction(async (trx) => {
      const created = [];
      for (const row of rows) {
        const inserted = await FacilityProviders.query(trx).insertAndFetch(row);
        created.push(inserted);
      }
      return created;
    });
  }

  const result = await FacilityProviders.query().insert(rows);
  return Array.isArray(result) ? result : [result];
}

module.exports.providerMediaService = {
  getFacilityProviders,
  getFacilities,
  getPhotosByProviderId,
  getProviderLogosById,
  getProviderById,
  getCourtTypesByProviderId,
  getCourtOrdersByProviderId,
  getCourtTypeById,
  updateProviderLogo,
  updateProviderLiffMedia,
  updateProviderFields,
  updateCourtFields,
  updateCourtTypeFields,
  getTableList,
  createFacilityProviders,
  createProviderPhotos,
};
