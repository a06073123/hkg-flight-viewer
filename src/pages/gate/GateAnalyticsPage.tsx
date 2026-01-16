/**
 * Gate Analytics Page
 *
 * Shows gate usage history and statistics
 * Uses SolidJS createResource for data fetching
 *
 * Features:
 * - Gate usage statistics
 * - Top airlines using this gate
 * - Check-in counter info for departures
 * - Codeshare partner display
 */

import { A, useParams } from "@solidjs/router";
import {
	AlertTriangle,
	ArrowLeft,
	Clock,
	Plane,
	TrendingUp,
	Users,
} from "lucide-solid";
import { createMemo, For, Show } from "solid-js";
import { Collapsible } from "../../components/common";
import { FlightTimeStatus } from "../../components/flights/shared";
import { createGateHistoryResource } from "../../lib/resources";
import type { FlightRecord } from "../../types/flight";

/**
 * Fixed widths for history list columns
 */
const HISTORY_COLUMNS = {
	time: "w-[70px]",
	flight: "w-[140px]",
	destination: "w-[100px]",
	checkin: "w-[80px]",
	status: "flex-1",
};

export default function GateAnalyticsPage() {
	const params = useParams<{ id: string }>();

	const [gateHistory] = createGateHistoryResource(() => params.id);

	const departures = createMemo(() => gateHistory()?.departures ?? []);

	// Calculate statistics
	const stats = createMemo(() => {
		const flights = departures();
		if (flights.length === 0) return null;

		// Group by airline
		const airlineCount = new Map<string, number>();
		for (const flight of flights) {
			const airline = flight.operatingCarrier.airline;
			airlineCount.set(airline, (airlineCount.get(airline) ?? 0) + 1);
		}

		// Sort by count descending
		const topAirlines = Array.from(airlineCount.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5);

		// Get unique dates
		const dates = new Set(flights.map((f: FlightRecord) => f.date));

		return {
			total: flights.length,
			uniqueDates: dates.size,
			avgPerDay: (flights.length / dates.size).toFixed(1),
			topAirlines,
		};
	});

	// Group by date
	const groupedByDate = createMemo(() => {
		const groups = new Map<string, FlightRecord[]>();
		for (const flight of departures()) {
			const existing = groups.get(flight.date) || [];
			existing.push(flight);
			groups.set(flight.date, existing);
		}
		return Array.from(groups.entries()).sort((a, b) =>
			b[0].localeCompare(a[0]),
		);
	});

	return (
		<div class="mx-auto max-w-5xl space-y-6">
			{/* Back Link */}
			<A
				href="/past"
				class="inline-flex items-center gap-1 text-sm text-[#003580] hover:text-[#0052cc] hover:underline"
			>
				<ArrowLeft class="h-4 w-4" />
				Back to Historical Data
			</A>

			{/* Header - Fixed layout */}
			<div class="rounded-xl bg-white p-6 shadow-md">
				<div class="flex items-center gap-4">
					<div class="gate-badge text-3xl">{params.id}</div>
					<div>
						<h1 class="text-3xl font-bold text-[#1A1A1B]">
							Gate {params.id}
						</h1>
						<p class="text-gray-500">Departure Gate Analytics</p>
					</div>
				</div>
			</div>

			{/* Loading State */}
			<Show when={gateHistory.loading}>
				<div class="rounded-lg bg-white py-12 text-center text-gray-500 shadow-md">
					Loading gate history...
				</div>
			</Show>

			{/* Not Found State */}
			<Show when={!gateHistory.loading && !gateHistory()}>
				<div class="rounded-lg border-2 border-dashed bg-gray-50 py-12 text-center">
					<AlertTriangle class="mx-auto h-12 w-12 text-gray-400" />
					<h2 class="mt-4 text-lg font-medium text-gray-900">
						No Data Found
					</h2>
					<p class="mt-2 text-gray-500">
						No historical data available for Gate {params.id}
					</p>
				</div>
			</Show>

			{/* Stats - Fixed grid */}
			<Show when={stats()}>
				{(s) => (
					<div class="grid gap-4 sm:grid-cols-3">
						<div class="rounded-lg border-l-4 border-[#003580] bg-white p-4 shadow-sm">
							<div class="flex items-center gap-3">
								<div class="rounded-lg bg-[#003580]/10 p-2">
									<Plane class="h-5 w-5 text-[#003580]" />
								</div>
								<div>
									<div class="text-sm font-medium text-gray-500">
										Total Departures
									</div>
									<div class="text-2xl font-bold text-[#1A1A1B]">
										{s().total}
									</div>
								</div>
							</div>
						</div>
						<div class="rounded-lg border-l-4 border-emerald-500 bg-white p-4 shadow-sm">
							<div class="flex items-center gap-3">
								<div class="rounded-lg bg-emerald-50 p-2">
									<Clock class="h-5 w-5 text-emerald-600" />
								</div>
								<div>
									<div class="text-sm font-medium text-gray-500">
										Days Recorded
									</div>
									<div class="text-2xl font-bold text-[#1A1A1B]">
										{s().uniqueDates}
									</div>
								</div>
							</div>
						</div>
						<div class="rounded-lg border-l-4 border-orange-500 bg-white p-4 shadow-sm">
							<div class="flex items-center gap-3">
								<div class="rounded-lg bg-orange-50 p-2">
									<TrendingUp class="h-5 w-5 text-orange-600" />
								</div>
								<div>
									<div class="text-sm font-medium text-gray-500">
										Avg per Day
									</div>
									<div class="text-2xl font-bold text-[#1A1A1B]">
										{s().avgPerDay}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</Show>

			{/* Top Airlines */}
			<Show when={stats()?.topAirlines.length}>
				<div class="overflow-hidden rounded-lg border bg-white shadow-sm">
					<div class="border-b bg-[#003580] px-4 py-3">
						<h2 class="font-semibold text-white">Top Airlines</h2>
					</div>
					<div class="divide-y">
						<For each={stats()?.topAirlines}>
							{([airline, count]) => (
								<div class="flex items-center justify-between px-4 py-3">
									<span class="text-gray-700">{airline}</span>
									<span class="rounded-full bg-[#003580]/10 px-2.5 py-0.5 text-sm font-medium text-[#003580]">
										{count} flights
									</span>
								</div>
							)}
						</For>
					</div>
				</div>
			</Show>

			{/* Recent Departures - Fixed layout */}
			<Show when={departures().length > 0}>
				<div class="space-y-4">
					<h2 class="text-lg font-semibold text-gray-900">
						Recent Departures
					</h2>

					<For each={groupedByDate().slice(0, 7)}>
						{([date, flights]) => (
							<Collapsible
								trigger={
									<span class="font-medium">
										{date}
										<span class="ml-2 text-sm font-normal text-blue-200">
											({flights.length} flight
											{flights.length > 1 ? "s" : ""})
										</span>
									</span>
								}
							>
								<For each={flights}>
									{(flight) => (
										<div class="flex items-center gap-4 px-4 py-3">
											{/* Time */}
											<span
												class={`${HISTORY_COLUMNS.time} shrink-0 text-sm font-bold text-[#1A1A1B]`}
											>
												{flight.time}
											</span>

											{/* Flight */}
											<div
												class={`${HISTORY_COLUMNS.flight} shrink-0`}
											>
												<A
													href={`/flight/${flight.operatingCarrier.no.replace(/\s+/g, "")}`}
													class="text-sm font-bold text-[#003580] hover:underline"
												>
													{flight.operatingCarrier.no}
												</A>
												{/* Show codeshare count */}
												<Show
													when={
														flight.codeshareCount >
														0
													}
												>
													<span class="ml-1 text-[10px] text-gray-400">
														+{flight.codeshareCount}
													</span>
												</Show>
											</div>

											{/* Destination */}
											<span
												class={`${HISTORY_COLUMNS.destination} shrink-0`}
											>
												<span class="inline-block rounded bg-[#C41230] px-2 py-0.5 text-xs font-bold text-white">
													{flight.primaryAirport}
												</span>
											</span>

											{/* Check-in */}
											<span
												class={`${HISTORY_COLUMNS.checkin} shrink-0`}
											>
												<Show
													when={flight.aisle}
													fallback={
														<span class="text-sm text-gray-400">
															—
														</span>
													}
												>
													<span class="inline-flex items-center gap-1 text-xs text-[#003580]">
														<Users class="h-3 w-3" />
														Row {flight.aisle}
													</span>
												</Show>
											</span>

											{/* Status */}
											<span
												class={`${HISTORY_COLUMNS.status}`}
											>
												<FlightTimeStatus
													scheduledTime={flight.time}
													status={flight.status}
													compact={true}
												/>
											</span>
										</div>
									)}
								</For>
							</Collapsible>
						)}
					</For>
				</div>
			</Show>
		</div>
	);
}
