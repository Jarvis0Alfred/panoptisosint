import { PrismaClient } from "../generated/prisma/client";
import { createPrismaClient } from "@/core/adapters/db";

/**
 * Prisma client singleton.
 * Uses globalThis to survive Next.js HMR in development.
 */

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
