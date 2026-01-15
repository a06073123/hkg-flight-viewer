/**
 * Tests for FlightCard Component
 */

import { describe, expect, it, vi } from "vitest";
import { renderWithUser } from "../../../test/utils";
import {
	FlightCategory,
	FlightDirection,
	type FlightRecord,
	StatusType,
} from "../../../types/flight";
import { FlightCard } from "./FlightCard";

const createMockFlight = (
	overrides: Partial<FlightRecord> = {},
): FlightRecord => ({
	id: "2026-01-15_1430_CX888_D",
	date: "2026-01-15",
	time: "14:30",
	flights: [
		{
			no: "CX 888",
			airline: "Cathay Pacific",
			iataCode: "CX",
			flightNumber: "888",
		},
		{
			no: "JL 5088",
			airline: "Japan Airlines",
			iataCode: "JL",
			flightNumber: "5088",
		},
	],
	operatingCarrier: {
		no: "CX 888",
		airline: "Cathay Pacific",
		iataCode: "CX",
		flightNumber: "888",
	},
	codeshareCount: 1,
	route: ["NRT"],
	primaryAirport: "NRT",
	hasViaStops: false,
	viaStopCount: 0,
	status: {
		raw: "Boarding",
		type: StatusType.Boarding,
		isDifferentDate: false,
	},
	gate: "35",
	terminal: "1",
	direction: FlightDirection.Departure,
	category: FlightCategory.Passenger,
	isArrival: false,
	isCargo: false,
	...overrides,
});

describe("FlightCard", () => {
	it("renders flight number and airline", () => {
		const flight = createMockFlight();
		const { getByText } = renderWithUser(() => (
			<FlightCard flight={flight} />
		));

		expect(getByText("CX 888")).toBeInTheDocument();
		expect(getByText("Cathay Pacific")).toBeInTheDocument();
	});

	it("displays scheduled time", () => {
		const flight = createMockFlight({ time: "16:45" });
		const { getByText } = renderWithUser(() => (
			<FlightCard flight={flight} />
		));

		expect(getByText("16:45")).toBeInTheDocument();
	});

	it("shows gate information for departures", () => {
		const flight = createMockFlight({ gate: "42" });
		const { getByText } = renderWithUser(() => (
			<FlightCard flight={flight} />
		));

		expect(getByText("Gate 42")).toBeInTheDocument();
	});

	it("shows destination for departures", () => {
		const flight = createMockFlight({
			isArrival: false,
			primaryAirport: "TPE",
		});
		const { getByText } = renderWithUser(() => (
			<FlightCard flight={flight} />
		));

		expect(getByText("To")).toBeInTheDocument();
		expect(getByText("TPE")).toBeInTheDocument();
	});

	it("shows origin for arrivals", () => {
		const flight = createMockFlight({
			isArrival: true,
			primaryAirport: "NRT",
		});
		const { getByText } = renderWithUser(() => (
			<FlightCard flight={flight} />
		));

		expect(getByText("From")).toBeInTheDocument();
		expect(getByText("NRT")).toBeInTheDocument();
	});

	it("displays via stops for multi-leg flights", () => {
		const flight = createMockFlight({
			hasViaStops: true,
			viaStopCount: 2,
		});
		const { getByText } = renderWithUser(() => (
			<FlightCard flight={flight} />
		));

		expect(getByText("(via 2 stops)")).toBeInTheDocument();
	});

	it("shows codeshare count", () => {
		const flight = createMockFlight({ codeshareCount: 3 });
		const { getByText } = renderWithUser(() => (
			<FlightCard flight={flight} />
		));

		expect(getByText("+3 codeshares")).toBeInTheDocument();
	});

	it("calls onSelect when clicked", async () => {
		const flight = createMockFlight();
		const onSelect = vi.fn();
		const { getByRole, user } = renderWithUser(() => (
			<FlightCard flight={flight} onSelect={onSelect} />
		));

		await user.click(getByRole("button"));
		expect(onSelect).toHaveBeenCalledWith(flight);
	});

	it("renders status badge", () => {
		const flight = createMockFlight({
			status: {
				raw: "Departed",
				type: StatusType.Departed,
				isDifferentDate: false,
			},
		});
		const { getByText } = renderWithUser(() => (
			<FlightCard flight={flight} />
		));

		expect(getByText("Departed")).toBeInTheDocument();
	});
});
