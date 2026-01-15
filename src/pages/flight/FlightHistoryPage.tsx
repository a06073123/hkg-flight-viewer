/**
 * Flight History Page
 *
 * Shows historical data and on-time performance for a specific flight number
 * Uses SolidJS createResource for data fetching
 */

import { A, useParams } from "@solidjs/router";
import {
	AlertTriangle,
	ArrowLeft,
	Calendar,
	Clock,
	TrendingUp,
} from "lucide-solid";
import { createMemo, For, Show } from "solid-js";
import { FlightStatus } from "../../components/flights/FlightCard";
import { createFlightHistoryResource } from "../../lib/resources";
import type { FlightRecord } from "../../types/flight";
import { StatusType } from "../../types/flight";

export default function FlightHistoryPage() {
	const params = useParams<{ no: string }>();

	const [history] = createFlightHistoryResource(() => params.no);

	const occurrences = createMemo(() => history()?.occurrences ?? []);

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
			<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">
						{params.no}
					</h1>
					<Show when={occurrences()[0]}>
						<p class="text-lg text-gray-500">
							{occurrences()[0].operatingCarrier.airline}
						</p>
					</Show>
				</div>

				<Show when={history()}>
					<div class="text-sm text-gray-400">
						Last updated: {history()?.updatedAt}
					</div>
				</Show>
			</div>

			{/* Loading State */}
			<Show when={history.loading}>
				<div class="py-12 text-center text-gray-500">
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

			{/* Stats Cards */}
			<Show when={stats()}>
				{(s) => (
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

			{/* Flight History List */}
			<Show when={occurrences().length > 0}>
				<div class="space-y-4">
					<h2 class="text-lg font-semibold text-gray-900">
						Flight History
					</h2>

					<For each={groupedByDate()}>
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
													<span class="text-sm text-gray-500">
														{flight.isArrival
															? "From"
															: "To"}{" "}
														{flight.primaryAirport}
													</span>
													<Show when={flight.gate}>
														<span class="text-sm text-gray-400">
															Gate {flight.gate}
														</span>
													</Show>
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

interface StatCardProps {
	icon: typeof Calendar;
	label: string;
	value: string;
	color: "blue" | "green" | "yellow" | "red";
}

function StatCard(props: StatCardProps) {
	const colorClasses = {
		blue: "bg-blue-50 text-blue-600",
		green: "bg-green-50 text-green-600",
		yellow: "bg-yellow-50 text-yellow-600",
		red: "bg-red-50 text-red-600",
	};

	return (
		<div class="rounded-lg border bg-white p-4 shadow-sm">
			<div class="flex items-center gap-3">
				<div class={`rounded-lg p-2 ${colorClasses[props.color]}`}>
					<props.icon class="h-5 w-5" />
				</div>
				<div>
					<div class="text-sm text-gray-500">{props.label}</div>
					<div class="text-xl font-semibold text-gray-900">
						{props.value}
					</div>
				</div>
			</div>
		</div>
	);
}
