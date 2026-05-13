import { prisma } from "../db";
import { isDemo } from "@/core/edition";
import { DEFAULT_PLUGIN_IDS } from "./defaultPlugins";
import { upsertPlugin } from "./repository";
import { validateManifest } from "@/core/plugins/validateManifest";
import type { PluginManifest } from "@/core/plugins/PluginManifest";

/**
 * Seed default marketplace plugins on a fresh install.
 *
 * Runs once per instance lifecycle — an idempotent guard
 * (`defaults_seeded` in the Setting table) prevents re-runs.
 *
 * Like the "sample data" that ships with a new app: the seeder
 * writes records to the database on first boot, then never runs again.
 *
 * Errors are logged but never thrown — a failed seed must never
 * block the application from starting.
 */
/**
 * Seed default marketplace plugins on a fresh install.
 *
 * Runs once per instance lifecycle — an idempotent guard
 * (`defaults_seeded` in the Setting table) prevents re-runs.
 *
 * Uses LOCAL manifest generation instead of external marketplace
 * so PANOPTIS works fully offline / self-hosted.
 *
 * Errors are logged but never thrown — a failed seed must never
 * block the application from starting.
 */
export async function seedDefaultPlugins(): Promise<void> {
    try {
        // Demo has its own mechanism (NEXT_PUBLIC_DEMO_DEFAULT_PLUGINS)
        if (isDemo) return;

        // Opt-out for power users deploying fresh instances
        if (process.env.WWV_SKIP_DEFAULT_PLUGINS === "true") {
            await markSeeded();
            return;
        }

        // Idempotent guard — already seeded?
        const guard = await prisma.setting.findFirst({
            where: { key: "defaults_seeded" },
        });
        if (guard) return;

        // Not truly fresh if plugins already exist
        const existing = await prisma.installedPlugin.count();
        if (existing > 0) {
            await markSeeded();
            return;
        }

        console.log(
            `[DefaultPlugins] Fresh install detected — seeding ${DEFAULT_PLUGIN_IDS.length} default plugins locally…`,
        );

        let installed = 0;

        for (const pluginId of DEFAULT_PLUGIN_IDS) {
            try {
                const manifest = buildLocalManifest(pluginId);
                if (!manifest) {
                    console.warn(`[DefaultPlugins] No local manifest for ${pluginId}, skipping.`);
                    continue;
                }

                const validation = validateManifest(manifest);
                if (!validation.valid) {
                    console.warn(
                        `[DefaultPlugins] Skipping ${pluginId}: ${validation.errors.join(", ")}`,
                    );
                    continue;
                }

                await upsertPlugin(
                    pluginId,
                    manifest.version || "1.0.0",
                    JSON.stringify(manifest),
                );
                installed++;
                console.log(`[DefaultPlugins] Seeded ${pluginId}`);
            } catch (err) {
                console.warn(
                    `[DefaultPlugins] Failed to seed ${pluginId}:`,
                    err,
                );
            }
        }

        await markSeeded();
        console.log(
            `[DefaultPlugins] Seeded ${installed}/${DEFAULT_PLUGIN_IDS.length} plugins`,
        );
    } catch (err) {
        console.error("[DefaultPlugins] Seeder failed:", err);
        // Never throw — seeding failure must not block the app
    }
}

/** Write the idempotent guard row. */
async function markSeeded(): Promise<void> {
    const existing = await prisma.setting.findFirst({ where: { key: "defaults_seeded" } });
    if (existing) {
        await prisma.setting.updateMany({
            where: { key: "defaults_seeded" },
            data: { value: "true" },
        });
    } else {
        await prisma.setting.create({
            data: { key: "defaults_seeded", value: "true" },
        });
    }
}

/**
 * Build a minimal local manifest for a plugin.
 * This removes dependency on the external marketplace.
 */
function buildLocalManifest(pluginId: string): PluginManifest | null {
    const manifests: Record<string, Partial<PluginManifest>> = {
        aviation: { name: "Aviation", description: "Live aircraft tracking", format: "declarative" },
        maritime: { name: "Maritime", description: "Ship tracking via AIS", format: "declarative" },
        "military-aviation": { name: "Military Aviation", description: "Military aircraft tracking", format: "declarative" },
        wildfire: { name: "Wildfires", description: "Global wildfire monitoring", format: "declarative" },
        camera: { name: "Cameras", description: "Public camera feeds", format: "static" },
        borders: { name: "Borders", description: "Country borders", format: "static" },
        "osm-search": { name: "OSM Search", description: "OpenStreetMap search", format: "declarative" },
        earthquakes: { name: "Earthquakes", description: "Seismic activity", format: "declarative" },
        satellite: { name: "Satellites", description: "Orbital satellite tracking", format: "declarative" },
        daynight: { name: "Day/Night", description: "Day/night terminator", format: "static" },
        "conflict-zones": { name: "Conflict Zones", description: "Active conflict monitoring", format: "static" },
        volcanoes: { name: "Volcanoes", description: "Volcanic activity", format: "declarative" },
        airports: { name: "Airports", description: "Global airports", format: "static" },
        "international-sanctions": { name: "Sanctions", description: "International sanctions data", format: "static" },
        "gps-jamming": { name: "GPS Jamming", description: "GPS interference detection", format: "declarative" },
        fortiguard: { name: "FortiGuard", description: "Threat intelligence", format: "declarative" },
        "nz-traffic-cameras": { name: "Traffic Cameras", description: "NZ traffic cameras", format: "static" },
    };

    const base = manifests[pluginId];
    if (!base) return null;

    return {
        id: pluginId,
        name: base.name || pluginId,
        version: "1.0.0",
        description: base.description || `${pluginId} data layer`,
        trust: "verified",
        format: (base.format as any) || "declarative",
        entry: `/api/plugins/${pluginId}`,
        type: "data-layer",
        capabilities: ["data:own", "ui:detail-panel", "globe:overlay"],
        category: "intelligence",
    } as PluginManifest;
}
