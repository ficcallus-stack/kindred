import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  throw new Error(
    "Missing R2 cloudflare credentials. Please establish R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in env variables."
  );
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string
) {
  if (!R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME is not defined");

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return fileName;
}

export async function getPresignedUrl(fileName: string) {
  if (!process.env.R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME is not defined");

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function createPresignedUploadUrl(fileName: string, contentType: string) {
  if (!process.env.R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME is not defined");

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    ContentType: contentType, // strictly enforce browser headers
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
