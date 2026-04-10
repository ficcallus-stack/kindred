"use server";

import { requireUser } from "@/lib/get-server-user";
import { uploadToR2 } from "@/lib/r2";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function uploadFile(formData: FormData) {
  const user = await requireUser();
  const file = formData.get("file") as File;
  
  if (!file) {
    throw new Error("No file provided");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // VULN-07 FIX: Whitelist MIME types
  const ALLOWED_TYPES = [
    'image/jpeg', 
    'image/png', 
    'image/webp', 
    'video/mp4', 
    'application/pdf', 
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed. Please upload an image, video, or document.`);
  }

  const fileName = `uploads/${user.uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const contentType = file.type;

  await uploadToR2(buffer, fileName, contentType);
  
  // Return the public URL or file name
  // Note: R2 URLs depend on your custom domain or the Cloudflare default unique subdomains.
  // For now, we'll return the R2 path and assume the frontend knows how to display it if needed.
  // Or we use a public R2 URL if configured.
  const r2Url = `${process.env.R2_PUBLIC_URL}/${fileName}`;
  
  return { url: r2Url, key: fileName };
}
