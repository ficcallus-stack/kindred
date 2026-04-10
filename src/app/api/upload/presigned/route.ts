import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/get-server-user";
import { createPresignedUploadUrl, getPublicR2Url } from "@/lib/r2";

export async function POST(req: Request) {
  try {
    const serverUser = await getServerUser();
    if (!serverUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, contentType } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json({ error: "Missing fileName or contentType" }, { status: 400 });
    }

    // Security: Only allow activities/ and children/ folder for now
    if (!fileName.startsWith("activities/") && !fileName.startsWith("children/")) {
       return NextResponse.json({ error: "Invalid upload path" }, { status: 403 });
    }

    const url = await createPresignedUploadUrl(fileName, contentType);
    const publicUrl = getPublicR2Url(fileName);
    
    return NextResponse.json({ url, publicUrl });

  } catch (error: any) {
    console.error("Presigned Upload API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
