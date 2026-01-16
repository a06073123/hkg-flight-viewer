/**
 * Gate Analytics Page
 *
 * HKIA-inspired IDF (Information Display) style gate information
 * Compact design for efficient data review
 *
 * Features:
 * - Large prominent gate number (IDF style)
 * - Inline compact stats
 * - Top airlines in horizontal chips
 * - Collapsible date groups with compact rows
 */

import { Collapsible } from "@/components/common";
import { CompactTimeStatus } from "@/components/history";
import { createGateHistoryResource } from "@/lib/resources";
import type { FlightRecord } from "@/types/flight";
import { A, useParams } from "@solidjs/router";
import { AlertTriangle, ArrowLeft, Users } from "lucide-solid";
import { createMemo, For, Show } from "solid-js";

/**
 * Fixed widths for departure list columns (compact)
 */
const COLUMNS = {
	time: "w-[50px]",
	flight: "w-[90px]",
	destination: "w-[60px]",
	checkin: "w-[70px]",
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

	// Group by date (newest first)
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
		<div class="mx-auto max-w-4xl space-y-4">
			{/* Back Link */}
			<A
				href="/past"
				class="inline-flex items-center gap-1 text-sm text-[#003580] hover:text-[#0052cc] hover:underline"
			>
				<ArrowLeft class="h-4 w-4" />
				Back to Historical Data
			</A>

			{/* IDF Style Header - Compact single row */}
			<div class="overflow-hidden rounded-lg bg-[#1a1a1b] shadow-lg">
				{/* Main IDF Display */}
				<div class="flex items-center gap-6 px-6 py-4">
					{/* Gate Number - Large IDF style */}
					<div class="flex items-center gap-3">
						<span class="text-sm font-medium uppercase tracking-widest text-amber-400">
							Gate
						</span>
						<span class="font-mono text-5xl font-black tracking-tight text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]">
							{params.id}
						</span>
					</div>

					{/* Divider */}
					<div class="h-12 w-px bg-gray-700" />

					{/* Stats - Inline compact */}
					<Show when={stats()}>
						{(s) => (
							<div class="flex items-center gap-6 text-sm">
								<div class="text-center">
									<div class="text-2xl font-bold text-white">
										{s().total}
									</div>
									<div class="text-xs text-gray-400">
										Departures
									</div>
								</div>
								<div class="text-center">
									<div class="text-2xl font-bold text-white">
										{s().uniqueDates}
									</div>
									<div class="text-xs text-gray-400">
										Days
									</div>
								</div>
								<div class="text-center">
									<div class="text-2xl font-bold text-white">
										{s().avgPerDay}
									</div>
									<div class="text-xs text-gray-400">
										Per Day
									</div>
								</div>
							</div>
						)}
					</Show>

					{/* Top Airlines - Horizontal chips */}
					<Show when={stats()?.topAirlines.length}>
						<div class="ml-auto flex items-center gap-2">
							<span class="text-xs text-gray-500">Top:</span>
							<For each={stats()?.topAirlines.slice(0, 3)}>
								{([airline, count]) => (
									<span class="rounded bg-gray-800 px-2 py-1 text-xs font-medium text-gray-300">
										{airline}{" "}
										<span class="text-amber-400">
											{count}
										</span>
									</span>
								)}
							</For>
						</div>
					</Show>
				</div>
			</div>

			{/* Loading State */}
			<Show when={gateHistory.loading}>
				<div class="rounded-lg bg-white py-8 text-center text-gray-500 shadow">
					Loading gate history...
				</div>
			</Show>

			{/* Not Found State */}
			<Show when={!gateHistory.loading && !gateHistory()}>
				<div class="rounded-lg border-2 border-dashed bg-gray-50 py-8 text-center">
					<AlertTriangle class="mx-auto h-10 w-10 text-gray-400" />
					<h2 class="mt-3 text-lg font-medium text-gray-900">
						No Data Found
					</h2>
					<p class="mt-1 text-sm text-gray-500">
						No historical data available for Gate {params.id}
					</p>
				</div>
			</Show>

			{/* Departures by Date - Collapsible groups */}
			<Show when={departures().length > 0}>
				<div class="space-y-2">
					<For each={groupedByDate()}>
						{([date, flights]) => (
							<Collapsible
								trigger={
									<span class="font-medium">
										{date}
										<span class="ml-2 text-sm font-normal text-blue-200">
											({flights.length})
										</span>
									</span>
								}
							>
								{/* Table Header */}
								<div class="flex items-center gap-3 border-b bg-gray-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
									<span class={COLUMNS.time}>Time</span>
									<span class={COLUMNS.flight}>Flight</span>
									<span class={COLUMNS.destination}>
										Dest
									</span>
									<span class={COLUMNS.checkin}>
										Check-in
									</span>
									<span class={COLUMNS.status}>Status</span>
								</div>

								{/* Flight Rows - Compact */}
								<For each={flights}>
									{(flight) => (
										<div class="flex items-center gap-3 border-b border-gray-100 px-3 py-1.5 last:border-b-0 hover:bg-gray-50">
											{/* Time */}
											<span
												class={`${COLUMNS.time} shrink-0 text-sm font-bold tabular-nums text-[#1A1A1B]`}
											>
												{flight.time}
											</span>

											{/* Flight */}
											<div
												class={`${COLUMNS.flight} shrink-0`}
											>
												<A
													href={`/flight/${flight.operatingCarrier.no.replace(/\s+/g, "")}`}
													class="text-sm font-semibold text-[#003580] hover:underline"
												>
													{flight.operatingCarrier.no}
												</A>
												<Show
													when={
														flight.codeshareCount >
														0
													}
												>
													<span class="ml-0.5 text-[9px] text-gray-400">
														+{flight.codeshareCount}
													</span>
												</Show>
											</div>

											{/* Destination */}
											<span
												class={`${COLUMNS.destination} shrink-0`}
											>
												<span class="inline-block rounded bg-[#C41230] px-1.5 py-0.5 text-[10px] font-bold text-white">
													{flight.primaryAirport}
												</span>
											</span>

											{/* Check-in */}
											<span
												class={`${COLUMNS.checkin} shrink-0`}
											>
												<Show
													when={flight.aisle}
													fallback={
														<span class="text-xs text-gray-400">
															—
														</span>
													}
												>
													<span class="inline-flex items-center gap-0.5 text-[10px] text-[#003580]">
														<Users class="h-2.5 w-2.5" />
														{flight.aisle}
													</span>
												</Show>
											</span>

											{/* Status */}
											<span class={COLUMNS.status}>
												<CompactTimeStatus
													scheduledTime={flight.time}
													status={flight.status}
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
