import { NextResponse } from "next/server";

/**
 * Generic external API proxy.
 * Forwards GET/POST requests to arbitrary URLs to bypass CORS.
 * Only allows safe HTTP(S) destinations.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("url");
    if (!target) return NextResponse.json({ error: "Missing url param" }, { status: 400 });

    return proxyRequest(target, "GET", undefined, req.headers);
}

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("url");
    if (!target) return NextResponse.json({ error: "Missing url param" }, { status: 400 });

    const body = await req.text();
    return proxyRequest(target, "POST", body, req.headers);
}

async function proxyRequest(
    target: string,
    method: string,
    body: string | undefined,
    incomingHeaders: Headers
) {
    // Safety: only allow http/https
    const url = new URL(target);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
    }

    try {
        const headers = new Headers();
        headers.set("User-Agent", incomingHeaders.get("user-agent") || "WorldWideView/1.0");
        const contentType = incomingHeaders.get("content-type");
        if (contentType) headers.set("Content-Type", contentType);

        const res = await fetch(target, {
            method,
            headers,
            body,
            // Next.js fetch handles this server-side, no CORS issues
        });

        const data = await res.arrayBuffer();
        const response = new NextResponse(data, {
            status: res.status,
            statusText: res.statusText,
        });

        // Forward content-type if present
        const ct = res.headers.get("content-type");
        if (ct) response.headers.set("Content-Type", ct);

        return response;
    } catch (err: any) {
        console.error(`[Proxy] Failed to fetch ${target}:`, err);
        return NextResponse.json(
            { error: "Proxy fetch failed", details: err.message },
            { status: 502 }
        );
    }
}
