import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) throw new Error("Failed to fetch page");

    const html = await response.text();

    const getMeta = (property: string) => {
      const regex = new RegExp(`<meta[^>]+(?:property|name)="${property}"[^>]+content="([^"]+)"|<meta[^>]+content="([^"]+)"[^>]+(?:property|name)="${property}"`, "i");
      const match = html.match(regex);
      return match ? (match[1] || match[2]) : null;
    };

    const title = getMeta("og:title") || html.match(/<title>([^<]+)<\/title>/i)?.[1] || "";
    const description = getMeta("og:description") || getMeta("description") || "";
    const image = getMeta("og:image") || "";

    return NextResponse.json({ title, description, image, url });
  } catch (error) {
    return NextResponse.json({ error: "Failed to scrape metadata" }, { status: 500 });
  }
}
