import fs from "fs";
import path from "path";
import { createServer } from "vite";
import { WebSocketServer } from "ws";

export async function startDevServer(targetUrl: string = "http://localhost:3000") {
    const cwd = process.cwd();
    const manifestPath = path.join(cwd, "wwv-manifest.json");
    
    if (!fs.existsSync(manifestPath)) {
        throw new Error("No wwv-manifest.json found in current directory");
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const port = 24601;

    // Start Vite Dev Server
    const vite = await createServer({
        root: cwd,
        server: { port, cors: true, hmr: false }, // We handle HMR via custom WS
        plugins: [{
            name: 'wwv-hmr',
            handleHotUpdate({ server }: any) {
                // When Vite detects file changes, broadcast to our custom WS
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({ type: "plugin:updated", pluginId: manifest.id }));
                });
                return []; // Prevent default Vite HMR
            }
        }]
    });

    await vite.listen();

    // Attach custom WebSocket server for WWV DevModeSubscriber
    const wss = new WebSocketServer({ server: vite.httpServer as any, path: "/__wwv_dev__" });
    
    wss.on("connection", (ws) => {
        console.log(`[WWV CLI] Connected to WorldWideView instance`);
        ws.send(JSON.stringify({ type: "plugin:added", manifest }));
    });

    // Notify WorldWideView via API
    try {
        await fetch(`${targetUrl}/api/dev/load-unpacked`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...manifest,
                entry: `http://localhost:${port}/${manifest.dev_entry || "src/index.ts"}`
            })
        });
        console.log(`[WWV CLI] Registered with WorldWideView at ${targetUrl}`);
    } catch (err: any) {
        console.error(`[WWV CLI] Failed to connect to ${targetUrl}: ${err.message}`);
        console.log(`Waiting for WorldWideView to connect via WebSocket...`);
    }

    console.log(`\n🚀 Dev server running on http://localhost:${port}`);
    console.log(`Watching for file changes in ${cwd}...\n`);
}
