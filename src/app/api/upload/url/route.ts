import { NextResponse } from "next/server";
import { requireUser } from "@/lib/get-server-user";
import { createPresignedUploadUrl } from "@/lib/r2";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Security: ensure the filename is scoped to the user to prevent overwriting
    const secureFileName = `${user.uid}-${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const key = `profiles/${secureFileName}`;

    const url = await createPresignedUploadUrl(key, contentType);

    // Return the actual Cloudflare public URL structure so they can save it in DB later
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ uploadUrl: url, publicUrl });
  } catch (error: any) {
    console.error("Presigned URL error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
