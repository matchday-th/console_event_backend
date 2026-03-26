const { providerMediaService } = require("../services/providerMediaService");
const { promotionUserService } = require("../services/promotionUserService");

async function getProviderMedia(request, reply) {
  try {
    const { id } = request.params;

    if (!id) {
      return reply.status(400).send({ message: "Required ID", field: "id" });
    }

    const facilityProviders = await providerMediaService.getFacilityProviders({
      providerId: id,
    });
    const photos = await providerMediaService.getPhotosByProviderId({ providerId: id });
    const provider = await providerMediaService.getProviderLogosById({ providerId: id });
    const logos = provider ? provider : {};

    return reply.send({
      facility_providers: facilityProviders,
      photos,
      logos,
    });
  } catch (e) {
    console.log(e);
    return reply.status(500).send({
      message: "Try again !",
      field: "Internal Server Error",
    });
  }
}

async function createProviderPhoto(request, reply) {
  try {
    const { id } = request.params;

    if (!id) {
      return reply.status(400).send({ message: "Required ID", field: "id" });
    }

    let uploadedFiles = [];

    if (request.isMultipart && request.isMultipart()) {
      const sharp = require("sharp");
      const parts = request.parts();
      for await (const part of parts) {
        if (part.file) {
          const buffers = [];
          for await (const chunk of part.file) buffers.push(chunk);
          const buf = Buffer.concat(buffers);

          if (!part.mimetype || !part.mimetype.startsWith("image/")) {
            return reply
              .status(400)
              .send({ message: "Only image uploads are allowed", field: "file" });
          }

          const webpBuffer = await sharp(buf)
            .rotate()
            .webp({ quality: 80 })
            .toBuffer();

          const { uploadProviderMedia } = require("../services/s3Service");
          const safeBase = String(part.filename || "upload").replace(/\.[^/.]+$/, "");
          const filename = `${id}_${safeBase}.webp`;
          const upload = await uploadProviderMedia({
            filename,
            body: webpBuffer,
            contentType: "image/webp",
          });

          uploadedFiles.push({
            url: upload.url,
            name: filename,
            type: "image/webp",
            size: webpBuffer.length,
            status: "DONE",
          });
        }
      }

    } else {
      return reply.status(400).send({ message: "Multipart upload required" });
    }

    if (uploadedFiles.length === 0) {
      return reply.status(400).send({ message: "Required image file", field: "file" });
    }

    const createdPhotos = await providerMediaService.createProviderPhotos({
      providerId: id,
      images: uploadedFiles.map((file) => file.url),
    });

    return reply.send({
      message: "Provider photo created",
      files: uploadedFiles.length ? uploadedFiles : undefined,
      photos: createdPhotos,
    });
  } catch (e) {
    console.log(e);
    return reply.status(500).send({
      message: "Try again !",
      field: "Internal Server Error",
    });
  }
}

async function updateProviderLogo(request, reply) {
  try {
    const { id } = request.params;
    const allowedFields = ["logo", "logo_backup", "logo2", "logo2_backup"];

    if (!id) {
      return reply.status(400).send({ message: "Required ID", field: "id" });
    }

    if (!request.isMultipart || !request.isMultipart()) {
      return reply.status(400).send({ message: "Multipart upload required" });
    }

    let logoType;
    let uploadedFile;

    const sharp = require("sharp");
    const parts = request.parts();
    for await (const part of parts) {
      if (part.file) {
        if (uploadedFile) {
          return reply
            .status(400)
            .send({ message: "Only one image file is allowed", field: "file" });
        }

        const buffers = [];
        for await (const chunk of part.file) buffers.push(chunk);
        const buf = Buffer.concat(buffers);

        if (!part.mimetype || !part.mimetype.startsWith("image/")) {
          return reply
            .status(400)
            .send({ message: "Only image uploads are allowed", field: "file" });
        }

        uploadedFile = {
          buffer: buf,
          filename: part.filename || "logo",
        };
      } else if (part.fieldname === "logo_type") {
        logoType = String(part.value || "").trim();
      }
    }

    if (!logoType || !allowedFields.includes(logoType)) {
      return reply.status(400).send({
        message: "Invalid logo_type",
        field: "logo_type",
        allowed: allowedFields,
      });
    }

    if (!uploadedFile) {
      return reply.status(400).send({ message: "Required image file", field: "file" });
    }

    const webpBuffer = await sharp(uploadedFile.buffer)
      .rotate()
      .webp({ quality: 80 })
      .toBuffer();

    const { uploadProviderMedia } = require("../services/s3Service");
    const safeBase = String(uploadedFile.filename).replace(/\.[^/.]+$/, "");
    const filename = `${id}_${logoType}_${safeBase}.webp`;
    const upload = await uploadProviderMedia({
      filename,
      body: webpBuffer,
      contentType: "image/webp",
    });

    const logos = await providerMediaService.updateProviderLogo({
      providerId: id,
      logoType,
      url: upload.url,
    });

    if (!logos) {
      return reply.status(404).send({ message: "Provider not found", field: "id" });
    }

    return reply.send({
      message: "Provider logo updated",
      logos,
    });
  } catch (e) {
    console.log(e);
    return reply.status(500).send({
      message: "Try again !",
      field: "Internal Server Error",
    });
  }
}

async function getFacilitiesList(request, reply) {
  try {
    const facilities = await providerMediaService.getFacilities();
    return reply.send( facilities );
  } catch (e) {
    console.log(e);
    return reply.status(500).send({
      message: "Try again !",
      field: "Internal Server Error",
    });
  }
}

async function createFacilityProvider(request, reply) {
  try {
    const payload = request.body;

    const items = Array.isArray(payload) ? payload : [payload];
    if (!items.length) {
      return reply.status(400).send({ message: "Required facility providers array" });
    }

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i] || {};
      if (!item.provider_id) {
        return reply
          .status(400)
          .send({ message: "Required provider_id", field: "provider_id", index: i });
      }
      if (!item.facility_id) {
        return reply
          .status(400)
          .send({ message: "Required facility_id", field: "facility_id", index: i });
      }
    }

    const created = await providerMediaService.createFacilityProviders({
      items,
    });
    return reply.send({ data: created });
  } catch (e) {
    console.log(e);
    return reply.status(500).send({
      message: "Try again !",
      field: "Internal Server Error",
    });
  }
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function parseOptionalBoolInt(value) {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === true || value === false) return value ? 1 : 0;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes"].includes(normalized)) return 1;
  if (["0", "false", "no"].includes(normalized)) return 0;
  return undefined;
}

async function getPromotionUsersIndex(request, reply) {
  try {
    const query = request.query || {};
    const page = parsePositiveInt(query.page, 1);
    const pageSize = parsePositiveInt(query.page_size, 20);
    const matchCancelled = parseOptionalBoolInt(query.match_cancelled);
    const matchDeleted = parseOptionalBoolInt(query.match_deleted);
    const createdFrom = query.created_from;
    const createdTo = query.created_to;

    const { results, total } = await promotionUserService.getPromotionUsersIndex({
      page,
      pageSize,
      promoname: query.promoname,
      providerId: query.provider_id,
      matchCancelled,
      matchDeleted,
      createdFrom,
      createdTo,
    });

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return reply.send({
      data: results,
      meta: {
        page,
        page_size: pageSize,
        total,
        total_pages: totalPages,
      },
    });
  } catch (e) {
    console.log(e);
    return reply.status(500).send({
      message: "Try again !",
      field: "Internal Server Error",
    });
  }
}

module.exports.providerMediaController = {
  getProviderMedia,
  createProviderPhoto,
  updateProviderLogo,
  getFacilitiesList,
  createFacilityProvider,
  getPromotionUsersIndex,
};
