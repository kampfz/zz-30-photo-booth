import { NextResponse, type NextRequest } from "next/server";

/**
 * Password-protects the /admin gallery with HTTP Basic auth.
 * Set ADMIN_PASSWORD in Vercel (Project Settings > Environment Variables). Any username works.
 * Without ADMIN_PASSWORD the gallery stays locked.
 */
export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return new NextResponse("Gallery is locked: set ADMIN_PASSWORD in Vercel and redeploy.", { status: 503 });
  }

  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const given = decoded.slice(decoded.indexOf(":") + 1);
      if (safeEqual(given, password)) return NextResponse.next();
    } catch {
      // Malformed header: fall through to the challenge.
    }
  }

  return new NextResponse("Password required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Photo booth gallery", charset="UTF-8"' },
  });
}

/** Compare without leaking how many characters matched. */
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
