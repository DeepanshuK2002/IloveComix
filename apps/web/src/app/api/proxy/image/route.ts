import { NextRequest, NextResponse } from "next/server";

const MAX_REDIRECTS = 3;

const ALLOWED_HOST_SUFFIXES = [
  "mangadex.org",
  "mangadex.network",
  "desirescans.com",
  "comick.pictures",
  "comick.pics",
  "comick.app",
  "comick.io",
  "comick.dev",
  "comick.fun",
  "asuracomic.net",
  "asuracomics.com",
  "asurascans.com",
  "asura.gg",
  "luacomic.org",
  "wp.com",
  "b-cdn.net",
  "r2.dev",
  "googleusercontent.com",
  "cloudinary.com",
  "mangapill.com",
  "readdetectiveconan.com",
  "evascans.net",
  "compsci88.com",
  "planeptune.us",
];

function isAllowedUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }
    const host = url.hostname.toLowerCase();
    return ALLOWED_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith("." + suffix)
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");

  if (!urlParam) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  if (!isAllowedUrl(urlParam)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
  }

  try {
    // Fetch the image server-side
    let currentUrl = urlParam;
    let redirects = 0;
    let referer = "https://mangadex.org/";
    try {
      const h = new URL(currentUrl).hostname.toLowerCase();
      if (h.includes("desirescans")) referer = "https://desirescans.com/";
      else if (h.includes("comick")) referer = "https://comick.io/";
      else if (h.includes("asura")) referer = "https://asuracomic.net/";
      else if (h.includes("luacomic")) referer = "https://luacomic.org/";
      else if (h.includes("mangapill") || h.includes("readdetectiveconan"))
        referer = "https://mangapill.com/";
      else if (h.includes("evascans")) referer = "https://evascans.net/";
      else if (h.includes("compsci88") || h.includes("planeptune"))
        referer = "https://weebcentral.com/";
    } catch {}

    while (redirects <= MAX_REDIRECTS) {
      const response = await fetch(currentUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          Referer: referer,
        },
        cache: "force-cache",
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch image: ${response.status}` },
          { status: response.status }
        );
      }

      // Handle redirects
      const finalUrl = response.url;
      if (finalUrl !== currentUrl && response.redirected) {
        currentUrl = finalUrl;
        redirects++;
        continue;
      }

      // Get content type
      const contentType =
        response.headers.get("content-type") || "image/jpeg";

      // Get the image as array buffer
      const imageBuffer = await response.arrayBuffer();

      // Build response with permissive CORS headers
      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Cross-Origin-Resource-Policy": "cross-origin",
          "Cross-Origin-Embedder-Policy": "credentialless",
        },
      });
    }

    return NextResponse.json({ error: "Too many redirects" }, { status: 502 });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
