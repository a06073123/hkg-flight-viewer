/**
 * Cargo Flight Card Component
 *
 * Displays cargo flight information in a HKIA-inspired card format
 * Uses orange theme to distinguish from passenger flights
 *
 * Data displayed:
 * - Scheduled time
 * - Flight number(s) with codeshare partners
 * - Origin/Destination (based on direction)
 * - Stand (parking position)
 * - Gate (for departures)
 * - Status
 */

import { A } from "@solidjs/router";
import {
	Package,
	PlaneLanding,
	PlaneTakeoff,
	Users,
	Warehouse,
} from "lucide-solid";
import { For, Show } from "solid-js";
import type { FlightRecord } from "../../../types/flight";
import { FlightStatus } from "../FlightCard";

export interface CargoFlightCardProps {
	flight: FlightRecord;
}

export function CargoFlightCard(props: CargoFlightCardProps) {
	const { flight } = props;
	const isArrival = () => flight.isArrival;

	return (
		<div class="flight-row group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg">
			{/* Main Content Area */}
			<div class="flex">
				{/* Left: Stand Display - Orange theme */}
				<div class="flex w-24 flex-col items-center justify-center bg-orange-500 p-4">
					<Show
						when={flight.stand}
						fallback={
							<span class="text-lg font-bold text-white/50">
								—
							</span>
						}
					>
						<div class="text-center">
							<span class="text-2xl font-black text-white">
								{flight.stand}
							</span>
							<span class="block text-[10px] font-medium uppercase tracking-wider text-orange-100">
								Stand
							</span>
						</div>
					</Show>
				</div>

				{/* Center: Flight Info */}
				<div class="flex flex-1 flex-col p-5">
					{/* Top Row: Time + Flight Number + Status */}
					<div class="flex items-start justify-between gap-4">
						<div class="flex items-baseline gap-4">
							{/* Time - Large and Bold */}
							<span class="text-3xl font-black tabular-nums text-[#1A1A1B]">
								{flight.time}
							</span>

							{/* Flight Number */}
							<div>
								<div class="flex items-center gap-2">
									<A
										href={`/flight/${flight.operatingCarrier.no.replace(/\s+/g, "")}`}
										class="flex items-center gap-1.5 text-xl font-bold text-orange-600 hover:text-orange-700"
									>
										<Show
											when={isArrival()}
											fallback={
												<PlaneTakeoff class="h-5 w-5" />
											}
										>
											<PlaneLanding class="h-5 w-5" />
										</Show>
										{flight.operatingCarrier.no}
									</A>
									{/* Cargo Badge */}
									<span class="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold uppercase text-orange-700">
										<Package class="h-3 w-3" />
										Cargo
									</span>
								</div>
								<p class="text-sm text-gray-500">
									{flight.operatingCarrier.airline}
								</p>
							</div>
						</div>

						{/* Status - Right aligned */}
						<div class="shrink-0">
							<FlightStatus status={flight.status} />
						</div>
					</div>

					{/* Codeshare Partners */}
					<Show when={flight.codeshareCount > 0}>
						<div class="mt-2 flex items-center gap-2">
							<Users class="h-3.5 w-3.5 text-gray-400" />
							<div class="flex flex-wrap gap-1.5">
								<For each={flight.flights.slice(1)}>
									{(cs) => (
										<span class="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
											{cs.no}
										</span>
									)}
								</For>
							</div>
						</div>
					</Show>

					{/* Origin/Destination - Orange Label Style */}
					<div class="mt-4">
						<div class="flex items-center gap-3">
							<span class="inline-block rounded bg-orange-500 px-4 py-1.5 text-lg font-bold tracking-wider text-white shadow-sm">
								{flight.primaryAirport}
							</span>
							<span class="text-sm font-medium text-gray-500">
								{isArrival() ? "Origin" : "Destination"}
							</span>
							<Show when={flight.hasViaStops}>
								<span class="text-sm text-gray-400">
									via{" "}
									{isArrival()
										? flight.route.slice(1).join(" → ")
										: flight.route.slice(0, -1).join(" → ")}
								</span>
							</Show>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Bar: Gate/Belt, Terminal, Direction */}
			<div class="flex items-center gap-6 border-t border-gray-100 bg-gray-50/50 px-5 py-3">
				{/* Gate (for departures) or Belt (for arrivals) */}
				<Show when={!isArrival()}>
					<div class="flex items-center gap-2">
						<span class="text-sm text-gray-600">Gate:</span>
						<Show
							when={flight.gate}
							fallback={
								<span class="text-sm text-gray-400">—</span>
							}
						>
							<A
								href={`/gate/${flight.gate}`}
								class="inline-block rounded bg-[#003580] px-2.5 py-0.5 text-sm font-bold text-[#FFD700] hover:opacity-90"
							>
								{flight.gate}
							</A>
						</Show>
					</div>
				</Show>

				<Show when={isArrival()}>
					<div class="flex items-center gap-2">
						<span class="text-sm text-gray-600">Belt:</span>
						<Show
							when={flight.baggageClaim}
							fallback={
								<span class="text-sm text-gray-400">—</span>
							}
						>
							<span class="rounded bg-amber-500 px-2.5 py-0.5 text-sm font-bold text-white">
								{flight.baggageClaim}
							</span>
						</Show>
					</div>
				</Show>

				{/* Terminal */}
				<div class="flex items-center gap-2">
					<span class="text-sm text-gray-600">Terminal:</span>
					<span class="text-sm font-semibold text-[#1A1A1B]">
						{flight.terminal || "T1"}
					</span>
				</div>

				{/* Direction Badge - Right aligned */}
				<div class="ml-auto">
					<span
						class={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
							isArrival()
								? "bg-emerald-100 text-emerald-700"
								: "bg-blue-100 text-blue-700"
						}`}
					>
						<Show
							when={isArrival()}
							fallback={<PlaneTakeoff class="h-3.5 w-3.5" />}
						>
							<PlaneLanding class="h-3.5 w-3.5" />
						</Show>
						{isArrival() ? "Arrival" : "Departure"}
					</span>
				</div>

				{/* Cargo Icon */}
				<div class="flex items-center gap-1 text-orange-600">
					<Warehouse class="h-4 w-4" />
				</div>
			</div>
		</div>
	);
}
