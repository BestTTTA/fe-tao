// app/api/proxy-image/route.ts
// โหลดรูปฝั่ง server เพื่อเลี่ยงปัญหา CORS เวลา draw ลง canvas
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return NextResponse.json({ error: "invalid protocol" }, { status: 400 });
  }

  try {
    const res = await fetch(target.toString(), {
      headers: {
        // some CDNs (e.g. facebook) require a user agent
        "User-Agent":
          "Mozilla/5.0 (compatible; TaoProxy/1.0; +https://tao.app)",
      },
      // cache 1 ชั่วโมง
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `upstream ${res.status}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!ALLOWED_CONTENT_TYPES.some((t) => contentType.startsWith(t))) {
      return NextResponse.json(
        { error: "unsupported content type" },
        { status: 415 }
      );
    }

    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[proxy-image] error:", err);
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
