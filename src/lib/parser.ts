/**
 * Flight Data Parsers and Utilities
 *
 * Transforms raw HKIA API responses into normalized FlightRecord objects
 */

import {
	API_DATE_RANGE,
	type ApiDateRange,
	ArrivalHall,
	DepartureAisle,
	FlightCategory,
	FlightDirection,
	type FlightIdentifier,
	type FlightRecord,
	type ParsedStatus,
	type RawApiResponse,
	type RawFlightListItem,
	StatusType,
} from "../types/flight";

// ============================================================================
// STATUS PARSING
// ============================================================================

/**
 * Regular expressions for parsing status strings
 */
const STATUS_PATTERNS = {
	departed: /^Dep (\d{2}:\d{2})(?:\s+\((\d{2}\/\d{2}\/\d{4})\))?$/,
	atGate: /^At gate (\d{2}:\d{2})(?:\s+\((\d{2}\/\d{2}\/\d{4})\))?$/,
	landed: /^Landed (\d{2}:\d{2})$/,
	estimated: /^Est at (\d{2}:\d{2})(?:\s+\((\d{2}\/\d{2}\/\d{4})\))?$/,
};

/**
 * Parse raw status string into structured ParsedStatus
 */
export function parseStatus(rawStatus: string): ParsedStatus {
	const status = rawStatus.trim();

	// Empty status
	if (!status) {
		return {
			raw: status,
			type: StatusType.Unknown,
			isDifferentDate: false,
		};
	}

	// Simple string matches
	const simpleStatuses: Record<string, StatusType> = {
		Cancelled: StatusType.Cancelled,
		Delayed: StatusType.Delayed,
		Boarding: StatusType.Boarding,
		"Boarding Soon": StatusType.BoardingSoon,
		"Final Call": StatusType.FinalCall,
		"Gate Closed": StatusType.GateClosed,
	};

	if (simpleStatuses[status]) {
		return {
			raw: status,
			type: simpleStatuses[status],
			isDifferentDate: false,
		};
	}

	// Departed pattern
	const depMatch = status.match(STATUS_PATTERNS.departed);
	if (depMatch) {
		return {
			raw: status,
			type: StatusType.Departed,
			time: depMatch[1],
			date: depMatch[2],
			isDifferentDate: !!depMatch[2],
		};
	}

	// At gate pattern
	const gateMatch = status.match(STATUS_PATTERNS.atGate);
	if (gateMatch) {
		return {
			raw: status,
			type: StatusType.AtGate,
			time: gateMatch[1],
			date: gateMatch[2],
			isDifferentDate: !!gateMatch[2],
		};
	}

	// Landed pattern
	const landedMatch = status.match(STATUS_PATTERNS.landed);
	if (landedMatch) {
		return {
			raw: status,
			type: StatusType.Landed,
			time: landedMatch[1],
			isDifferentDate: false,
		};
	}

	// Estimated pattern
	const estMatch = status.match(STATUS_PATTERNS.estimated);
	if (estMatch) {
		return {
			raw: status,
			type: StatusType.Estimated,
			time: estMatch[1],
			date: estMatch[2],
			isDifferentDate: !!estMatch[2],
		};
	}

	// Unknown pattern
	return {
		raw: status,
		type: StatusType.Unknown,
		isDifferentDate: false,
	};
}

// ============================================================================
// FLIGHT IDENTIFIER PARSING
// ============================================================================

/**
 * Parse raw flight info into FlightIdentifier
 */
export function parseFlightIdentifier(
	no: string,
	airline: string,
): FlightIdentifier {
	const parts = no.trim().split(/\s+/);
	const iataCode = parts[0] || "";
	const flightNumber = parts.slice(1).join("") || "";

	return {
		no: no.trim(),
		airline,
		iataCode,
		flightNumber,
	};
}

// ============================================================================
// MAIN PARSER
// ============================================================================

/**
 * Generate unique ID for a flight record
 */
export function generateFlightId(
	date: string,
	time: string,
	flightNo: string,
	isArrival: boolean,
): string {
	const direction = isArrival ? "A" : "D";
	const sanitizedFlightNo = flightNo.replace(/\s+/g, "");
	return `${date}_${time.replace(":", "")}_${sanitizedFlightNo}_${direction}`;
}

/**
 * Parse a single raw flight item into normalized FlightRecord
 */
export function parseFlightItem(
	item: RawFlightListItem,
	date: string,
	isArrival: boolean,
	isCargo: boolean,
): FlightRecord {
	// Parse flight identifiers
	const flights = item.flight.map((f) =>
		parseFlightIdentifier(f.no, f.airline),
	);
	const operatingCarrier = flights[0];

	// Parse route (origin or destination)
	const route = isArrival ? item.origin || [] : item.destination || [];

	// Determine primary airport
	// For arrivals: first airport is the origin
	// For departures: last airport is the final destination
	const primaryAirport = isArrival
		? route[0] || ""
		: route[route.length - 1] || "";

	// Generate unique ID
	const id = generateFlightId(
		date,
		item.time,
		operatingCarrier.no,
		isArrival,
	);

	// Parse status
	const status = parseStatus(item.status);

	// Parse hall for arrivals
	let hall: ArrivalHall | undefined;
	if (isArrival && item.hall) {
		hall = item.hall as ArrivalHall;
	}

	// Parse aisle for departures
	let aisle: DepartureAisle | undefined;
	if (!isArrival && item.aisle) {
		aisle = item.aisle as DepartureAisle;
	}

	return {
		id,
		date,
		time: item.time,
		flights,
		operatingCarrier,
		codeshareCount: flights.length - 1,
		route,
		primaryAirport,
		hasViaStops: route.length > 1,
		viaStopCount: Math.max(0, route.length - 1),
		status,
		gate: isArrival ? undefined : item.gate,
		baggageClaim: isArrival ? item.baggage : undefined,
		terminal: item.terminal,
		hall,
		aisle,
		stand: item.stand,
		direction: isArrival
			? FlightDirection.Arrival
			: FlightDirection.Departure,
		category: isCargo ? FlightCategory.Cargo : FlightCategory.Passenger,
		isArrival,
		isCargo,
	};
}

/**
 * Parse full API response into FlightRecord array
 */
export function parseApiResponse(
	response: RawApiResponse,
	isArrival: boolean,
	isCargo: boolean,
): FlightRecord[] {
	const records: FlightRecord[] = [];

	for (const dateGroup of response) {
		const date = dateGroup.date;

		for (const item of dateGroup.list) {
			try {
				const record = parseFlightItem(item, date, isArrival, isCargo);
				records.push(record);
			} catch (error) {
				console.warn(`Failed to parse flight item:`, item, error);
			}
		}
	}

	return records;
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get the valid date range for API requests
 */
export function getApiDateRange(
	referenceDate: Date = new Date(),
): ApiDateRange {
	const minDate = new Date(referenceDate);
	minDate.setDate(minDate.getDate() - API_DATE_RANGE.PAST_DAYS);

	const maxDate = new Date(referenceDate);
	maxDate.setDate(maxDate.getDate() + API_DATE_RANGE.FUTURE_DAYS);

	return {
		minDate,
		maxDate,
		pastDays: API_DATE_RANGE.PAST_DAYS,
		futureDays: API_DATE_RANGE.FUTURE_DAYS,
	};
}

/**
 * Check if a date is within the valid API range
 */
export function isDateInRange(
	date: Date,
	referenceDate: Date = new Date(),
): boolean {
	const range = getApiDateRange(referenceDate);
	return date >= range.minDate && date <= range.maxDate;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
	return date.toISOString().split("T")[0];
}

/**
 * Parse DD/MM/YYYY to Date object
 */
export function parseDDMMYYYY(dateStr: string): Date | null {
	const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	if (!match) return null;

	const [, day, month, year] = match;
	return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

// ============================================================================
// COMPARISON UTILITIES
// ============================================================================

/**
 * Check if two flight records represent the same flight
 */
export function isSameFlight(a: FlightRecord, b: FlightRecord): boolean {
	return a.id === b.id;
}

/**
 * Detect changes between two versions of the same flight
 */
export interface FlightChanges {
	statusChanged: boolean;
	gateChanged: boolean;
	timeChanged: boolean;
	previousStatus?: ParsedStatus;
	previousGate?: string;
}

export function detectFlightChanges(
	oldFlight: FlightRecord,
	newFlight: FlightRecord,
): FlightChanges {
	return {
		statusChanged: oldFlight.status.raw !== newFlight.status.raw,
		gateChanged: oldFlight.gate !== newFlight.gate,
		timeChanged: oldFlight.time !== newFlight.time,
		previousStatus: oldFlight.status,
		previousGate: oldFlight.gate,
	};
}

/**
 * Compare two flight lists and identify changed flights
 */
export function compareFlightLists(
	oldList: FlightRecord[],
	newList: FlightRecord[],
): Map<string, FlightChanges> {
	const changes = new Map<string, FlightChanges>();
	const oldMap = new Map(oldList.map((f) => [f.id, f]));

	for (const newFlight of newList) {
		const oldFlight = oldMap.get(newFlight.id);
		if (oldFlight) {
			const flightChanges = detectFlightChanges(oldFlight, newFlight);
			if (
				flightChanges.statusChanged ||
				flightChanges.gateChanged ||
				flightChanges.timeChanged
			) {
				changes.set(newFlight.id, flightChanges);
			}
		}
	}

	return changes;
}
