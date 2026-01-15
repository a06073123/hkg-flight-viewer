/**
 * HKG Flight Data Analysis Script
 *
 * Comprehensive analysis of all daily snapshot data to understand:
 * - Field distributions and patterns
 * - Status codes and their meanings
 * - Terminal, Hall, Aisle mappings
 * - Airline code distribution
 * - Time patterns and anomalies
 *
 * Usage: node scripts/analyze-data.js
 */

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DAILY_DIR = path.resolve(__dirname, "../public/data/daily");

async function analyzeData() {
	console.log("\n" + "=".repeat(60));
	console.log("HKG Flight Data Comprehensive Analysis");
	console.log("=".repeat(60) + "\n");

	const files = (await fs.readdir(DAILY_DIR))
		.filter((f) => f.endsWith(".json"))
		.sort();

	console.log(`📁 Found ${files.length} daily snapshot files`);
	console.log(
		`📅 Date range: ${files[0].replace(".json", "")} to ${files[files.length - 1].replace(".json", "")}\n`,
	);

	// Collectors
	const stats = {
		totalFlights: 0,
		arrivals: 0,
		departures: 0,
		cargo: 0,
		passenger: 0,
	};

	// Field distributions
	const distributions = {
		flightArraySize: new Map(),
		originDestArraySize: new Map(),
		status: new Map(),
		statusPatterns: new Map(),
		terminals: new Map(),
		halls: new Map(),
		aisles: new Map(),
		airlines: new Map(),
		airlineCodes: new Map(), // IATA to ICAO mapping
		gates: new Map(),
		baggageClaims: new Map(),
		timeSlots: new Map(), // hourly distribution
	};

	// Special cases
	const examples = {
		maxCodeshare: null,
		maxCodeshareCount: 0,
		maxVia: null,
		maxViaCount: 0,
		cancelledFlights: [],
		delayedFlights: [],
		emptyStatus: [],
	};

	// Process each file
	for (const file of files) {
		const data = await fs.readJson(path.join(DAILY_DIR, file));
		const flights = data.flights || [];

		for (const flight of flights) {
			stats.totalFlights++;
			if (flight.isArrival) stats.arrivals++;
			else stats.departures++;
			if (flight.isCargo) stats.cargo++;
			else stats.passenger++;

			// Flight array analysis
			const flightCount = flight.flight.length;
			distributions.flightArraySize.set(
				flightCount,
				(distributions.flightArraySize.get(flightCount) || 0) + 1,
			);

			if (flightCount > examples.maxCodeshareCount) {
				examples.maxCodeshareCount = flightCount;
				examples.maxCodeshare = flight;
			}

			// Airline analysis
			for (const f of flight.flight) {
				const iataMatch = f.no.match(/^([A-Z0-9]{2})\s/);
				const iata = iataMatch ? iataMatch[1] : "??";
				distributions.airlines.set(
					f.airline,
					(distributions.airlines.get(f.airline) || 0) + 1,
				);
				if (!distributions.airlineCodes.has(iata)) {
					distributions.airlineCodes.set(iata, f.airline);
				}
			}

			// Origin/Dest analysis
			const destCount = flight.origin_dest.length;
			distributions.originDestArraySize.set(
				destCount,
				(distributions.originDestArraySize.get(destCount) || 0) + 1,
			);

			if (destCount > examples.maxViaCount) {
				examples.maxViaCount = destCount;
				examples.maxVia = flight;
			}

			// Status analysis
			const statusRaw = flight.status || "";
			distributions.status.set(
				statusRaw,
				(distributions.status.get(statusRaw) || 0) + 1,
			);

			// Status pattern (normalized)
			const pattern = statusRaw
				.replace(/\d{2}:\d{2}/g, "HH:MM")
				.replace(/\d{2}\/\d{2}\/\d{4}/g, "DD/MM/YYYY");
			distributions.statusPatterns.set(
				pattern,
				(distributions.statusPatterns.get(pattern) || 0) + 1,
			);

			if (
				statusRaw === "Cancelled" &&
				examples.cancelledFlights.length < 5
			) {
				examples.cancelledFlights.push({
					date: flight.date,
					flight: flight.flight[0].no,
				});
			}
			if (statusRaw === "Delayed" && examples.delayedFlights.length < 5) {
				examples.delayedFlights.push({
					date: flight.date,
					flight: flight.flight[0].no,
				});
			}
			if (statusRaw === "" && examples.emptyStatus.length < 3) {
				examples.emptyStatus.push({
					date: flight.date,
					flight: flight.flight[0].no,
				});
			}

			// Terminal analysis
			if (flight.terminal) {
				distributions.terminals.set(
					flight.terminal,
					(distributions.terminals.get(flight.terminal) || 0) + 1,
				);
			}

			// Hall analysis (for arrivals)
			if (flight._raw?.hall) {
				distributions.halls.set(
					flight._raw.hall,
					(distributions.halls.get(flight._raw.hall) || 0) + 1,
				);
			}

			// Aisle analysis
			if (flight._raw?.aisle) {
				distributions.aisles.set(
					flight._raw.aisle,
					(distributions.aisles.get(flight._raw.aisle) || 0) + 1,
				);
			}

			// Gate analysis (departures)
			if (!flight.isArrival && flight.gate_baggage) {
				distributions.gates.set(
					flight.gate_baggage,
					(distributions.gates.get(flight.gate_baggage) || 0) + 1,
				);
			}

			// Baggage analysis (arrivals)
			if (flight.isArrival && flight.gate_baggage) {
				distributions.baggageClaims.set(
					flight.gate_baggage,
					(distributions.baggageClaims.get(flight.gate_baggage) ||
						0) + 1,
				);
			}

			// Time slot analysis
			const hour = flight.time?.substring(0, 2) || "??";
			distributions.timeSlots.set(
				hour,
				(distributions.timeSlots.get(hour) || 0) + 1,
			);
		}
	}

	// Output results
	console.log("📊 OVERALL STATISTICS");
	console.log("-".repeat(40));
	console.log(`Total flights: ${stats.totalFlights.toLocaleString()}`);
	console.log(
		`Arrivals: ${stats.arrivals.toLocaleString()} (${((stats.arrivals / stats.totalFlights) * 100).toFixed(1)}%)`,
	);
	console.log(
		`Departures: ${stats.departures.toLocaleString()} (${((stats.departures / stats.totalFlights) * 100).toFixed(1)}%)`,
	);
	console.log(
		`Passenger: ${stats.passenger.toLocaleString()} (${((stats.passenger / stats.totalFlights) * 100).toFixed(1)}%)`,
	);
	console.log(
		`Cargo: ${stats.cargo.toLocaleString()} (${((stats.cargo / stats.totalFlights) * 100).toFixed(1)}%)`,
	);

	console.log("\n\n✈️  CODESHARE (FLIGHT ARRAY) DISTRIBUTION");
	console.log("-".repeat(40));
	const flightSizes = [...distributions.flightArraySize.entries()].sort(
		(a, b) => a[0] - b[0],
	);
	for (const [size, count] of flightSizes) {
		const pct = ((count / stats.totalFlights) * 100).toFixed(1);
		console.log(`${size} flight(s): ${count.toLocaleString()} (${pct}%)`);
	}
	console.log(
		`\nMax codeshare example (${examples.maxCodeshareCount} flights):`,
	);
	console.log(
		JSON.stringify(
			{
				date: examples.maxCodeshare.date,
				time: examples.maxCodeshare.time,
				flights: examples.maxCodeshare.flight.map((f) => f.no),
			},
			null,
			2,
		),
	);

	console.log("\n\n🌍 VIA/TRANSIT (ORIGIN_DEST ARRAY) DISTRIBUTION");
	console.log("-".repeat(40));
	const destSizes = [...distributions.originDestArraySize.entries()].sort(
		(a, b) => a[0] - b[0],
	);
	for (const [size, count] of destSizes) {
		const pct = ((count / stats.totalFlights) * 100).toFixed(1);
		const label = size === 1 ? "Direct" : `Via ${size - 1} stop(s)`;
		console.log(`${label}: ${count.toLocaleString()} (${pct}%)`);
	}
	console.log(`\nMax via stops example (${examples.maxViaCount} airports):`);
	console.log(
		JSON.stringify(
			{
				date: examples.maxVia.date,
				flight: examples.maxVia.flight[0].no,
				route: examples.maxVia.origin_dest,
				isArrival: examples.maxVia.isArrival,
			},
			null,
			2,
		),
	);

	console.log("\n\n📋 STATUS PATTERNS");
	console.log("-".repeat(40));
	const patterns = [...distributions.statusPatterns.entries()].sort(
		(a, b) => b[1] - a[1],
	);
	for (const [pattern, count] of patterns) {
		const pct = ((count / stats.totalFlights) * 100).toFixed(1);
		console.log(
			`${(pattern || "(empty)").padEnd(35)} ${count.toLocaleString().padStart(8)} (${pct}%)`,
		);
	}

	console.log("\n\n🏢 TERMINAL DISTRIBUTION");
	console.log("-".repeat(40));
	const terminals = [...distributions.terminals.entries()].sort(
		(a, b) => b[1] - a[1],
	);
	if (terminals.length === 0) {
		console.log("(No terminal data in flights)");
	}
	for (const [terminal, count] of terminals) {
		console.log(`${terminal}: ${count.toLocaleString()}`);
	}

	console.log("\n\n🚪 HALL DISTRIBUTION (Arrivals)");
	console.log("-".repeat(40));
	const halls = [...distributions.halls.entries()].sort(
		(a, b) => b[1] - a[1],
	);
	for (const [hall, count] of halls) {
		console.log(`Hall ${hall}: ${count.toLocaleString()}`);
	}

	console.log("\n\n🪧 AISLE DISTRIBUTION");
	console.log("-".repeat(40));
	const aisles = [...distributions.aisles.entries()].sort((a, b) =>
		a[0].localeCompare(b[0]),
	);
	for (const [aisle, count] of aisles) {
		console.log(`${aisle}: ${count.toLocaleString()}`);
	}

	console.log("\n\n🛄 BAGGAGE CLAIM DISTRIBUTION (Top 20)");
	console.log("-".repeat(40));
	const baggage = [...distributions.baggageClaims.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 20);
	for (const [claim, count] of baggage) {
		console.log(`Belt ${claim}: ${count.toLocaleString()}`);
	}

	console.log("\n\n🚶 GATE DISTRIBUTION (Top 20)");
	console.log("-".repeat(40));
	const gates = [...distributions.gates.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 20);
	for (const [gate, count] of gates) {
		console.log(`Gate ${gate}: ${count.toLocaleString()}`);
	}

	console.log("\n\n⏰ TIME SLOT DISTRIBUTION");
	console.log("-".repeat(40));
	const timeSlots = [...distributions.timeSlots.entries()].sort((a, b) =>
		a[0].localeCompare(b[0]),
	);
	for (const [hour, count] of timeSlots) {
		const bar = "█".repeat(Math.round((count / stats.totalFlights) * 200));
		console.log(`${hour}:00 ${bar} ${count.toLocaleString()}`);
	}

	console.log("\n\n🏢 AIRLINE DISTRIBUTION (Top 30)");
	console.log("-".repeat(40));
	const airlines = [...distributions.airlines.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 30);
	for (const [code, count] of airlines) {
		// Find IATA code
		let iata = "??";
		for (const [i, icao] of distributions.airlineCodes.entries()) {
			if (icao === code) {
				iata = i;
				break;
			}
		}
		console.log(`${code} (${iata}): ${count.toLocaleString()}`);
	}

	console.log("\n\n🔍 SPECIAL CASES");
	console.log("-".repeat(40));
	console.log("Cancelled flights examples:", examples.cancelledFlights);
	console.log("Delayed flights examples:", examples.delayedFlights);
	console.log("Empty status examples:", examples.emptyStatus);

	// Save analysis results to file
	const analysisResult = {
		generatedAt: new Date().toISOString(),
		dateRange: {
			from: files[0].replace(".json", ""),
			to: files[files.length - 1].replace(".json", ""),
			daysCount: files.length,
		},
		statistics: stats,
		distributions: {
			flightArraySize: Object.fromEntries(distributions.flightArraySize),
			originDestArraySize: Object.fromEntries(
				distributions.originDestArraySize,
			),
			statusPatterns: Object.fromEntries(distributions.statusPatterns),
			terminals: Object.fromEntries(distributions.terminals),
			halls: Object.fromEntries(distributions.halls),
			aisles: Object.fromEntries(distributions.aisles),
			topGates: Object.fromEntries(gates),
			topBaggageClaims: Object.fromEntries(baggage),
			topAirlines: Object.fromEntries(airlines),
			timeSlots: Object.fromEntries(distributions.timeSlots),
		},
		airlineCodeMapping: Object.fromEntries(distributions.airlineCodes),
	};

	const outputPath = path.resolve(__dirname, "../docs/data-analysis.json");
	await fs.writeJson(outputPath, analysisResult, { spaces: 2 });
	console.log(`\n\n📄 Analysis saved to: ${outputPath}`);

	console.log("\n" + "=".repeat(60));
	console.log("Analysis Complete");
	console.log("=".repeat(60) + "\n");
}

analyzeData().catch((error) => {
	console.error("Analysis failed:", error);
	process.exit(1);
});
