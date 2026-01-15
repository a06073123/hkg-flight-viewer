/**
 * HKG Flight Data Re-indexing Script
 *
 * This script rebuilds all index shards from existing daily snapshot files.
 * Use this when you need to regenerate indexes after schema changes or corruption.
 *
 * Usage: node scripts/reindex-flights.js [--clean]
 *
 * Options:
 *   --clean    Remove all existing index files before rebuilding
 */

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DATA_DIR = path.resolve(__dirname, "../public/data");
const DAILY_DIR = path.join(DATA_DIR, "daily");
const FLIGHTS_INDEX_DIR = path.join(DATA_DIR, "indexes/flights");
const GATES_INDEX_DIR = path.join(DATA_DIR, "indexes/gates");
const MAX_SHARD_ENTRIES = 50;

/**
 * Generate a unique key for a flight record to prevent duplicates
 * @param {object} flight - Flight record
 * @returns {string} Unique key
 */
function getFlightKey(flight) {
	const flightNos = flight.flight.map((f) => f.no).join(",");
	return `${flight.date}|${flight.time}|${flightNos}|${flight.isArrival}`;
}

/**
 * Clean up index directories
 */
async function cleanIndexes() {
	console.log("Cleaning existing indexes...");

	if (await fs.pathExists(FLIGHTS_INDEX_DIR)) {
		await fs.emptyDir(FLIGHTS_INDEX_DIR);
		console.log("  - Cleaned flight indexes");
	}

	if (await fs.pathExists(GATES_INDEX_DIR)) {
		await fs.emptyDir(GATES_INDEX_DIR);
		console.log("  - Cleaned gate indexes");
	}
}

/**
 * Build indexes from daily snapshots
 */
async function buildIndexes() {
	// Ensure directories exist
	await fs.ensureDir(FLIGHTS_INDEX_DIR);
	await fs.ensureDir(GATES_INDEX_DIR);

	// Get all daily snapshot files, sorted by date
	const dailyFiles = (await fs.readdir(DAILY_DIR))
		.filter((f) => f.endsWith(".json"))
		.sort();

	console.log(`Found ${dailyFiles.length} daily snapshot files.`);

	// In-memory index storage
	const flightIndex = new Map();
	const gateIndex = new Map();

	// Process each daily file
	for (const file of dailyFiles) {
		const filePath = path.join(DAILY_DIR, file);
		console.log(`Processing ${file}...`);

		try {
			const data = await fs.readJson(filePath);
			const flights = data.flights || [];

			for (const flight of flights) {
				const flightKey = getFlightKey(flight);

				// Process flight number indexes
				for (const flightInfo of flight.flight) {
					const flightNo = flightInfo.no.replace(/[^a-zA-Z0-9]/g, "");
					if (flightNo) {
						if (!flightIndex.has(flightNo)) {
							flightIndex.set(flightNo, new Map());
						}
						// Use flightKey to prevent duplicates
						flightIndex.get(flightNo).set(flightKey, flight);
					}
				}

				// Process gate indexes (only for departures with gate info)
				const gate = flight.gate_baggage;
				if (gate && !flight.isArrival) {
					const gateNo = gate.toString().replace(/[^a-zA-Z0-9]/g, "");
					if (gateNo) {
						if (!gateIndex.has(gateNo)) {
							gateIndex.set(gateNo, new Map());
						}
						gateIndex.get(gateNo).set(flightKey, flight);
					}
				}
			}
		} catch (error) {
			console.warn(`  - Error reading ${file}: ${error.message}`);
		}
	}

	// Write flight indexes to disk
	console.log(`\nWriting ${flightIndex.size} flight index files...`);
	let flightShardsWritten = 0;

	for (const [flightNo, entries] of flightIndex) {
		// Convert map to array and sort by date/time, keep last MAX_SHARD_ENTRIES
		const sortedEntries = [...entries.values()]
			.sort((a, b) => {
				const dateA = `${a.date} ${a.time}`;
				const dateB = `${b.date} ${b.time}`;
				return dateA.localeCompare(dateB);
			})
			.slice(-MAX_SHARD_ENTRIES);

		const shardPath = path.join(FLIGHTS_INDEX_DIR, `${flightNo}.json`);
		await fs.writeJson(shardPath, sortedEntries, { spaces: 2 });
		flightShardsWritten++;
	}

	// Write gate indexes to disk
	console.log(`Writing ${gateIndex.size} gate index files...`);
	let gateShardsWritten = 0;

	for (const [gateNo, entries] of gateIndex) {
		const sortedEntries = [...entries.values()]
			.sort((a, b) => {
				const dateA = `${a.date} ${a.time}`;
				const dateB = `${b.date} ${b.time}`;
				return dateA.localeCompare(dateB);
			})
			.slice(-MAX_SHARD_ENTRIES);

		const shardPath = path.join(GATES_INDEX_DIR, `${gateNo}.json`);
		await fs.writeJson(shardPath, sortedEntries, { spaces: 2 });
		gateShardsWritten++;
	}

	console.log(`\n========================================`);
	console.log(`Re-indexing complete!`);
	console.log(`  - Flight shards: ${flightShardsWritten}`);
	console.log(`  - Gate shards: ${gateShardsWritten}`);
	console.log(`========================================\n`);
}

// Main execution
async function main() {
	console.log(`\n========================================`);
	console.log(`HKG Flight Re-indexer`);
	console.log(`========================================\n`);

	const shouldClean = process.argv.includes("--clean");

	if (shouldClean) {
		await cleanIndexes();
	}

	await buildIndexes();
}

main().catch((error) => {
	console.error("Re-indexing failed:", error);
	process.exit(1);
});
