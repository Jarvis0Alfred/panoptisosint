import fs from "fs";
import path from "path";
import { build } from "vite";
import archiver from "archiver";

export async function packagePlugin() {
    const cwd = process.cwd();
    const manifestPath = path.join(cwd, "wwv-manifest.json");
    
    if (!fs.existsSync(manifestPath)) {
        throw new Error("No wwv-manifest.json found in current directory");
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    
    console.log(`[WWV CLI] Building production bundle...`);
    await build({
        root: cwd,
        build: {
            lib: {
                entry: path.resolve(cwd, manifest.dev_entry || "src/index.ts"),
                name: 'WWVPlugin',
                formats: ['es'],
                fileName: () => 'frontend.mjs'
            },
            outDir: 'dist',
            emptyOutDir: true
        }
    });

    const pkgName = `${manifest.id}-${manifest.version}.wwvpkg`;
    const outputPath = path.join(cwd, pkgName);
    
    console.log(`[WWV CLI] Creating archive ${pkgName}...`);
    
    await new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver("zip", { zlib: { level: 9 } });
        
        output.on("close", () => resolve());
        archive.on("error", (err) => reject(err));
        
        archive.pipe(output);
        
        archive.file(manifestPath, { name: "wwv-manifest.json" });
        archive.directory(path.join(cwd, "dist"), "dist");
        
        if (fs.existsSync(path.join(cwd, "data"))) {
            archive.directory(path.join(cwd, "data"), "data");
        }
        
        archive.finalize();
    });

    console.log(`\n🎉 Success! Package created at ${outputPath}`);
    console.log(`You can use this file to sideload the plugin into your WWV instance.`);
}
