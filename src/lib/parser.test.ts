/**
 * Tests for parser utilities
 */

import { describe, expect, it } from "vitest";
import {
	FlightCategory,
	FlightDirection,
	type RawFlightListItem,
	StatusType,
} from "../types/flight";
import {
	compareFlightLists,
	detectFlightChanges,
	formatDate,
	generateFlightId,
	getApiDateRange,
	isDateInRange,
	parseDDMMYYYY,
	parseFlightIdentifier,
	parseFlightItem,
	parseStatus,
} from "./parser";

// ============================================================================
// STATUS PARSING TESTS
// ============================================================================

describe("parseStatus", () => {
	describe("simple statuses", () => {
		it("parses Cancelled", () => {
			const result = parseStatus("Cancelled");
			expect(result.type).toBe(StatusType.Cancelled);
			expect(result.raw).toBe("Cancelled");
			expect(result.isDifferentDate).toBe(false);
		});

		it("parses Delayed", () => {
			const result = parseStatus("Delayed");
			expect(result.type).toBe(StatusType.Delayed);
		});

		it("parses Boarding", () => {
			const result = parseStatus("Boarding");
			expect(result.type).toBe(StatusType.Boarding);
		});

		it("parses Boarding Soon", () => {
			const result = parseStatus("Boarding Soon");
			expect(result.type).toBe(StatusType.BoardingSoon);
		});

		it("parses Final Call", () => {
			const result = parseStatus("Final Call");
			expect(result.type).toBe(StatusType.FinalCall);
		});

		it("parses Gate Closed", () => {
			const result = parseStatus("Gate Closed");
			expect(result.type).toBe(StatusType.GateClosed);
		});
	});

	describe("departed status", () => {
		it("parses Dep with time only", () => {
			const result = parseStatus("Dep 14:30");
			expect(result.type).toBe(StatusType.Departed);
			expect(result.time).toBe("14:30");
			expect(result.date).toBeUndefined();
			expect(result.isDifferentDate).toBe(false);
		});

		it("parses Dep with time and date", () => {
			const result = parseStatus("Dep 23:45 (15/01/2026)");
			expect(result.type).toBe(StatusType.Departed);
			expect(result.time).toBe("23:45");
			expect(result.date).toBe("15/01/2026");
			expect(result.isDifferentDate).toBe(true);
		});
	});

	describe("at gate status", () => {
		it("parses At gate with time only", () => {
			const result = parseStatus("At gate 09:15");
			expect(result.type).toBe(StatusType.AtGate);
			expect(result.time).toBe("09:15");
			expect(result.isDifferentDate).toBe(false);
		});

		it("parses At gate with time and date", () => {
			const result = parseStatus("At gate 02:30 (16/01/2026)");
			expect(result.type).toBe(StatusType.AtGate);
			expect(result.time).toBe("02:30");
			expect(result.date).toBe("16/01/2026");
			expect(result.isDifferentDate).toBe(true);
		});
	});

	describe("landed status", () => {
		it("parses Landed with time", () => {
			const result = parseStatus("Landed 08:45");
			expect(result.type).toBe(StatusType.Landed);
			expect(result.time).toBe("08:45");
		});
	});

	describe("estimated status", () => {
		it("parses Est at with time only", () => {
			const result = parseStatus("Est at 16:20");
			expect(result.type).toBe(StatusType.Estimated);
			expect(result.time).toBe("16:20");
			expect(result.isDifferentDate).toBe(false);
		});

		it("parses Est at with time and date", () => {
			const result = parseStatus("Est at 01:15 (17/01/2026)");
			expect(result.type).toBe(StatusType.Estimated);
			expect(result.time).toBe("01:15");
			expect(result.date).toBe("17/01/2026");
			expect(result.isDifferentDate).toBe(true);
		});
	});

	describe("edge cases", () => {
		it("handles empty string", () => {
			const result = parseStatus("");
			expect(result.type).toBe(StatusType.Unknown);
		});

		it("handles whitespace", () => {
			const result = parseStatus("   ");
			expect(result.type).toBe(StatusType.Unknown);
		});

		it("handles unknown status", () => {
			const result = parseStatus("Some Unknown Status");
			expect(result.type).toBe(StatusType.Unknown);
			expect(result.raw).toBe("Some Unknown Status");
		});
	});
});

// ============================================================================
// FLIGHT IDENTIFIER TESTS
// ============================================================================

describe("parseFlightIdentifier", () => {
	it("parses standard flight number", () => {
		const result = parseFlightIdentifier("CX 888", "Cathay Pacific");
		expect(result.no).toBe("CX 888");
		expect(result.airline).toBe("Cathay Pacific");
		expect(result.iataCode).toBe("CX");
		expect(result.flightNumber).toBe("888");
	});

	it("parses flight number with extra spaces", () => {
		const result = parseFlightIdentifier(
			"  HX  123  ",
			"Hong Kong Airlines",
		);
		expect(result.no).toBe("HX  123");
		expect(result.iataCode).toBe("HX");
		expect(result.flightNumber).toBe("123");
	});

	it("handles IATA code only", () => {
		const result = parseFlightIdentifier("CX", "Cathay Pacific");
		expect(result.iataCode).toBe("CX");
		expect(result.flightNumber).toBe("");
	});
});

// ============================================================================
// GENERATE FLIGHT ID TESTS
// ============================================================================

describe("generateFlightId", () => {
	it("generates arrival ID", () => {
		const id = generateFlightId("2026-01-15", "14:30", "CX 888", true);
		expect(id).toBe("2026-01-15_1430_CX888_A");
	});

	it("generates departure ID", () => {
		const id = generateFlightId("2026-01-15", "16:45", "HX 123", false);
		expect(id).toBe("2026-01-15_1645_HX123_D");
	});

	it("strips spaces from flight number", () => {
		const id = generateFlightId("2026-01-15", "08:00", "CX  888", true);
		expect(id).toBe("2026-01-15_0800_CX888_A");
	});
});

// ============================================================================
// PARSE FLIGHT ITEM TESTS
// ============================================================================

describe("parseFlightItem", () => {
	const mockArrivalItem: RawFlightListItem = {
		time: "14:30",
		flight: [
			{ no: "CX 888", airline: "Cathay Pacific" },
			{ no: "JL 5088", airline: "Japan Airlines" },
		],
		origin: ["NRT"],
		status: "Landed 14:25",
		terminal: "1",
		baggage: "5",
		hall: "A",
		stand: "501",
	};

	const mockDepartureItem: RawFlightListItem = {
		time: "16:45",
		flight: [{ no: "HX 123", airline: "Hong Kong Airlines" }],
		destination: ["TPE"],
		status: "Boarding",
		terminal: "2",
		gate: "35",
		aisle: "L",
		stand: "202",
	};

	const mockViaFlightItem: RawFlightListItem = {
		time: "10:00",
		flight: [{ no: "EK 382", airline: "Emirates" }],
		origin: ["DXB", "BKK"],
		status: "Landed 09:55",
		terminal: "1",
		baggage: "12",
		hall: "B",
	};

	it("parses arrival flight correctly", () => {
		const result = parseFlightItem(
			mockArrivalItem,
			"2026-01-15",
			true,
			false,
		);

		expect(result.id).toBe("2026-01-15_1430_CX888_A");
		expect(result.date).toBe("2026-01-15");
		expect(result.time).toBe("14:30");
		expect(result.isArrival).toBe(true);
		expect(result.isCargo).toBe(false);
		expect(result.direction).toBe(FlightDirection.Arrival);
		expect(result.category).toBe(FlightCategory.Passenger);
		expect(result.operatingCarrier.no).toBe("CX 888");
		expect(result.codeshareCount).toBe(1);
		expect(result.primaryAirport).toBe("NRT");
		expect(result.hasViaStops).toBe(false);
		expect(result.baggageClaim).toBe("5");
		expect(result.hall).toBe("A");
		expect(result.gate).toBeUndefined();
	});

	it("parses departure flight correctly", () => {
		const result = parseFlightItem(
			mockDepartureItem,
			"2026-01-15",
			false,
			false,
		);

		expect(result.id).toBe("2026-01-15_1645_HX123_D");
		expect(result.isArrival).toBe(false);
		expect(result.direction).toBe(FlightDirection.Departure);
		expect(result.primaryAirport).toBe("TPE");
		expect(result.gate).toBe("35");
		expect(result.aisle).toBe("L");
		expect(result.status.type).toBe(StatusType.Boarding);
	});

	it("parses cargo flight correctly", () => {
		const result = parseFlightItem(
			mockDepartureItem,
			"2026-01-15",
			false,
			true,
		);

		expect(result.isCargo).toBe(true);
		expect(result.category).toBe(FlightCategory.Cargo);
	});

	it("parses via/transit flight correctly", () => {
		const result = parseFlightItem(
			mockViaFlightItem,
			"2026-01-15",
			true,
			false,
		);

		expect(result.route).toEqual(["DXB", "BKK"]);
		expect(result.hasViaStops).toBe(true);
		expect(result.viaStopCount).toBe(1);
		expect(result.primaryAirport).toBe("DXB"); // First airport is origin for arrivals
	});
});

// ============================================================================
// DATE UTILITY TESTS
// ============================================================================

describe("getApiDateRange", () => {
	it("calculates correct date range", () => {
		const refDate = new Date("2026-01-15T12:00:00Z");
		const range = getApiDateRange(refDate);

		expect(range.pastDays).toBe(91);
		expect(range.futureDays).toBe(14);

		// Min date should be 91 days before reference
		const expectedMin = new Date("2025-10-16T12:00:00Z");
		expect(range.minDate.getTime()).toBe(expectedMin.getTime());

		// Max date should be 14 days after reference
		const expectedMax = new Date("2026-01-29T12:00:00Z");
		expect(range.maxDate.getTime()).toBe(expectedMax.getTime());
	});
});

describe("isDateInRange", () => {
	const refDate = new Date("2026-01-15T12:00:00Z");

	it("returns true for date in range", () => {
		const testDate = new Date("2026-01-10");
		expect(isDateInRange(testDate, refDate)).toBe(true);
	});

	it("returns false for date too old", () => {
		const testDate = new Date("2025-01-01"); // Way before range
		expect(isDateInRange(testDate, refDate)).toBe(false);
	});

	it("returns false for date too far in future", () => {
		const testDate = new Date("2026-12-01"); // Way after range
		expect(isDateInRange(testDate, refDate)).toBe(false);
	});
});

describe("formatDate", () => {
	it("formats date to YYYY-MM-DD", () => {
		const date = new Date("2026-01-15T14:30:00Z");
		expect(formatDate(date)).toBe("2026-01-15");
	});
});

describe("parseDDMMYYYY", () => {
	it("parses valid date string", () => {
		const result = parseDDMMYYYY("15/01/2026");
		expect(result).not.toBeNull();
		expect(result?.getFullYear()).toBe(2026);
		expect(result?.getMonth()).toBe(0); // January = 0
		expect(result?.getDate()).toBe(15);
	});

	it("returns null for invalid format", () => {
		expect(parseDDMMYYYY("2026-01-15")).toBeNull();
		expect(parseDDMMYYYY("invalid")).toBeNull();
		expect(parseDDMMYYYY("")).toBeNull();
	});
});

// ============================================================================
// COMPARISON UTILITY TESTS
// ============================================================================

describe("detectFlightChanges", () => {
	const baseFlight = {
		id: "2026-01-15_1430_CX888_A",
		date: "2026-01-15",
		time: "14:30",
		flights: [
			{
				no: "CX 888",
				airline: "Cathay Pacific",
				iataCode: "CX",
				flightNumber: "888",
			},
		],
		operatingCarrier: {
			no: "CX 888",
			airline: "Cathay Pacific",
			iataCode: "CX",
			flightNumber: "888",
		},
		codeshareCount: 0,
		route: ["NRT"],
		primaryAirport: "NRT",
		hasViaStops: false,
		viaStopCount: 0,
		status: {
			raw: "Landed 14:25",
			type: StatusType.Landed,
			time: "14:25",
			isDifferentDate: false,
		},
		terminal: "1",
		direction: FlightDirection.Arrival,
		category: FlightCategory.Passenger,
		isArrival: true,
		isCargo: false,
	};

	it("detects status change", () => {
		const newFlight = {
			...baseFlight,
			status: {
				raw: "At gate 14:45",
				type: StatusType.AtGate,
				time: "14:45",
				isDifferentDate: false,
			},
		};

		const changes = detectFlightChanges(baseFlight, newFlight);
		expect(changes.statusChanged).toBe(true);
		expect(changes.gateChanged).toBe(false);
		expect(changes.timeChanged).toBe(false);
	});

	it("detects gate change", () => {
		const oldFlight = { ...baseFlight, gate: "35" };
		const newFlight = { ...baseFlight, gate: "36" };

		const changes = detectFlightChanges(oldFlight, newFlight);
		expect(changes.gateChanged).toBe(true);
		expect(changes.previousGate).toBe("35");
	});

	it("detects no changes", () => {
		const changes = detectFlightChanges(baseFlight, { ...baseFlight });
		expect(changes.statusChanged).toBe(false);
		expect(changes.gateChanged).toBe(false);
		expect(changes.timeChanged).toBe(false);
	});
});

describe("compareFlightLists", () => {
	const createFlight = (id: string, status: string, gate?: string) => ({
		id,
		date: "2026-01-15",
		time: "14:30",
		flights: [
			{
				no: "CX 888",
				airline: "Cathay Pacific",
				iataCode: "CX",
				flightNumber: "888",
			},
		],
		operatingCarrier: {
			no: "CX 888",
			airline: "Cathay Pacific",
			iataCode: "CX",
			flightNumber: "888",
		},
		codeshareCount: 0,
		route: ["NRT"],
		primaryAirport: "NRT",
		hasViaStops: false,
		viaStopCount: 0,
		status: {
			raw: status,
			type: StatusType.Unknown,
			isDifferentDate: false,
		},
		gate,
		terminal: "1",
		direction: FlightDirection.Arrival,
		category: FlightCategory.Passenger,
		isArrival: true,
		isCargo: false,
	});

	it("finds changed flights between lists", () => {
		const oldList = [
			createFlight("flight1", "Boarding", "35"),
			createFlight("flight2", "Boarding", "36"),
		];

		const newList = [
			createFlight("flight1", "Departed", "35"), // status changed
			createFlight("flight2", "Boarding", "37"), // gate changed
			createFlight("flight3", "New Flight"), // new flight
		];

		const changes = compareFlightLists(oldList, newList);

		expect(changes.size).toBe(2);
		expect(changes.has("flight1")).toBe(true);
		expect(changes.get("flight1")?.statusChanged).toBe(true);
		expect(changes.has("flight2")).toBe(true);
		expect(changes.get("flight2")?.gateChanged).toBe(true);
		expect(changes.has("flight3")).toBe(false); // New flights not in changes
	});
});
