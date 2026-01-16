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

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

dayjs.extend(customParseFormat);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DAILY_DIR = path.resolve(__dirname, "../public/data/daily");

/**
 * Calculate the day offset between scheduled date and actual date in status
 * @param {string} scheduledDate - Scheduled date in YYYY-MM-DD format
 * @param {string} status - Status string like "Dep 13:50 (17/01/2025)"
 * @returns {number|null} - Day offset (positive = delayed, negative = early)
 */
function calculateDayOffset(scheduledDate, status) {
	if (!scheduledDate || !status) return null;

	// Extract date from status: (DD/MM/YYYY) or (DD/MM)
	const dateMatch = status.match(/\((\d{2})\/(\d{2})(?:\/(\d{4}))?\)/);
	if (!dateMatch) return null;

	const [, day, month, year] = dateMatch;
	const scheduledDayjs = dayjs(scheduledDate, "YYYY-MM-DD");

	if (!scheduledDayjs.isValid()) return null;

	// If year is not in status, infer it from scheduled date
	let actualYear = year;
	if (!actualYear) {
		// Assume same year, but handle year boundary
		actualYear = scheduledDayjs.year().toString();

		// If scheduled is late December and actual is early January, it's next year
		if (scheduledDayjs.month() === 11 && parseInt(month) === 1) {
			actualYear = (scheduledDayjs.year() + 1).toString();
		}
		// If scheduled is early January and actual is late December, it's previous year
		if (scheduledDayjs.month() === 0 && parseInt(month) === 12) {
			actualYear = (scheduledDayjs.year() - 1).toString();
		}
	}

	const actualDateStr = `${actualYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
	const actualDayjs = dayjs(actualDateStr, "YYYY-MM-DD");

	if (!actualDayjs.isValid()) return null;

	return actualDayjs.diff(scheduledDayjs, "day");
}

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
		dayOffset: new Map(), // day offset distribution (delay/early)
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
		// Day offset extremes
		maxDelay: null, // most delayed (positive offset)
		maxDelayDays: 0,
		maxEarly: null, // most early (negative offset)
		maxEarlyDays: 0,
		delayedBy2Plus: [], // flights delayed by +2 or more days
		earlyBy1Plus: [], // flights early by -1 or more days
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

			// Day offset analysis (delay/early detection)
			const dayOffset = calculateDayOffset(flight.date, statusRaw);
			if (dayOffset !== null) {
				distributions.dayOffset.set(
					dayOffset,
					(distributions.dayOffset.get(dayOffset) || 0) + 1,
				);

				// Track extreme delays (+2 days or more)
				if (dayOffset >= 2 && examples.delayedBy2Plus.length < 20) {
					examples.delayedBy2Plus.push({
						date: flight.date,
						time: flight.time,
						flight: flight.flight[0].no,
						status: statusRaw,
						dayOffset: dayOffset,
						isCargo: flight.isCargo,
					});
				}

				// Track extreme early (-1 days or less)
				if (dayOffset <= -1 && examples.earlyBy1Plus.length < 20) {
					examples.earlyBy1Plus.push({
						date: flight.date,
						time: flight.time,
						flight: flight.flight[0].no,
						status: statusRaw,
						dayOffset: dayOffset,
						isCargo: flight.isCargo,
					});
				}

				// Track max delay
				if (dayOffset > examples.maxDelayDays) {
					examples.maxDelayDays = dayOffset;
					examples.maxDelay = {
						date: flight.date,
						time: flight.time,
						flight: flight.flight[0].no,
						airline: flight.flight[0].airline,
						status: statusRaw,
						origin_dest: flight.origin_dest,
						isCargo: flight.isCargo,
					};
				}

				// Track max early
				if (dayOffset < examples.maxEarlyDays) {
					examples.maxEarlyDays = dayOffset;
					examples.maxEarly = {
						date: flight.date,
						time: flight.time,
						flight: flight.flight[0].no,
						airline: flight.flight[0].airline,
						status: statusRaw,
						origin_dest: flight.origin_dest,
						isCargo: flight.isCargo,
					};
				}
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

	console.log("\n\n⏱️  DAY OFFSET DISTRIBUTION (Delay/Early Analysis)");
	console.log("-".repeat(40));
	const dayOffsets = [...distributions.dayOffset.entries()].sort(
		(a, b) => a[0] - b[0],
	);
	for (const [offset, count] of dayOffsets) {
		const pct = ((count / stats.totalFlights) * 100).toFixed(2);
		let label;
		if (offset === 0) label = "Same day (on schedule)";
		else if (offset > 0)
			label = `+${offset} day${offset > 1 ? "s" : ""} (delayed)`;
		else label = `${offset} day${offset < -1 ? "s" : ""} (early)`;
		console.log(
			`${label.padEnd(25)} ${count.toLocaleString().padStart(8)} (${pct}%)`,
		);
	}

	console.log("\n\n🚨 EXTREME DELAY CASES");
	console.log("-".repeat(40));
	if (examples.maxDelay) {
		console.log(`Most delayed flight: +${examples.maxDelayDays} days`);
		console.log(JSON.stringify(examples.maxDelay, null, 2));
	} else {
		console.log("No delayed flights found with date info.");
	}

	console.log("\n\n⚡ EXTREME EARLY CASES");
	console.log("-".repeat(40));
	if (examples.maxEarly) {
		console.log(`Most early flight: ${examples.maxEarlyDays} days`);
		console.log(JSON.stringify(examples.maxEarly, null, 2));
	} else {
		console.log("No early flights found with date info.");
	}

	console.log("\n\n📋 FLIGHTS DELAYED BY +2 DAYS OR MORE");
	console.log("-".repeat(40));
	if (examples.delayedBy2Plus.length > 0) {
		console.log(`Found ${examples.delayedBy2Plus.length} examples:`);
		// Sort by dayOffset descending
		const sorted = examples.delayedBy2Plus.sort(
			(a, b) => b.dayOffset - a.dayOffset,
		);
		for (const f of sorted) {
			const cargoTag = f.isCargo ? " [CARGO]" : "";
			console.log(
				`  +${f.dayOffset}d: ${f.flight} (${f.date} ${f.time}) → ${f.status}${cargoTag}`,
			);
		}
	} else {
		console.log("No flights delayed by +2 days or more.");
	}

	console.log("\n\n📋 FLIGHTS EARLY BY -1 DAY OR MORE");
	console.log("-".repeat(40));
	if (examples.earlyBy1Plus.length > 0) {
		console.log(`Found ${examples.earlyBy1Plus.length} examples:`);
		// Sort by dayOffset ascending
		const sorted = examples.earlyBy1Plus.sort(
			(a, b) => a.dayOffset - b.dayOffset,
		);
		for (const f of sorted) {
			const cargoTag = f.isCargo ? " [CARGO]" : "";
			console.log(
				`  ${f.dayOffset}d: ${f.flight} (${f.date} ${f.time}) → ${f.status}${cargoTag}`,
			);
		}
	} else {
		console.log("No flights early by -1 day or more.");
	}

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
			dayOffset: Object.fromEntries(distributions.dayOffset),
		},
		airlineCodeMapping: Object.fromEntries(distributions.airlineCodes),
		extremeCases: {
			maxDelay: examples.maxDelay
				? { ...examples.maxDelay, dayOffset: examples.maxDelayDays }
				: null,
			maxEarly: examples.maxEarly
				? { ...examples.maxEarly, dayOffset: examples.maxEarlyDays }
				: null,
			delayedBy2Plus: examples.delayedBy2Plus,
			earlyBy1Plus: examples.earlyBy1Plus,
		},
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
