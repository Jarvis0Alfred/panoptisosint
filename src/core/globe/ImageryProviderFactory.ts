import {
    IonImageryProvider,
    OpenStreetMapImageryProvider,
    ArcGisMapServerImageryProvider,
    UrlTemplateImageryProvider,
} from "cesium";

export interface ImageryLayerEntry {
    id: string;
    name: string;
    description: string;
    thumbnail?: string;
    type: "google-3d" | "imagery";
}

export const IMAGERY_LAYERS: ImageryLayerEntry[] = [
    {
        id: "google-3d",
        name: "Google Maps 3D",
        description: "Photorealistic 3D Tiles",
        type: "google-3d",
    },
    {
        id: "azure-aerial",
        name: "Azure Maps Satellite",
        description: "High-resolution satellite imagery via Azure Maps",
        type: "imagery",
    },
    {
        id: "azure-hybrid",
        name: "Azure Maps Hybrid",
        description: "Satellite with road labels via Azure Maps",
        type: "imagery",
    },
    {
        id: "azure-road",
        name: "Azure Maps Roads",
        description: "Standard road map via Azure Maps",
        type: "imagery",
    },
    {
        id: "osm",
        name: "OpenStreetMap",
        description: "Community-driven map data",
        type: "imagery",
    },
    {
        id: "arcgis-world",
        name: "ArcGIS World Imagery",
        description: "Esri satellite tiles",
        type: "imagery",
    },
    {
        id: "blue-marble",
        name: "Blue Marble",
        description: "NASA Earth imagery",
        type: "imagery",
    }
];

export async function createImageryProvider(layerId: string) {
    const azureMapsKey = process.env.NEXT_PUBLIC_AZURE_MAPS_KEY || process.env.AZURE_MAPS_KEY;

    switch (layerId) {
        case "azure-aerial":
            if (azureMapsKey) {
                return new UrlTemplateImageryProvider({
                    url: `https://atlas.microsoft.com/map/tile?api-version=2.0&tilesetId=microsoft.imagery&zoom={z}&x={x}&y={y}&subscription-key=${azureMapsKey}`,
                    tileWidth: 256,
                    tileHeight: 256,
                });
            }
            return await IonImageryProvider.fromAssetId(2);

        case "azure-hybrid":
            if (azureMapsKey) {
                return new UrlTemplateImageryProvider({
                    url: `https://atlas.microsoft.com/map/tile?api-version=2.0&tilesetId=microsoft.base.hybrid.road&zoom={z}&x={x}&y={y}&subscription-key=${azureMapsKey}`,
                    tileWidth: 256,
                    tileHeight: 256,
                });
            }
            return await IonImageryProvider.fromAssetId(3);

        case "azure-road":
            if (azureMapsKey) {
                return new UrlTemplateImageryProvider({
                    url: `https://atlas.microsoft.com/map/tile?api-version=2.0&tilesetId=microsoft.base.road&zoom={z}&x={x}&y={y}&subscription-key=${azureMapsKey}`,
                    tileWidth: 256,
                    tileHeight: 256,
                });
            }
            return await IonImageryProvider.fromAssetId(4);

        // Legacy bing-* IDs redirect to azure-* for backwards compatibility
        case "bing-aerial":
        case "bing-labels":
        case "bing-road":
            console.warn(`[ImageryProvider] Bing Maps is deprecated. Redirecting ${layerId} to Azure Maps.`);
            return createImageryProvider(layerId.replace("bing-", "azure-"));

        case "osm":
            return new UrlTemplateImageryProvider({
                url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                subdomains: ["a", "b", "c"]
            });

        case "arcgis-world":
            return await ArcGisMapServerImageryProvider.fromUrl(
                "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
            );

        case "blue-marble":
            return await IonImageryProvider.fromAssetId(3845);

        default:
            return new UrlTemplateImageryProvider({
                url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                subdomains: ["a", "b", "c"]
            });
    }
}
