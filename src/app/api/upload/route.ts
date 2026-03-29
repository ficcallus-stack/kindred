import { NextResponse } from "next/server";
import { requireUser } from "@/lib/get-server-user";
import { uploadToR2 } from "@/lib/r2";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Safety check for critical environment variable
    if (!process.env.NEXT_PUBLIC_R2_PUBLIC_URL) {
      console.error("CRITICAL: NEXT_PUBLIC_R2_PUBLIC_URL is missing in .env.local");
      return NextResponse.json({ 
        error: "Server Configuration Error: NEX_PUBLIC_R2_PUBLIC_URL is missing. Please enable 'Public Development URL' in Cloudflare and add it to your .env.local." 
      }, { status: 500 });
    }

    // Scoped filename for security
    const secureFileName = `${user.uid}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const key = `profiles/${secureFileName}`;

    await uploadToR2(buffer, key, file.type);
    
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ publicUrl });
  } catch (error: any) {
    console.error("Direct upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file"}, { status: 500 });
  }
}
