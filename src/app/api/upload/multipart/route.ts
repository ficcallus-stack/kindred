import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/get-server-user";
import { uploadToR2 } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 50MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split('.').pop();
    const fileName = `uploads/${user.uid}/${uuidv4()}.${extension}`;

    const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
    
    // Upload directly using Server SDK (bypasses browser CORS)
    await uploadToR2(buffer, fileName, file.type);
    
    const base = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl;
    return NextResponse.json({ publicUrl: `${base}/${fileName}`, key: fileName });

  } catch (error: any) {
    console.error("Multipart Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
