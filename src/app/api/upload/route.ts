import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/get-server-user";
import { createPresignedUploadUrl } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const serverUser = await getServerUser();
    if (!serverUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, fileType, fileSize } = await req.json();

    // Enforce limits
    if (fileType.startsWith('image/') && fileSize > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (Max 10MB)" }, { status: 400 });
    }
    if (fileType.startsWith('video/') && fileSize > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "Video too large (Max 50MB)" }, { status: 400 });
    }

    const extension = fileName.split('.').pop();
    const key = `messages/${serverUser.uid}/${uuidv4()}.${extension}`;
    
    const uploadUrl = await createPresignedUploadUrl(key, fileType);
    
    return NextResponse.json({ uploadUrl, key });

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
