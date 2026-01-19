/**
 * Gate Analytics Page
 *
 * HKIA-inspired IDF (Information Display) style gate information
 * Mobile-first responsive design with card-based layout
 *
 * Features:
 * - Large prominent gate number (IDF style)
 * - Responsive stats display (stacked on mobile, inline on desktop)
 * - Top airlines in horizontal chips
 * - Collapsible date groups with responsive flight cards
 */

import { Collapsible } from "@/components/common";
import { CompactTimeStatus } from "@/components/history";
import { createGateHistoryResource } from "@/lib/resources";
import type { FlightRecord } from "@/types/flight";
import { A, useParams } from "@solidjs/router";
import { ArrowLeft, TriangleAlert, Users } from "lucide-solid";
import { createMemo, For, Show } from "solid-js";

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

			{/* IDF Style Header - Mobile responsive */}
			<div class="overflow-hidden rounded-lg bg-[#1a1a1b] shadow-lg">
				{/* Main IDF Display - Stacked on mobile, inline on tablet+ */}
				<div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
					{/* Gate Number - Large IDF style */}
					<div class="flex items-center justify-center gap-2 sm:gap-3 sm:justify-start">
						<span class="text-xs font-medium uppercase tracking-widest text-amber-400 sm:text-sm">
							Gate
						</span>
						<span class="font-mono text-4xl font-black tracking-tight text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)] sm:text-5xl">
							{params.id}
						</span>
					</div>

					{/* Divider - Hidden on mobile */}
					<div class="hidden h-12 w-px bg-gray-700 sm:block" />

					{/* Stats - Grid on mobile, inline on tablet+ */}
					<Show when={stats()}>
						{(s) => (
							<div class="grid grid-cols-3 gap-2 text-center sm:flex sm:items-center sm:gap-6">
								<div>
									<div class="text-xl font-bold text-white sm:text-2xl">
										{s().total}
									</div>
									<div class="text-[10px] text-gray-400 sm:text-xs">
										Departures
									</div>
								</div>
								<div>
									<div class="text-xl font-bold text-white sm:text-2xl">
										{s().uniqueDates}
									</div>
									<div class="text-[10px] text-gray-400 sm:text-xs">
										Days
									</div>
								</div>
								<div>
									<div class="text-xl font-bold text-white sm:text-2xl">
										{s().avgPerDay}
									</div>
									<div class="text-[10px] text-gray-400 sm:text-xs">
										Per Day
									</div>
								</div>
							</div>
						)}
					</Show>

					{/* Top Airlines - Wrap on mobile, inline on tablet+ */}
					<Show when={stats()?.topAirlines.length}>
						<div class="flex flex-wrap items-center gap-1.5 border-t border-gray-700 pt-3 sm:ml-auto sm:gap-2 sm:border-0 sm:pt-0">
							<span class="text-[10px] text-gray-500 sm:text-xs">Top:</span>
							<For each={stats()?.topAirlines.slice(0, 3)}>
								{([airline, count]) => (
									<span class="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-300 sm:px-2 sm:py-1 sm:text-xs">
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
					<TriangleAlert class="mx-auto h-10 w-10 text-gray-400" />
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
								{/* Table Header - Hidden on mobile */}
								<div class="hidden items-center gap-3 border-b bg-gray-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 sm:flex">
									<span class="w-[50px]">Time</span>
									<span class="w-[90px]">Flight</span>
									<span class="w-[60px]">Dest</span>
									<span class="w-[70px]">Check-in</span>
									<span class="flex-1">Status</span>
								</div>

								{/* Flight Cards - Card on mobile, row on tablet+ */}
								<div class="divide-y divide-gray-100">
									<For each={flights}>
										{(flight) => (
											<GateFlightCard flight={flight} />
										)}
									</For>
								</div>
							</Collapsible>
						)}
					</For>
				</div>
			</Show>
		</div>
	);
}

/**
 * Gate Flight Card Component
 * Mobile-first responsive card layout for flight information
 */
function GateFlightCard(props: { flight: FlightRecord }) {
	const flight = () => props.flight;

	return (
		<div class="group bg-white p-3 transition-colors hover:bg-gray-50 sm:flex sm:items-center sm:gap-3 sm:px-3 sm:py-1.5">
			{/* Mobile Layout: Stacked card */}
			<div class="flex items-start justify-between gap-2 sm:hidden">
				{/* Left: Time + Flight */}
				<div class="flex items-center gap-2">
					<span class="text-base font-bold tabular-nums text-[#1A1A1B]">
						{flight().time}
					</span>
					<A
						href={`/flight/${flight().operatingCarrier.no.replace(/\s+/g, "")}`}
						class="text-base font-semibold text-[#003580] hover:underline"
					>
						{flight().operatingCarrier.no}
					</A>
					<Show when={flight().codeshareCount > 0}>
						<span class="text-[10px] text-gray-400">
							+{flight().codeshareCount}
						</span>
					</Show>
				</div>

				{/* Right: Destination badge */}
				<span class="inline-block rounded bg-[#C41230] px-1.5 py-0.5 text-[10px] font-bold text-white">
					{flight().primaryAirport}
				</span>
			</div>

			{/* Mobile: Second row - Check-in + Status */}
			<div class="mt-2 flex items-center justify-between gap-2 sm:hidden">
				<Show
					when={flight().aisle}
					fallback={
						<span class="text-xs text-gray-400">No check-in info</span>
					}
				>
					<span class="inline-flex items-center gap-1 text-xs text-[#003580]">
						<Users class="h-3 w-3" />
						Row {flight().aisle}
					</span>
				</Show>
				<CompactTimeStatus
					scheduledTime={flight().time}
					status={flight().status}
				/>
			</div>

			{/* Desktop Layout: Inline row (hidden on mobile) */}
			{/* Time */}
			<span class="hidden w-[50px] shrink-0 text-sm font-bold tabular-nums text-[#1A1A1B] sm:block">
				{flight().time}
			</span>

			{/* Flight */}
			<div class="hidden w-[90px] shrink-0 sm:block">
				<A
					href={`/flight/${flight().operatingCarrier.no.replace(/\s+/g, "")}`}
					class="text-sm font-semibold text-[#003580] hover:underline"
				>
					{flight().operatingCarrier.no}
				</A>
				<Show when={flight().codeshareCount > 0}>
					<span class="ml-0.5 text-[9px] text-gray-400">
						+{flight().codeshareCount}
					</span>
				</Show>
			</div>

			{/* Destination */}
			<span class="hidden w-[60px] shrink-0 sm:block">
				<span class="inline-block rounded bg-[#C41230] px-1.5 py-0.5 text-[10px] font-bold text-white">
					{flight().primaryAirport}
				</span>
			</span>

			{/* Check-in */}
			<span class="hidden w-[70px] shrink-0 sm:block">
				<Show
					when={flight().aisle}
					fallback={<span class="text-xs text-gray-400">—</span>}
				>
					<span class="inline-flex items-center gap-0.5 text-[10px] text-[#003580]">
						<Users class="h-2.5 w-2.5" />
						{flight().aisle}
					</span>
				</Show>
			</span>

			{/* Status */}
			<span class="hidden flex-1 sm:block">
				<CompactTimeStatus
					scheduledTime={flight().time}
					status={flight().status}
				/>
			</span>
		</div>
	);
}
