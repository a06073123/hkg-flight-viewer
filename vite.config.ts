import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	// GitHub Pages deploys to /hkg-flight-viewer/
	base: "/hkg-flight-viewer/",
	plugins: [
		tailwindcss(),
		solid(),
		// Plugin to copy only specific public files (exclude data/)
		{
			name: "copy-public-exclude-data",
			writeBundle: {
				sequential: true,
				handler() {
					const outDir = path.resolve(__dirname, "dist");
					const publicDir = path.resolve(__dirname, "public");

					// Copy only vite.svg (and any other non-data files)
					const files = fs.readdirSync(publicDir);
					for (const file of files) {
						if (file === "data") continue; // Skip data folder
						const src = path.join(publicDir, file);
						const dest = path.join(outDir, file);
						if (fs.statSync(src).isFile()) {
							fs.copyFileSync(src, dest);
						}
					}
				},
			},
		},
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		// Don't copy public dir - we handle it manually above
		copyPublicDir: false,
	},
});
