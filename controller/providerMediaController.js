const { providerMediaService } = require("../services/providerMediaService");

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

    return reply.send({
      facility_providers: facilityProviders,
      photos,
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

module.exports.providerMediaController = {
  getProviderMedia,
  createProviderPhoto,
  getFacilitiesList,
  createFacilityProvider,
};
