/**
 * HKG Flight Data Archiving Script - D1 Batch API
 *
 * This script fetches flight data from Hong Kong International Airport's API
 * and writes directly to Cloudflare D1 database using the Batch API.
 *
 * Usage: node scripts/archive-to-d1.js [YYYY-MM-DD]
 *
 * Environment Variables:
 * - CLOUDFLARE_ACCOUNT_ID: Cloudflare account ID (required)
 * - CLOUDFLARE_API_TOKEN: API token with D1 edit permissions (required)
 * - D1_DATABASE_ID: D1 database ID (default: from wrangler.toml)
 *
 * Data Sources:
 * - Arrivals (Passenger): arrival=true, cargo=false
 * - Arrivals (Cargo): arrival=true, cargo=true
 * - Departures (Passenger): arrival=false, cargo=false
 * - Departures (Cargo): arrival=false, cargo=true
 */

import axios from "axios";
import dayjs from "dayjs";

// Configuration
const API_BASE_URL =
	"https://www.hongkongairport.com/flightinfo-rest/rest/flights/past";

// D1 Configuration
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const D1_DATABASE_ID = process.env.D1_DATABASE_ID || "ed2d96a7-1be1-4b1c-9c36-48e7b2b477ba";

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
 * Extract flights from API response and collect ICAO↔IATA mappings
 * @param {object} apiResponse - Raw API response
 * @param {boolean} isArrival - Whether this is arrival data
 * @param {boolean} isCargo - Whether this is cargo data
 * @param {Map<string, {iata: string, sample: string}>} airlineMap - Map to collect ICAO→IATA mappings
 * @returns {Array} Array of normalized flight records
 */
function extractFlights(apiResponse, isArrival, isCargo, airlineMap) {
	const flights = [];

	if (!apiResponse || !Array.isArray(apiResponse)) {
		return flights;
	}

	for (const dateGroup of apiResponse) {
		const date = dateGroup.date;
		const flightList = dateGroup.list || [];

		for (const flight of flightList) {
			const flightInfos = flight.flight || [];
			if (flightInfos.length === 0) continue;

			// First flight is the primary, rest are codeshares
			const primaryFlight = flightInfos[0];
			const codeshares = flightInfos.slice(1).map((f) => f.no);

			// Extract ICAO→IATA mapping from raw data
			// flight.no format: "5X 055" (IATA code + space + number)
			// flight.airline: "UPS" (ICAO code)
			const flightNo = primaryFlight.no || "";
			const icaoCode = primaryFlight.airline || "";
			
			// Extract IATA code from flight number (before the space)
			const spaceIndex = flightNo.indexOf(" ");
			if (spaceIndex > 0 && icaoCode) {
				const iataCode = flightNo.substring(0, spaceIndex);
				// Only store if we haven't seen this ICAO code or if IATA is shorter (prefer 2-letter)
				if (!airlineMap.has(icaoCode) || iataCode.length <= 2) {
					airlineMap.set(icaoCode, { iata: iataCode, sample: flightNo });
				}
			}

			const record = {
				date: date,
				time: flight.time || "",
				flight_no: flightNo, // With space, e.g., "CX 888"
				airline: icaoCode,   // ICAO code, e.g., "CPA"
				origin_dest: isArrival
					? (Array.isArray(flight.origin) ? flight.origin.join(",") : flight.origin || "")
					: (Array.isArray(flight.destination) ? flight.destination.join(",") : flight.destination || ""),
				status: flight.status || "",
				gate_baggage: isArrival
					? flight.baggage || ""
					: flight.gate || "",
				terminal: flight.terminal || "",
				is_arrival: isArrival ? 1 : 0,
				is_cargo: isCargo ? 1 : 0,
				codeshares: codeshares.length > 0 ? JSON.stringify(codeshares) : null,
			};

			flights.push(record);
		}
	}

	return flights;
}

/**
 * Execute multiple SQL statements in a batch via D1 raw endpoint
 * @param {Array<{sql: string, params: Array}>} statements - Array of SQL statements
 * @returns {Promise<object>} Query result
 */
async function executeD1Batch(statements) {
	const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/raw`;

	try {
		const response = await axios.post(
			url,
			{ batch: statements },
			{
				headers: {
					Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
					"Content-Type": "application/json",
				},
				timeout: 120000,
			}
		);

		if (!response.data.success) {
			throw new Error(response.data.errors?.[0]?.message || "D1 batch failed");
		}

		return response.data.result;
	} catch (error) {
		if (error.response?.data?.errors) {
			throw new Error(error.response.data.errors[0]?.message || "D1 API error");
		}
		throw error;
	}
}

/**
 * Delete existing records for the date (to allow re-archive)
 * @param {string} date - Date in YYYY-MM-DD format
 */
async function deleteExistingRecords(date) {
	console.log(`Deleting existing records for ${date}...`);
	const results = await executeD1Batch([
		{ sql: "DELETE FROM flights WHERE date = ?", params: [date] }
	]);
	console.log(`  - Deleted ${results[0]?.meta?.changes || 0} existing records`);
}

/**
 * Insert flights in batches using D1 batch API
 * @param {Array} flights - Array of flight records
 */
async function insertFlights(flights) {
	console.log(`Inserting ${flights.length} flights via batch API...`);

	const archivedAt = new Date().toISOString();
	const BATCH_SIZE = 50;
	let totalInserted = 0;
	let totalErrors = 0;

	for (let i = 0; i < flights.length; i += BATCH_SIZE) {
		const batch = flights.slice(i, i + BATCH_SIZE);

		const statements = batch.map((flight) => ({
			sql: `INSERT OR REPLACE INTO flights 
				(date, time, flight_no, airline, origin_dest, status, 
				 gate_baggage, terminal, is_arrival, is_cargo, codeshares, archived_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			params: [
				flight.date,
				flight.time,
				flight.flight_no,
				flight.airline,
				flight.origin_dest,
				flight.status,
				flight.gate_baggage,
				flight.terminal,
				flight.is_arrival,
				flight.is_cargo,
				flight.codeshares,
				archivedAt,
			],
		}));

		try {
			const results = await executeD1Batch(statements);
			const inserted = results.reduce((sum, r) => sum + (r.meta?.changes || 0), 0);
			totalInserted += inserted;
			console.log(`  - Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${inserted} rows`);
		} catch (error) {
			totalErrors += batch.length;
			console.error(`  - Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${error.message}`);
		}
	}

	console.log(`  - Total: ${totalInserted} inserted, ${totalErrors} errors`);
	return totalInserted;
}

/**
 * Update airlines table with ICAO→IATA code mappings extracted from flight data
 * @param {Map<string, {iata: string, sample: string}>} airlineMap - ICAO→IATA mappings
 */
async function updateAirlinesTable(airlineMap) {
	if (airlineMap.size === 0) {
		console.log(`\nNo airline mappings to update.`);
		return;
	}

	console.log(`\nUpdating airlines mapping table (${airlineMap.size} airlines)...`);

	const updatedAt = new Date().toISOString();
	const statements = [];

	for (const [icaoCode, { iata, sample }] of airlineMap) {
		statements.push({
			sql: `INSERT INTO airlines (icao_code, iata_code, sample_flight, updated_at) 
			      VALUES (?, ?, ?, ?)
			      ON CONFLICT(icao_code) DO UPDATE SET 
			        iata_code = excluded.iata_code,
			        sample_flight = excluded.sample_flight,
			        updated_at = excluded.updated_at`,
			params: [icaoCode, iata, sample, updatedAt],
		});
	}

	// Execute in batches of 50
	const BATCH_SIZE = 50;
	let totalUpdated = 0;

	for (let i = 0; i < statements.length; i += BATCH_SIZE) {
		const batch = statements.slice(i, i + BATCH_SIZE);
		try {
			const results = await executeD1Batch(batch);
			totalUpdated += results.reduce((sum, r) => sum + (r.meta?.changes || 0), 0);
		} catch (error) {
			console.error(`  - Batch failed: ${error.message}`);
		}
	}

	console.log(`  - Updated ${totalUpdated} airline mappings`);
	
	// Log some examples
	const examples = Array.from(airlineMap.entries()).slice(0, 5);
	for (const [icao, { iata, sample }] of examples) {
		console.log(`    ${icao} → ${iata} (e.g., ${sample})`);
	}
	if (airlineMap.size > 5) {
		console.log(`    ... and ${airlineMap.size - 5} more`);
	}
}

/**
 * Main archiving function
 * @param {string} targetDate - Date to archive in YYYY-MM-DD format
 */
async function archiveFlights(targetDate) {
	console.log(`\n========================================`);
	console.log(`HKG Flight Archiver → D1 (Batch API)`);
	console.log(`Target Date: ${targetDate}`);
	console.log(`Database ID: ${D1_DATABASE_ID}`);
	console.log(`========================================\n`);

	// Validate environment
	if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
		console.error("Error: Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN");
		console.error("Set these environment variables before running.");
		process.exit(1);
	}

	// Collect airline ICAO→IATA mappings from raw data
	const airlineMap = new Map();
	let allFlights = [];

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
				airlineMap, // Pass map to collect ICAO→IATA mappings
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
	console.log(`Unique airlines found: ${airlineMap.size}`);

	if (allFlights.length === 0) {
		console.log("No flights found. Exiting.");
		return;
	}

	// Delete existing records for this date (allows re-archive for delayed flights)
	await deleteExistingRecords(targetDate);

	// Insert new records using batch API
	const inserted = await insertFlights(allFlights);

	// Update airlines mapping table with extracted ICAO→IATA mappings
	await updateAirlinesTable(airlineMap);

	console.log(`\n========================================`);
	console.log(`Archiving complete!`);
	console.log(`Total inserted: ${inserted} flights`);
	console.log(`Airlines mapped: ${airlineMap.size}`);
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
