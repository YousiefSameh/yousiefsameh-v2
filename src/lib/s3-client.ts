import { S3Client } from "@aws-sdk/client-s3";

// Validate credentials before creating client
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES;

// S3 client configuration for Tigris
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
  forcePathStyle: true,
});

export const s3Config = {
  bucket: bucketName || "",
  region: process.env.AWS_S3_REGION || "auto",
  baseUrl: `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.t3.storage.dev`,
};