"use server";

import { requireUser } from "@/lib/get-server-user";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function getReviewUploadUrl(fileName: string, contentType: string) {
  const user = await requireUser();
  if (!user) throw new Error("Unauthorized");

  const key = `reviews/${user.uid}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  
  // Standard public R2 domain, adjust if custom domain is used
  const publicUrl = `https://pub-92632c3d4d50bbf38a0739cf21324811.r2.dev/${key}`;

  return { uploadUrl, publicUrl };
}
