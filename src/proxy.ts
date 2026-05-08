import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isDemo } from "@/core/edition";

/**
 * Route protection proxy.
 * - /setup, /login, /api/* → public
 * - Everything else → requires valid JWT session
 * - If no users exist → redirect to /setup
 * - Demo edition → everything is public (no login required)
 */
export default async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;
    
    // Extract subdomain if on cloud
    const hostname = req.headers.get("host") || "";
    let tenantSubdomain = null;
    if (process.env.NEXT_PUBLIC_WWV_EDITION === "cloud") {
        const isApp = hostname.includes(".app.worldwideview.dev") || hostname.includes(".localhost");
        if (isApp) {
            const subdomain = hostname.replace(".app.worldwideview.dev", "").replace(".localhost", "").split(":")[0];
            if (subdomain && subdomain !== "app" && subdomain !== "localhost") {
                tenantSubdomain = subdomain;
            }
        }
    }

    // Demo edition: fully public, no auth required
    if (isDemo) {
        const res = NextResponse.next();
        if (tenantSubdomain) res.headers.set("x-tenant-subdomain", tenantSubdomain);
        return res;
    }

    // Static assets, API routes, data files — always pass through
    if (
        path.startsWith("/_next") ||
        path.startsWith("/api") ||
        path.startsWith("/data") ||
        path.startsWith("/cesium") ||
        path.includes(".")
    ) {
        const res = NextResponse.next();
        if (tenantSubdomain) res.headers.set("x-tenant-subdomain", tenantSubdomain);
        return res;
    }

    // Auth pages — always accessible
    if (path.startsWith("/setup") || path.startsWith("/login")) {
        const res = NextResponse.next();
        if (tenantSubdomain) res.headers.set("x-tenant-subdomain", tenantSubdomain);
        return res;
    }

    // Check JWT session from Auth.js cookie
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
    });

    if (token) {
        // User is logged in — allow through
        const res = NextResponse.next();
        if (tenantSubdomain) res.headers.set("x-tenant-subdomain", tenantSubdomain);
        return res;
    }

    // Not logged in — check if first-run (no users)
    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || `http://127.0.0.1:${process.env.PORT || "3000"}`;
        const url = new URL("/api/auth/setup-status", appUrl);
        const res = await fetch(url.toString(), {
            headers: {
                "User-Agent": "WorldWideView-Middleware",
            }
        });
        const data = await res.json();
        if (data.needsSetup) {
            return NextResponse.redirect(new URL("/setup", req.nextUrl)); // NextResponse.redirect correctly bounds redirect to client
        }
    } catch (e) {
        // Fall through to login redirect
        console.error("[proxy.ts] Failed to fetch setup status:", e);
    }

    return NextResponse.redirect(new URL("/login", req.nextUrl));
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

