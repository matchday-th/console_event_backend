const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

let s3Client;

function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_KEY,
        secretAccessKey: process.env.S3_SECRET,
      },
    });
  }
  return s3Client;
}

function buildS3Url({ bucket, region, key }) {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

async function uploadProviderMedia({ filename, body, contentType }) {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION;

  if (!bucket || !region) {
    throw new Error("S3_BUCKET and S3_REGION are required");
  }

  const key = `provider-media/${filename}`;
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return {
    key,
    url: buildS3Url({ bucket, region, key }),
  };
}

module.exports = {
  uploadProviderMedia,
};
