import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * PANOPTIS Middleware — Everything is public.
 * Auth is optional and only gates user-specific features (saved views, alerts).
 */
export async function middleware(req: NextRequest) {
    // Just pass through. No redirects, no forced login.
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
