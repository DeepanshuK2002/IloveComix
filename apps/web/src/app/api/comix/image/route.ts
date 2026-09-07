import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function isRoutable(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local")) return false;
  if (
    host === "0.0.0.0" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.startsWith("169.254.") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    host.match(/^172\.(1[6-9]|2\d|3[01])\./)
  ) {
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "Missing required query parameter: url" }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return NextResponse.json({ error: "Only http(s) URLs are allowed" }, { status: 400 });
  }
  if (!isRoutable(url.hostname)) {
    return NextResponse.json({ error: "URL host is not allowed" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    let response: Response;
    try {
      response = await fetch(url.toString(), {
        headers: {
          "User-Agent": USER_AGENT,
          Referer: "https://comix.to/",
          Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
        },
        signal: controller.signal,
        cache: "force-cache",
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch image (${response.status})` }, { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "public, max-age=86400, immutable",
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? "Image proxy failed" : "Image proxy failed" },
      { status: 502 }
    );
  }
}