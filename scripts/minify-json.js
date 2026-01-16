#!/usr/bin/env node
/**
 * Minify JSON Script
 *
 * Minifies all JSON files in public/data directory
 * Removes unnecessary whitespace to reduce file size
 *
 * Usage: npm run minify:json
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT_DIR = resolve(__dirname, "..");
const DATA_DIR = join(ROOT_DIR, "public", "data");

let totalFiles = 0;
let totalOriginalSize = 0;
let totalMinifiedSize = 0;

/**
 * Recursively find all JSON files in a directory
 */
async function findJsonFiles(dir, files = []) {
	const entries = await readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = join(dir, entry.name);

		if (entry.isDirectory()) {
			await findJsonFiles(fullPath, files);
		} else if (entry.isFile() && entry.name.endsWith(".json")) {
			files.push(fullPath);
		}
	}

	return files;
}

/**
 * Minify a single JSON file
 */
async function minifyJsonFile(filePath) {
	try {
		const content = await readFile(filePath, "utf-8");
		const originalSize = Buffer.byteLength(content, "utf-8");

		// Parse and re-stringify without whitespace
		const parsed = JSON.parse(content);
		const minified = JSON.stringify(parsed);
		const minifiedSize = Buffer.byteLength(minified, "utf-8");

		// Only write if there's actual savings
		if (minifiedSize < originalSize) {
			await writeFile(filePath, minified, "utf-8");
			totalFiles++;
			totalOriginalSize += originalSize;
			totalMinifiedSize += minifiedSize;

			const savings = originalSize - minifiedSize;
			const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

			return {
				path: filePath,
				originalSize,
				minifiedSize,
				savings,
				savingsPercent,
			};
		}

		return null; // Already minified
	} catch (error) {
		console.error(`  ❌ Error processing ${filePath}: ${error.message}`);
		return null;
	}
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

async function main() {
	console.log("🗜️  Minifying JSON files...\n");
	console.log(`📁 Directory: ${DATA_DIR}\n`);

	try {
		// Find all JSON files
		const jsonFiles = await findJsonFiles(DATA_DIR);
		console.log(`📄 Found ${jsonFiles.length} JSON files\n`);

		if (jsonFiles.length === 0) {
			console.log("No JSON files found.");
			return;
		}

		// Process files in batches for better performance
		const batchSize = 100;
		let processedCount = 0;

		for (let i = 0; i < jsonFiles.length; i += batchSize) {
			const batch = jsonFiles.slice(i, i + batchSize);
			const results = await Promise.all(batch.map(minifyJsonFile));

			processedCount += batch.length;
			process.stdout.write(
				`\r🔄 Processing: ${processedCount}/${jsonFiles.length}`,
			);
		}

		console.log("\n");

		// Summary
		if (totalFiles > 0) {
			const totalSavings = totalOriginalSize - totalMinifiedSize;
			const savingsPercent = (
				(totalSavings / totalOriginalSize) *
				100
			).toFixed(1);

			console.log("✅ Minification complete!\n");
			console.log("📊 Summary:");
			console.log(`   Files minified: ${totalFiles}`);
			console.log(`   Original size:  ${formatBytes(totalOriginalSize)}`);
			console.log(`   Minified size:  ${formatBytes(totalMinifiedSize)}`);
			console.log(
				`   Savings:        ${formatBytes(totalSavings)} (${savingsPercent}%)`,
			);
		} else {
			console.log("✅ All files are already minified!");
		}
	} catch (error) {
		console.error(`\n❌ Error: ${error.message}`);
		process.exit(1);
	}
}

main();
