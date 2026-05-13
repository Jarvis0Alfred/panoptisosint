import { headers } from "next/headers";

// Lazy-load Prisma to avoid build-time failures when generated client is missing.
// In PANOPTIS, we use JWT sessions (Google OAuth) — Prisma is only used for
// feature data like saved views, not auth.
let _prisma: any = null;

async function getPrismaClient() {
    if (_prisma) return _prisma;
    try {
        const { PrismaClient } = await import("../generated/prisma/client");
        const { PrismaPg } = await import("@prisma/adapter-pg");
        const { Pool } = await import("pg");
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error("DATABASE_URL not set");
        }
        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);
        const client = new PrismaClient({ adapter });
        _prisma = applyTenantIsolation(client);
        return _prisma;
    } catch (e) {
        console.error("[db] Prisma client unavailable:", e);
        throw new Error("Database not configured. Set DATABASE_URL or disable DB-dependent features.");
    }
}

function applyTenantIsolation(client: any) {
    return client.$extends({
        query: {
            $allModels: {
                async $allOperations({ model, operation, args, query }: any) {
                    let tenantSubdomain = null;
                    try {
                        const headersList = await headers();
                        tenantSubdomain = headersList.get("x-tenant-subdomain");
                    } catch (e) {
                        // Not in a request context
                    }
                    if (tenantSubdomain && model !== "Workspace" && model !== "WorkspaceMember") {
                        args = args || {};
                        if (["create", "createMany"].includes(operation)) {
                            if (Array.isArray(args.data)) {
                                args.data = args.data.map((d: any) => ({ ...d, tenantId: tenantSubdomain }));
                            } else if (args.data) {
                                args.data.tenantId = tenantSubdomain;
                            }
                        }
                        if (["update", "updateMany", "upsert"].includes(operation)) {
                            if (args.data) args.data.tenantId = tenantSubdomain;
                            if (args.create) args.create.tenantId = tenantSubdomain;
                            if (args.update) args.update.tenantId = tenantSubdomain;
                        }
                        if (["findUnique", "findFirst", "findMany", "update", "updateMany", "delete", "deleteMany", "count", "upsert"].includes(operation)) {
                            args.where = { ...(args.where || {}), tenantId: tenantSubdomain };
                        }
                        return query(args);
                    }
                    return query(args);
                },
            },
        },
    }) as any;
}

export const prisma = new Proxy({} as any, {
    get(_target, prop) {
        return async (...args: any[]) => {
            const client = await getPrismaClient();
            return (client as any)[prop](...args);
        };
    },
});
