import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    const plugins = await prisma.installedPlugin.findMany();
    console.log("Installed plugins:");
    plugins.forEach((p) => console.log(`  ${p.pluginId} | config: ${p.config.substring(0, 60)}`));

    const geojson = plugins.find((p) => p.pluginId === "geojson");
    if (geojson) {
        await prisma.installedPlugin.delete({ where: { id: geojson.id } });
        console.log("\nDeleted orphaned 'geojson' record.");
    } else {
        console.log("\nNo orphaned 'geojson' record found.");
    }

    const remaining = await prisma.installedPlugin.findMany();
    console.log("\nRemaining plugins:");
    remaining.forEach((p) => console.log(`  ${p.pluginId}`));

    await prisma.$disconnect();
}

main().catch(console.error);
