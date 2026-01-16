/**
 * Flight History Page
 *
 * Shows historical data and on-time performance for a specific flight number
 * Uses SolidJS createResource for data fetching
 *
 * Displays:
 * - Flight statistics
 * - Codeshare partners
 * - Check-in counter (departures) or Hall (arrivals)
 * - Gate/Baggage claim information
 */

import { A, useParams } from "@solidjs/router";
import {
	AlertTriangle,
	ArrowLeft,
	Calendar,
	Clock,
	DoorOpen,
	Luggage,
	Plane,
	TrendingUp,
	Users,
} from "lucide-solid";
import { createMemo, For, Show } from "solid-js";
import { Collapsible } from "../../components/common";
import { FlightTimeStatus } from "../../components/flights/shared";
import { createFlightHistoryResource } from "../../lib/resources";
import type { FlightRecord } from "../../types/flight";
import { StatusType } from "../../types/flight";

/**
 * Fixed grid layout for statistics
 */
const STAT_GRID = "grid gap-4 sm:grid-cols-2 lg:grid-cols-4";

/**
 * Fixed widths for history list columns
 */
const HISTORY_COLUMNS = {
	time: "w-[70px]",
	route: "w-[120px]",
	checkinHall: "w-[80px]",
	gateBelt: "w-[70px]",
	status: "flex-1",
};

export default function FlightHistoryPage() {
	const params = useParams<{ no: string }>();

	const [history] = createFlightHistoryResource(() => params.no);

	const occurrences = createMemo(() => history()?.occurrences ?? []);

	// Get sample flight for displaying codeshare info
	const sampleFlight = createMemo(() => occurrences()[0]);

	// Calculate on-time statistics
	const stats = createMemo(() => {
		const flights = occurrences();
		if (flights.length === 0) return null;

		const total = flights.length;
		const delayed = flights.filter(
			(f: FlightRecord) => f.status.type === StatusType.Delayed,
		).length;
		const cancelled = flights.filter(
			(f: FlightRecord) => f.status.type === StatusType.Cancelled,
		).length;
		const onTime = total - delayed - cancelled;

		return {
			total,
			onTime,
			delayed,
			cancelled,
			onTimeRate: Math.round((onTime / total) * 100),
			delayRate: Math.round((delayed / total) * 100),
		};
	});

	// Group by date
	const groupedByDate = createMemo(() => {
		const groups = new Map<string, FlightRecord[]>();
		for (const flight of occurrences()) {
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
				<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div class="flex items-center gap-4">
						<div class="rounded-lg bg-[#003580] p-3">
							<Plane class="h-8 w-8 text-[#FFD700]" />
						</div>
						<div>
							<h1 class="text-3xl font-bold text-[#1A1A1B]">
								{params.no}
							</h1>
							<Show when={sampleFlight()}>
								<p class="text-lg text-gray-500">
									{sampleFlight()!.operatingCarrier.airline}
								</p>
							</Show>
						</div>
					</div>

					<Show when={history()}>
						<div class="text-sm text-gray-400">
							Last updated: {history()?.updatedAt}
						</div>
					</Show>
				</div>

				{/* Codeshare Partners */}
				<Show when={sampleFlight()?.codeshareCount ?? 0 > 0}>
					<div class="mt-4 border-t pt-4">
						<div class="flex items-center gap-2 text-sm text-gray-600">
							<Users class="h-4 w-4" />
							<span class="font-medium">Codeshare Partners:</span>
						</div>
						<div class="mt-2 flex flex-wrap gap-2">
							<For each={sampleFlight()!.flights.slice(1)}>
								{(cs) => (
									<span class="inline-block rounded bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-700">
										{cs.no}
										<span class="ml-1 text-gray-400">
											({cs.airline})
										</span>
									</span>
								)}
							</For>
						</div>
					</div>
				</Show>
			</div>

			{/* Loading State */}
			<Show when={history.loading}>
				<div class="rounded-lg bg-white py-12 text-center text-gray-500 shadow-md">
					Loading flight history...
				</div>
			</Show>

			{/* Not Found State */}
			<Show when={!history.loading && !history()}>
				<div class="rounded-lg border-2 border-dashed bg-gray-50 py-12 text-center">
					<AlertTriangle class="mx-auto h-12 w-12 text-gray-400" />
					<h2 class="mt-4 text-lg font-medium text-gray-900">
						No History Found
					</h2>
					<p class="mt-2 text-gray-500">
						No historical data available for flight {params.no}
					</p>
				</div>
			</Show>

			{/* Stats Cards - Fixed grid */}
			<Show when={stats()}>
				{(s) => (
					<div class={STAT_GRID}>
						<StatCard
							icon={Calendar}
							label="Total Records"
							value={s().total.toString()}
							color="blue"
						/>
						<StatCard
							icon={Clock}
							label="On-Time Rate"
							value={`${s().onTimeRate}%`}
							color="green"
						/>
						<StatCard
							icon={TrendingUp}
							label="Delayed"
							value={`${s().delayed} (${s().delayRate}%)`}
							color="yellow"
						/>
						<StatCard
							icon={AlertTriangle}
							label="Cancelled"
							value={s().cancelled.toString()}
							color="red"
						/>
					</div>
				)}
			</Show>

			{/* Flight History List - Fixed layout */}
			<Show when={occurrences().length > 0}>
				<div class="space-y-4">
					<h2 class="text-lg font-semibold text-gray-900">
						Flight History
					</h2>

					<For each={groupedByDate()}>
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

											{/* Route */}
											<span
												class={`${HISTORY_COLUMNS.route} shrink-0`}
											>
												<span class="inline-block rounded bg-[#C41230] px-2 py-0.5 text-xs font-bold text-white">
													{flight.isArrival
														? "From"
														: "To"}{" "}
													{flight.primaryAirport}
												</span>
											</span>

											{/* Check-in / Hall */}
											<span
												class={`${HISTORY_COLUMNS.checkinHall} shrink-0`}
											>
												<Show
													when={!flight.isArrival}
													fallback={
														<Show
															when={flight.hall}
															fallback={
																<span class="text-sm text-gray-400">
																	—
																</span>
															}
														>
															<span class="inline-flex items-center gap-1 text-xs text-emerald-600">
																<DoorOpen class="h-3 w-3" />
																Hall{" "}
																{flight.hall}
															</span>
														</Show>
													}
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
												</Show>
											</span>

											{/* Gate / Belt */}
											<span
												class={`${HISTORY_COLUMNS.gateBelt} shrink-0`}
											>
												<Show
													when={
														flight.isArrival
															? flight.baggageClaim
															: flight.gate
													}
													fallback={
														<span class="text-sm text-gray-400">
															—
														</span>
													}
												>
													<Show
														when={flight.isArrival}
														fallback={
															<span class="gate-badge inline-block text-xs">
																{flight.gate}
															</span>
														}
													>
														<span class="inline-flex items-center gap-1 text-xs text-gray-600">
															<Luggage class="h-3 w-3" />
															{
																flight.baggageClaim
															}
														</span>
													</Show>
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

interface StatCardProps {
	icon: typeof Calendar;
	label: string;
	value: string;
	color: "blue" | "green" | "yellow" | "red";
}

function StatCard(props: StatCardProps) {
	const colorClasses = {
		blue: "border-[#003580] bg-[#003580]/5 text-[#003580]",
		green: "border-emerald-500 bg-emerald-50 text-emerald-600",
		yellow: "border-amber-500 bg-amber-50 text-amber-600",
		red: "border-[#C41230] bg-red-50 text-[#C41230]",
	};

	return (
		<div
			class="rounded-lg border-l-4 bg-white p-4 shadow-sm"
			style={{
				"border-left-color":
					props.color === "blue"
						? "#003580"
						: props.color === "green"
							? "#10b981"
							: props.color === "yellow"
								? "#f59e0b"
								: "#C41230",
			}}
		>
			<div class="flex items-center gap-3">
				<div class={`rounded-lg p-2 ${colorClasses[props.color]}`}>
					<props.icon class="h-5 w-5" />
				</div>
				<div>
					<div class="text-sm font-medium text-gray-500">
						{props.label}
					</div>
					<div class="text-xl font-bold text-[#1A1A1B]">
						{props.value}
					</div>
				</div>
			</div>
		</div>
	);
}
