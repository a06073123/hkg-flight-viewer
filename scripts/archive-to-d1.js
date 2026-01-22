/**
 * HKG Flight Data Archiving Script - D1 Direct Write
 *
 * This script fetches flight data from Hong Kong International Airport's API
 * and writes directly to Cloudflare D1 database.
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
			const flightInfos = flight.flight || [];
			if (flightInfos.length === 0) continue;

			// First flight is the primary, rest are codeshares
			const primaryFlight = flightInfos[0];
			const codeshares = flightInfos.slice(1).map((f) => f.no);

			const record = {
				date: date,
				time: flight.time || "",
				flight_no: primaryFlight.no, // With space, e.g., "CX 888"
				airline: primaryFlight.airline,
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
				raw_data: null, // Not storing raw data anymore
			};

			flights.push(record);
		}
	}

	return flights;
}

/**
 * Execute SQL query on D1 via REST API
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<object>} Query result
 */
async function executeD1Query(sql, params = []) {
	const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`;

	try {
		const response = await axios.post(
			url,
			{ sql, params },
			{
				headers: {
					Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
					"Content-Type": "application/json",
				},
				timeout: 60000,
			}
		);

		if (!response.data.success) {
			throw new Error(response.data.errors?.[0]?.message || "D1 query failed");
		}

		return response.data.result[0];
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
	const result = await executeD1Query("DELETE FROM flights WHERE date = ?", [date]);
	console.log(`  - Deleted ${result.meta?.changes || 0} existing records`);
}

/**
 * Insert flights in batches
 * @param {Array} flights - Array of flight records
 */
async function insertFlights(flights) {
	console.log(`Inserting ${flights.length} flights to D1...`);

	const archivedAt = new Date().toISOString();
	let inserted = 0;
	let errors = 0;

	// Insert one by one to handle UNIQUE constraint gracefully
	for (const flight of flights) {
		try {
			await executeD1Query(
				`INSERT OR REPLACE INTO flights 
					(date, time, flight_no, airline, origin_dest, status, 
					 gate_baggage, terminal, is_arrival, is_cargo, codeshares, raw_data, archived_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
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
					flight.raw_data,
					archivedAt,
				]
			);
			inserted++;
		} catch (error) {
			errors++;
			if (errors <= 3) {
				console.warn(`  - Insert error for ${flight.flight_no}: ${error.message}`);
			}
		}

		// Progress indicator
		if (inserted % 100 === 0) {
			console.log(`  - Progress: ${inserted}/${flights.length}`);
		}
	}

	console.log(`  - Inserted: ${inserted}, Errors: ${errors}`);
	return inserted;
}

/**
 * Main archiving function
 * @param {string} targetDate - Date to archive in YYYY-MM-DD format
 */
async function archiveFlights(targetDate) {
	console.log(`\n========================================`);
	console.log(`HKG Flight Archiver → D1`);
	console.log(`Target Date: ${targetDate}`);
	console.log(`Database ID: ${D1_DATABASE_ID}`);
	console.log(`========================================\n`);

	// Validate environment
	if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
		console.error("Error: Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN");
		console.error("Set these environment variables before running.");
		process.exit(1);
	}

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

	// Delete existing records for this date (allows re-archive for delayed flights)
	await deleteExistingRecords(targetDate);

	// Insert new records
	const inserted = await insertFlights(allFlights);

	console.log(`\n========================================`);
	console.log(`Archiving complete!`);
	console.log(`Total inserted: ${inserted} flights`);
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
