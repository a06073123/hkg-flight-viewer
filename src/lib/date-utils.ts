/**
 * Date Utilities
 *
 * Date parsing and timezone handling utilities for HKT (Hong Kong Time)
 */

/**
 * Parse date from URL parameter
 * Supports: yyyy-MM-dd or yyyyMMdd
 *
 * @param param URL parameter value
 * @returns Formatted date string (YYYY-MM-DD) or null if invalid
 */
export function parseDateParam(param: string | undefined): string | null {
	if (!param) return null;

	// yyyy-MM-dd format - validate and return
	if (/^\d{4}-\d{2}-\d{2}$/.test(param)) {
		return param;
	}

	// yyyyMMdd format - convert to yyyy-MM-dd
	if (/^\d{8}$/.test(param)) {
		return `${param.slice(0, 4)}-${param.slice(4, 6)}-${param.slice(6, 8)}`;
	}

	return null;
}

/**
 * Get yesterday's date in HKT (Hong Kong Time) timezone
 * Uses proper timezone handling via Intl API
 *
 * @returns Date string in YYYY-MM-DD format
 */
export function getYesterdayHKT(): string {
	// Get current date in HKT timezone
	const now = new Date();

	// Calculate yesterday by subtracting 24 hours
	const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

	// Format as YYYY-MM-DD using HKT timezone
	// toLocaleDateString with 'en-CA' locale returns YYYY-MM-DD format
	return yesterday.toLocaleDateString("en-CA", {
		timeZone: "Asia/Hong_Kong",
	});
}

/**
 * Get today's date in HKT (Hong Kong Time) timezone
 *
 * @returns Date string in YYYY-MM-DD format
 */
export function getTodayHKT(): string {
	return new Date().toLocaleDateString("en-CA", {
		timeZone: "Asia/Hong_Kong",
	});
}
