/**
 * Rolling Archive Script
 *
 * Archives flight data for the past N days to ensure delayed flights
 * get their final status captured. This solves the problem where flights
 * delayed by multiple days (e.g., K4 702 delayed from 11/27 to 11/29)
 * would have stale "Est" status in the archive.
 *
 * Usage: node scripts/archive-rolling.js [days]
 *
 * Default: 6 days (covers up to +5 day delays based on data analysis)
 *
 * Data Analysis Results (as of 2026-01-16):
 *   -1 day (early):     336 flights (0.32%) - normal early arrivals
 *   +1 day (delayed): 2,416 flights (2.31%)
 *   +2 days:           173 flights (0.17%)
 *   +3 days:            54 flights (0.05%)
 *   +4 days:            11 flights (0.01%)
 *   +5 days:             2 flights (0.00%) - max observed delay
 *
 * Example: A flight scheduled for 01/15 delayed to 01/20 (+5 days)
 * - Day 1-5: Archives with "Est" status
 * - Day 6: Re-archives with final "Dep" status ✅
 */

import { spawn } from "child_process";
import dayjs from "dayjs";

// Parse command line arguments
const rollingDays = parseInt(process.argv[2]) || 6;

console.log(`🔄 Rolling archive for past ${rollingDays} days...`);
console.log(`   This captures delayed flights with final departure status.\n`);

/**
 * Run the archive script for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<void>}
 */
function archiveDate(date) {
	return new Promise((resolve, reject) => {
		console.log(`📦 Archiving ${date}...`);

		const child = spawn("node", ["scripts/archive-flights.js", date], {
			stdio: "inherit",
			shell: true,
		});

		child.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(
					new Error(`Archive failed for ${date} with code ${code}`),
				);
			}
		});

		child.on("error", reject);
	});
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function main() {
	const today = dayjs();
	const dates = [];

	// Generate dates from D-1 to D-N
	for (let i = 1; i <= rollingDays; i++) {
		dates.push(today.subtract(i, "day").format("YYYY-MM-DD"));
	}

	console.log(`📅 Dates to archive: ${dates.join(", ")}\n`);

	let successCount = 0;
	let failCount = 0;

	for (let i = 0; i < dates.length; i++) {
		const date = dates[i];
		try {
			await archiveDate(date);
			successCount++;

			// Rate limiting between requests
			if (i < dates.length - 1) {
				console.log(`   ⏳ Waiting 2 seconds before next archive...\n`);
				await sleep(2000);
			}
		} catch (error) {
			console.error(`   ❌ Failed to archive ${date}: ${error.message}`);
			failCount++;
		}
	}

	console.log(`\n✅ Rolling archive complete!`);
	console.log(`   Success: ${successCount}/${dates.length}`);
	if (failCount > 0) {
		console.log(`   Failed: ${failCount}/${dates.length}`);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
