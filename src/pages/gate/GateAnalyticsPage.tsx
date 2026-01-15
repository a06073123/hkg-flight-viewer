/**
 * Gate Analytics Page
 *
 * Shows gate usage history and statistics
 * Uses SolidJS createResource for data fetching
 */

import { A, useParams } from "@solidjs/router";
import { AlertTriangle, ArrowLeft, Clock, DoorOpen, Plane } from "lucide-solid";
import { createMemo, For, Show } from "solid-js";
import { FlightStatus } from "../../components/flights/FlightCard";
import { createGateHistoryResource } from "../../lib/resources";
import type { FlightRecord } from "../../types/flight";

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
		<div class="space-y-6">
			{/* Back Link */}
			<A
				href="/past"
				class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
			>
				<ArrowLeft class="h-4 w-4" />
				Back to Historical Data
			</A>

			{/* Header */}
			<div class="flex items-center gap-3">
				<div class="rounded-lg bg-blue-50 p-3">
					<DoorOpen class="h-8 w-8 text-blue-600" />
				</div>
				<div>
					<h1 class="text-3xl font-bold text-gray-900">
						Gate {params.id}
					</h1>
					<p class="text-gray-500">Departure Gate Analytics</p>
				</div>
			</div>

			{/* Loading State */}
			<Show when={gateHistory.loading}>
				<div class="py-12 text-center text-gray-500">
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

			{/* Stats */}
			<Show when={stats()}>
				{(s) => (
					<div class="grid gap-4 sm:grid-cols-3">
						<div class="rounded-lg border bg-white p-4 shadow-sm">
							<div class="flex items-center gap-3">
								<div class="rounded-lg bg-blue-50 p-2">
									<Plane class="h-5 w-5 text-blue-600" />
								</div>
								<div>
									<div class="text-sm text-gray-500">
										Total Departures
									</div>
									<div class="text-xl font-semibold text-gray-900">
										{s().total}
									</div>
								</div>
							</div>
						</div>
						<div class="rounded-lg border bg-white p-4 shadow-sm">
							<div class="flex items-center gap-3">
								<div class="rounded-lg bg-green-50 p-2">
									<Clock class="h-5 w-5 text-green-600" />
								</div>
								<div>
									<div class="text-sm text-gray-500">
										Days Recorded
									</div>
									<div class="text-xl font-semibold text-gray-900">
										{s().uniqueDates}
									</div>
								</div>
							</div>
						</div>
						<div class="rounded-lg border bg-white p-4 shadow-sm">
							<div class="flex items-center gap-3">
								<div class="rounded-lg bg-purple-50 p-2">
									<Plane class="h-5 w-5 text-purple-600" />
								</div>
								<div>
									<div class="text-sm text-gray-500">
										Avg per Day
									</div>
									<div class="text-xl font-semibold text-gray-900">
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
				<div class="rounded-lg border bg-white shadow-sm">
					<div class="border-b px-4 py-3">
						<h2 class="font-semibold text-gray-900">
							Top Airlines
						</h2>
					</div>
					<div class="divide-y">
						<For each={stats()?.topAirlines}>
							{([airline, count]) => (
								<div class="flex items-center justify-between px-4 py-3">
									<span class="text-gray-700">{airline}</span>
									<span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-600">
										{count} flights
									</span>
								</div>
							)}
						</For>
					</div>
				</div>
			</Show>

			{/* Recent Departures */}
			<Show when={departures().length > 0}>
				<div class="space-y-4">
					<h2 class="text-lg font-semibold text-gray-900">
						Recent Departures
					</h2>

					<For each={groupedByDate().slice(0, 7)}>
						{([date, flights]) => (
							<div class="rounded-lg border bg-white shadow-sm">
								<div class="border-b bg-gray-50 px-4 py-2">
									<span class="font-medium text-gray-700">
										{date}
									</span>
								</div>
								<div class="divide-y">
									<For each={flights}>
										{(flight) => (
											<div class="flex items-center justify-between px-4 py-3">
												<div class="flex items-center gap-4">
													<span class="text-sm font-medium text-gray-900">
														{flight.time}
													</span>
													<A
														href={`/flight/${flight.operatingCarrier.no.replace(/\s+/g, "")}`}
														class="text-sm font-medium text-blue-600 hover:underline"
													>
														{
															flight
																.operatingCarrier
																.no
														}
													</A>
													<span class="text-sm text-gray-500">
														→{" "}
														{flight.primaryAirport}
													</span>
												</div>
												<FlightStatus
													status={flight.status}
												/>
											</div>
										)}
									</For>
								</div>
							</div>
						)}
					</For>
				</div>
			</Show>
		</div>
	);
}
