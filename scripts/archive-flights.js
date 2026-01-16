/**
 * HKG Flight Data Archiving Script
 *
 * This script fetches flight data from Hong Kong International Airport's API
 * and creates sharded JSON files for efficient querying.
 *
 * Usage: node scripts/archive-flights.js [YYYY-MM-DD]
 *
 * Data Sources:
 * - Arrivals (Passenger): arrival=true, cargo=false
 * - Arrivals (Cargo): arrival=true, cargo=true
 * - Departures (Passenger): arrival=false, cargo=false
 * - Departures (Cargo): arrival=false, cargo=true
 */

import axios from "axios";
import dayjs from "dayjs";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_BASE_URL =
	"https://www.hongkongairport.com/flightinfo-rest/rest/flights/past";
const DATA_DIR = path.resolve(__dirname, "../public/data");
const DAILY_DIR = path.join(DATA_DIR, "daily");
const FLIGHTS_INDEX_DIR = path.join(DATA_DIR, "indexes/flights");
const GATES_INDEX_DIR = path.join(DATA_DIR, "indexes/gates");
const MAX_SHARD_ENTRIES = 50;

// API Request configurations
const FLIGHT_CATEGORIES = [
	{ arrival: true, cargo: false, label: "Arrival-Passenger" },
	{ arrival: true, cargo: true, label: "Arrival-Cargo" },
	{ arrival: false, cargo: false, label: "Departure-Passenger" },
	{ arrival: false, cargo: true, label: "Departure-Cargo" },
];

/**
 * Fetch flight data from the HKG API
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {boolean} arrival - true for arrivals, false for departures
 * @param {boolean} cargo - true for cargo flights, false for passenger flights
 * @returns {Promise<object>} API response data
 */
async function fetchFlightData(date, arrival, cargo) {
	const params = {
		date: date,
		lang: "en",
		arrival: arrival,
		cargo: cargo,
	};

	try {
		const response = await axios.get(API_BASE_URL, {
			params,
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
				Accept: "application/json",
			},
			timeout: 30000,
		});
		return response.data;
	} catch (error) {
		console.error(
			`Failed to fetch data (arrival=${arrival}, cargo=${cargo}):`,
			error.message,
		);
		return null;
	}
}

/**
 * Extract flights from API response
 * @param {object} apiResponse - Raw API response
 * @param {boolean} isArrival - Whether this is arrival data
 * @param {boolean} isCargo - Whether this is cargo data
 * @returns {Array} Array of normalized flight records
 */
function extractFlights(apiResponse, isArrival, isCargo) {
	const flights = [];

	if (!apiResponse || !Array.isArray(apiResponse)) {
		return flights;
	}

	for (const dateGroup of apiResponse) {
		const date = dateGroup.date;
		const flightList = dateGroup.list || [];

		for (const flight of flightList) {
			const flightNos = (flight.flight || []).map((f) => ({
				no: f.no,
				airline: f.airline,
			}));

			const record = {
				date: date,
				time: flight.time || "",
				flight: flightNos,
				origin_dest: isArrival
					? flight.origin || ""
					: flight.destination || "",
				status: flight.status || "",
				gate_baggage: isArrival
					? flight.baggage || ""
					: flight.gate || "",
				terminal: flight.terminal || "",
				isArrival: isArrival,
				isCargo: isCargo,
				// Keep raw fields for reference
				_raw: {
					aisle: flight.aisle || "",
					hall: flight.hall || "",
				},
			};

			flights.push(record);
		}
	}

	return flights;
}

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
 * Append flight to a shard file, keeping only the last MAX_SHARD_ENTRIES
 * @param {string} filePath - Path to the shard file
 * @param {object} flight - Flight record to append
 */
async function appendToShard(filePath, flight) {
	let existingData = [];

	try {
		if (await fs.pathExists(filePath)) {
			existingData = await fs.readJson(filePath);
		}
	} catch (error) {
		console.warn(
			`Could not read existing shard ${filePath}:`,
			error.message,
		);
		existingData = [];
	}

	// Check for duplicates using the unique key
	const newKey = getFlightKey(flight);
	const isDuplicate = existingData.some((existing) => {
		return getFlightKey(existing) === newKey;
	});

	if (isDuplicate) {
		return false; // Skip duplicate
	}

	// Add new entry and keep only last MAX_SHARD_ENTRIES
	existingData.push(flight);
	if (existingData.length > MAX_SHARD_ENTRIES) {
		existingData = existingData.slice(-MAX_SHARD_ENTRIES);
	}

	await fs.writeJson(filePath, existingData);
	return true;
}

/**
 * Process flights and create sharded index files
 * @param {Array} allFlights - Array of all flight records
 */
async function createShardedIndexes(allFlights) {
	console.log(
		`\nCreating sharded indexes for ${allFlights.length} flights...`,
	);

	let flightShardsCreated = 0;
	let gateShardsCreated = 0;

	for (const flight of allFlights) {
		// Process flight number shards
		for (const flightInfo of flight.flight) {
			const flightNo = flightInfo.no.replace(/[^a-zA-Z0-9]/g, ""); // Sanitize
			if (flightNo) {
				const shardPath = path.join(
					FLIGHTS_INDEX_DIR,
					`${flightNo}.json`,
				);
				const added = await appendToShard(shardPath, flight);
				if (added) flightShardsCreated++;
			}
		}

		// Process gate shards (only for departures with gate info)
		const gate = flight.gate_baggage;
		if (gate && !flight.isArrival) {
			const gateNo = gate.toString().replace(/[^a-zA-Z0-9]/g, ""); // Sanitize
			if (gateNo) {
				const shardPath = path.join(GATES_INDEX_DIR, `${gateNo}.json`);
				const added = await appendToShard(shardPath, flight);
				if (added) gateShardsCreated++;
			}
		}
	}

	console.log(`  - Flight shards updated: ${flightShardsCreated}`);
	console.log(`  - Gate shards updated: ${gateShardsCreated}`);
}

/**
 * Save daily snapshot
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {Array} allFlights - Array of all flight records
 */
async function saveDailySnapshot(date, allFlights) {
	const snapshotPath = path.join(DAILY_DIR, `${date}.json`);

	const snapshot = {
		date: date,
		generatedAt: new Date().toISOString(),
		totalFlights: allFlights.length,
		arrivals: allFlights.filter((f) => f.isArrival).length,
		departures: allFlights.filter((f) => !f.isArrival).length,
		cargo: allFlights.filter((f) => f.isCargo).length,
		passenger: allFlights.filter((f) => !f.isCargo).length,
		flights: allFlights,
	};

	await fs.writeJson(snapshotPath, snapshot);
	console.log(`Daily snapshot saved: ${snapshotPath}`);
}

/**
 * Main archiving function
 * @param {string} targetDate - Date to archive in YYYY-MM-DD format
 */
async function archiveFlights(targetDate) {
	console.log(`\n========================================`);
	console.log(`HKG Flight Archiver`);
	console.log(`Target Date: ${targetDate}`);
	console.log(`========================================\n`);

	// Ensure directories exist
	await fs.ensureDir(DAILY_DIR);
	await fs.ensureDir(FLIGHTS_INDEX_DIR);
	await fs.ensureDir(GATES_INDEX_DIR);
	console.log("Data directories ensured.");

	const allFlights = [];

	// Fetch all four categories
	for (const category of FLIGHT_CATEGORIES) {
		console.log(`\nFetching ${category.label}...`);

		const data = await fetchFlightData(
			targetDate,
			category.arrival,
			category.cargo,
		);

		if (data) {
			const flights = extractFlights(
				data,
				category.arrival,
				category.cargo,
			);
			console.log(`  - Found ${flights.length} flights`);
			allFlights.push(...flights);
		} else {
			console.log(`  - No data retrieved`);
		}

		// Rate limiting - wait 1 second between requests
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	console.log(`\nTotal flights collected: ${allFlights.length}`);

	if (allFlights.length === 0) {
		console.log("No flights found. Exiting.");
		return;
	}

	// Save daily snapshot
	await saveDailySnapshot(targetDate, allFlights);

	// Create sharded indexes
	await createShardedIndexes(allFlights);

	console.log(`\n========================================`);
	console.log(`Archiving complete!`);
	console.log(`========================================\n`);
}

// Main execution
const targetDate = process.argv[2] || dayjs().format("YYYY-MM-DD");

// Validate date format
if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
	console.error("Invalid date format. Use YYYY-MM-DD.");
	process.exit(1);
}

archiveFlights(targetDate).catch((error) => {
	console.error("Archiving failed:", error);
	process.exit(1);
});
