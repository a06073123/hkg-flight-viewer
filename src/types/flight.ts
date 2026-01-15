/**
 * HKG Flight Data Type Definitions
 *
 * Based on HKIA Flight Information Data Specification and
 * comprehensive analysis of 104,732 flight records (2025-10-16 to 2026-01-16)
 */

// ============================================================================
// CONSTANTS (instead of enums for erasableSyntaxOnly compatibility)
// ============================================================================

/**
 * Flight direction
 */
export const FlightDirection = {
	Arrival: "arrival",
	Departure: "departure",
} as const;
export type FlightDirection =
	(typeof FlightDirection)[keyof typeof FlightDirection];

/**
 * Flight category
 */
export const FlightCategory = {
	Passenger: "passenger",
	Cargo: "cargo",
} as const;
export type FlightCategory =
	(typeof FlightCategory)[keyof typeof FlightCategory];

/**
 * Supported languages for API requests
 */
export const Language = {
	English: "en",
	TraditionalChinese: "zh_HK",
	SimplifiedChinese: "zh_CN",
} as const;
export type Language = (typeof Language)[keyof typeof Language];

/**
 * Terminal designations at HKIA
 * Currently only T1 is in active use for passenger flights
 */
export const Terminal = {
	T1: "T1",
	T2: "T2", // Currently used as SkyPlaza
} as const;
export type Terminal = (typeof Terminal)[keyof typeof Terminal];

/**
 * Arrival hall designations
 * Hall A: Gates 1-40 (South)
 * Hall B: Gates 201-230 (North)
 */
export const ArrivalHall = {
	A: "A",
	B: "B",
} as const;
export type ArrivalHall = (typeof ArrivalHall)[keyof typeof ArrivalHall];

/**
 * Departure gate aisle designations
 * Aisles are grouped by location in the terminal
 */
export const DepartureAisle = {
	A: "A", // Near gates 1-9
	B: "B",
	BC: "BC", // Between B and C
	C: "C",
	D: "D",
	E: "E",
	F: "F",
	G: "G",
	H: "H",
	J: "J",
	K: "K",
	L: "L",
} as const;
export type DepartureAisle =
	(typeof DepartureAisle)[keyof typeof DepartureAisle];

/**
 * Flight status patterns
 * Based on analysis of actual API responses
 */
export const StatusType = {
	// Completed statuses
	Departed: "departed", // "Dep HH:MM" or "Dep HH:MM (DD/MM/YYYY)"
	AtGate: "at_gate", // "At gate HH:MM" or "At gate HH:MM (DD/MM/YYYY)"
	Landed: "landed", // "Landed HH:MM"

	// In-progress statuses
	Boarding: "boarding", // "Boarding"
	BoardingSoon: "boarding_soon", // "Boarding Soon"
	FinalCall: "final_call", // "Final Call"
	GateClosed: "gate_closed", // "Gate Closed"

	// Pending statuses
	Estimated: "estimated", // "Est at HH:MM" or "Est at HH:MM (DD/MM/YYYY)"
	Delayed: "delayed", // "Delayed"
	Cancelled: "cancelled", // "Cancelled"

	// Unknown
	Unknown: "unknown", // Empty or unrecognized
} as const;
export type StatusType = (typeof StatusType)[keyof typeof StatusType];

// ============================================================================
// INTERFACES - API Response (Raw)
// ============================================================================

/**
 * Raw flight entry from HKIA API
 */
export interface RawFlightInfo {
	no: string; // e.g., "CX 888"
	airline: string; // ICAO code, e.g., "CPA"
}

/**
 * Raw flight list item from HKIA API
 */
export interface RawFlightListItem {
	time: string; // "HH:MM" format
	flight: RawFlightInfo[];
	status: string;
	terminal?: string;
	aisle?: string;
	hall?: string;
	stand?: string;

	// Arrival-specific
	origin?: string[];
	baggage?: string;

	// Departure-specific
	destination?: string[];
	gate?: string;
}

/**
 * Raw date group from HKIA API response
 */
export interface RawDateGroup {
	date: string; // "YYYY-MM-DD" format
	list: RawFlightListItem[];
}

/**
 * Full HKIA API response (array of date groups)
 */
export type RawApiResponse = RawDateGroup[];

/**
 * API Error response
 */
export interface ApiErrorResponse {
	problemNo: string;
	message: string;
}

// ============================================================================
// INTERFACES - Normalized Data
// ============================================================================

/**
 * Normalized flight identification
 */
export interface FlightIdentifier {
	/** Flight number with airline code, e.g., "CX 888" */
	no: string;

	/** ICAO airline code, e.g., "CPA" */
	airline: string;

	/** IATA airline code extracted from flight number, e.g., "CX" */
	iataCode: string;

	/** Numeric portion of flight number, e.g., "888" */
	flightNumber: string;
}

/**
 * Parsed flight status with structured data
 */
export interface ParsedStatus {
	/** Original raw status string */
	raw: string;

	/** Normalized status type */
	type: StatusType;

	/** Extracted time if present (HH:MM) */
	time?: string;

	/** Extracted date if present (different from scheduled date) */
	date?: string;

	/** Whether the status indicates the flight was on a different date */
	isDifferentDate: boolean;
}

/**
 * Normalized flight record for UI consumption
 */
export interface FlightRecord {
	/** Unique identifier for this record */
	id: string;

	/** Scheduled date (YYYY-MM-DD) */
	date: string;

	/** Scheduled time (HH:MM) */
	time: string;

	/**
	 * Flight identifiers
	 * First entry is the operating carrier
	 * Subsequent entries are codeshare partners
	 */
	flights: FlightIdentifier[];

	/** Operating carrier (first in flights array) */
	operatingCarrier: FlightIdentifier;

	/** Codeshare partner count */
	codeshareCount: number;

	/**
	 * Origin airports (for arrivals) or destination airports (for departures)
	 * Multiple entries indicate via/transit routing
	 * For arrivals: first is origin, subsequent are via stops
	 * For departures: last is final destination, preceding are via stops
	 */
	route: string[];

	/** Primary origin/destination (first for arrivals, last for departures) */
	primaryAirport: string;

	/** Whether this is a via/transit flight */
	hasViaStops: boolean;

	/** Number of intermediate stops */
	viaStopCount: number;

	/** Parsed status information */
	status: ParsedStatus;

	/** Gate number (departures only) */
	gate?: string;

	/** Baggage claim belt (arrivals only) */
	baggageClaim?: string;

	/** Terminal designation */
	terminal?: string;

	/** Arrival hall (arrivals only) */
	hall?: ArrivalHall;

	/** Departure aisle (departures only) */
	aisle?: DepartureAisle;

	/** Aircraft stand/parking position */
	stand?: string;

	/** Flight direction */
	direction: FlightDirection;

	/** Flight category */
	category: FlightCategory;

	/** Whether this is an arrival */
	isArrival: boolean;

	/** Whether this is a cargo flight */
	isCargo: boolean;
}

// ============================================================================
// INTERFACES - Data Shards
// ============================================================================

/**
 * Daily snapshot file structure
 */
export interface DailySnapshot {
	/** Snapshot date (YYYY-MM-DD) */
	date: string;

	/** ISO timestamp when the snapshot was generated */
	generatedAt: string;

	/** Total number of flights in this snapshot */
	totalFlights: number;

	/** Number of arrival flights */
	arrivals: number;

	/** Number of departure flights */
	departures: number;

	/** Number of cargo flights */
	cargo: number;

	/** Number of passenger flights */
	passenger: number;

	/** All flight records for this date */
	flights: FlightRecord[];
}

/**
 * Flight index shard (by flight number)
 * Contains last N occurrences of a specific flight
 */
export type FlightIndexShard = FlightRecord[];

/**
 * Gate index shard (by gate number)
 * Contains last N departures from a specific gate
 */
export type GateIndexShard = FlightRecord[];

// ============================================================================
// INTERFACES - API Request Parameters
// ============================================================================

/**
 * Parameters for HKIA Flight API request
 */
export interface FlightApiParams {
	/** Date to query (YYYY-MM-DD) */
	date: string;

	/** Language for response */
	lang: Language;

	/** true for arrivals, false for departures */
	arrival: boolean;

	/** true for cargo flights, false for passenger */
	cargo: boolean;
}

/**
 * Valid date range for API requests
 * API accepts D-91 to D+14 from current date
 */
export interface ApiDateRange {
	/** Earliest valid date */
	minDate: Date;

	/** Latest valid date */
	maxDate: Date;

	/** Number of past days available */
	pastDays: number;

	/** Number of future days available */
	futureDays: number;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if response is an API error
 */
export function isApiError(
	response: RawApiResponse | ApiErrorResponse,
): response is ApiErrorResponse {
	return (response as ApiErrorResponse).problemNo !== undefined;
}

/**
 * Check if flight is an arrival
 */
export function isArrival(flight: FlightRecord): boolean {
	return flight.direction === FlightDirection.Arrival;
}

/**
 * Check if flight is a departure
 */
export function isDeparture(flight: FlightRecord): boolean {
	return flight.direction === FlightDirection.Departure;
}

/**
 * Check if flight is cargo
 */
export function isCargo(flight: FlightRecord): boolean {
	return flight.category === FlightCategory.Cargo;
}

/**
 * Check if flight has codeshare partners
 */
export function hasCodeshare(flight: FlightRecord): boolean {
	return flight.codeshareCount > 0;
}

/**
 * Check if flight has via stops
 */
export function hasViaStops(flight: FlightRecord): boolean {
	return flight.viaStopCount > 0;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * API date range limits
 */
export const API_DATE_RANGE = {
	/** Days in the past from today */
	PAST_DAYS: 91,

	/** Days in the future from today */
	FUTURE_DAYS: 14,
} as const;

/**
 * Maximum entries per shard file
 */
export const MAX_SHARD_ENTRIES = 50;

/**
 * API base URL
 */
export const API_BASE_URL =
	"https://www.hongkongairport.com/flightinfo-rest/rest/flights/past";

/**
 * Top airlines at HKIA (ICAO code to IATA code mapping)
 * Based on analysis of flight frequency
 */
export const AIRLINE_CODES: Record<string, string> = {
	CPA: "CX", // Cathay Pacific
	HKE: "UO", // HK Express
	CRK: "HX", // Hong Kong Airlines
	QTR: "QR", // Qatar Airways
	MGL: "OM", // MIAT Mongolian Airlines
	FIN: "AY", // Finnair
	JAL: "JL", // Japan Airlines
	CCA: "CA", // Air China
	AAL: "AA", // American Airlines
	BAW: "BA", // British Airways
	CES: "MU", // China Eastern
	THY: "TK", // Turkish Airlines
	CHH: "HU", // Hainan Airlines
	QFA: "QF", // Qantas
	EVA: "BR", // EVA Air
	MAS: "MH", // Malaysia Airlines
	LAN: "LA", // LATAM
	HGB: "HB", // Greater Bay Airlines
	CAL: "CI", // China Airlines
	FJI: "FJ", // Fiji Airways
	ACA: "AC", // Air Canada
	CSH: "FM", // Shanghai Airlines
	AHK: "LD", // AHK Air Hong Kong (Cargo)
	ETD: "EY", // Etihad Airways
	DLH: "LH", // Lufthansa
	UAE: "EK", // Emirates
	CEB: "5J", // Cebu Pacific
	UAL: "UA", // United Airlines
	BKP: "PG", // Bangkok Airways
	GFA: "GF", // Gulf Air
};
