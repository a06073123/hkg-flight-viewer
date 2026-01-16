#!/usr/bin/env node

/**
 * Fetch Airport Data
 *
 * Downloads airport-codes.csv from datasets/airport-codes GitHub repo
 * and converts it to JSON format for use in the application.
 *
 * Data source: https://github.com/datasets/airport-codes
 * (Updated nightly from OurAirports.com)
 *
 * Note: Airline data is fetched directly from HKIA official JSON at runtime:
 * https://www.hongkongairport.com/iwov-resources/custom/json/airline_en.json
 *
 * Usage: npm run fetch:airports
 */

import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, "..", "public", "data", "airports");

// Airport codes CSV from datasets/airport-codes
const AIRPORTS_CSV_URL =
	"https://raw.githubusercontent.com/datasets/airport-codes/master/data/airport-codes.csv";

/**
 * Parse CSV with proper handling of quoted fields and commas
 */
function parseCSV(csvText) {
	const lines = csvText.split("\n").filter((line) => line.trim());
	if (lines.length === 0) return [];

	// Parse header
	const headers = parseCSVLine(lines[0]);

	// Parse data rows
	const rows = [];
	for (let i = 1; i < lines.length; i++) {
		const values = parseCSVLine(lines[i]);
		if (values.length !== headers.length) continue;

		const row = {};
		for (let j = 0; j < headers.length; j++) {
			row[headers[j]] = values[j] || null;
		}
		rows.push(row);
	}

	return rows;
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line) {
	const result = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			inQuotes = !inQuotes;
		} else if (char === "," && !inQuotes) {
			result.push(current.trim());
			current = "";
		} else {
			current += char;
		}
	}
	result.push(current.trim());

	return result;
}

/**
 * Parse airport-codes.csv
 * Columns: ident, type, name, elevation_ft, continent, iso_country, iso_region,
 *          municipality, icao_code, iata_code, gps_code, local_code, coordinates
 */
function parseAirports(rows) {
	const airports = {};

	for (const row of rows) {
		const iata = row.iata_code;

		// Skip entries without IATA code or non-airport types
		if (!iata || iata.length !== 3) continue;

		// Only include airports (not heliports, seaplane bases, etc.)
		const type = row.type || "";
		if (
			!type.includes("airport") &&
			type !== "large_airport" &&
			type !== "medium_airport" &&
			type !== "small_airport"
		) {
			// Still include if it has a valid IATA code (some major airports have different types)
			if (!iata) continue;
		}

		airports[iata] = {
			name: row.name || iata,
			city: row.municipality || null,
			country: row.iso_country || null,
			icao: row.icao_code || null,
			type: row.type || null,
			continent: row.continent || null,
		};
	}

	return airports;
}

async function fetchData(url) {
	console.log(`Fetching: ${url}`);
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status}`);
	}
	return response.text();
}

async function main() {
	console.log("🛫 Fetching Airport Data...\n");
	console.log("📦 Source: datasets/airport-codes (GitHub)");
	console.log("   Updated nightly from OurAirports.com\n");

	// Create output directory
	await mkdir(DATA_DIR, { recursive: true });

	try {
		// Fetch and parse airports
		console.log("📍 Downloading airport-codes.csv...");
		const csvData = await fetchData(AIRPORTS_CSV_URL);
		const rows = parseCSV(csvData);
		console.log(`   Parsed ${rows.length} rows\n`);

		console.log("🔄 Processing airports...");
		const airports = parseAirports(rows);
		const airportCount = Object.keys(airports).length;

		await writeFile(
			join(DATA_DIR, "airports.json"),
			JSON.stringify(airports),
		);
		console.log(`   ✅ Saved ${airportCount} airports with IATA codes\n`);

		// Show some stats
		const byContinent = {};
		for (const airport of Object.values(airports)) {
			const continent = airport.continent || "Unknown";
			byContinent[continent] = (byContinent[continent] || 0) + 1;
		}

		console.log("📊 Distribution by continent:");
		for (const [continent, count] of Object.entries(byContinent).sort(
			(a, b) => b[1] - a[1],
		)) {
			console.log(`   ${continent}: ${count}`);
		}

		console.log(`\n✅ Data saved to: ${DATA_DIR}`);
		console.log("\n💡 Note: Airline data is fetched from HKIA at runtime:");
		console.log(
			"   https://www.hongkongairport.com/iwov-resources/custom/json/airline_en.json",
		);
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

main();
