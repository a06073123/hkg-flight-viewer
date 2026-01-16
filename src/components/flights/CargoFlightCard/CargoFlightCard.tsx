/**
 * Cargo Flight Card Component
 *
 * Displays cargo flight information in a card format
 * Uses HKIA Visual DNA color palette with orange accent for cargo
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
	Plane,
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
		<div class="flight-row rounded-lg border-2 border-orange-100 bg-white p-4 shadow-sm transition-all hover:border-orange-300 hover:shadow-md">
			{/* Header: Time + Flight Number + Cargo Badge */}
			<div class="flex items-start justify-between gap-4">
				{/* Left: Time and Flight Info */}
				<div class="flex items-start gap-4">
					{/* Scheduled Time */}
					<div class="flex flex-col items-center">
						<span class="text-2xl font-bold text-orange-600">
							{flight.time}
						</span>
						<span class="text-[10px] uppercase tracking-wide text-gray-400">
							Scheduled
						</span>
					</div>

					{/* Flight Number and Airline */}
					<div class="min-w-0">
						<div class="flex items-center gap-2">
							<A
								href={`/flight/${flight.operatingCarrier.no.replace(/\s+/g, "")}`}
								class="flex items-center gap-2 text-lg font-bold text-[#1A1A1B] hover:text-orange-600"
							>
								<Show
									when={isArrival()}
									fallback={
										<PlaneTakeoff class="h-4 w-4 text-orange-500" />
									}
								>
									<PlaneLanding class="h-4 w-4 text-orange-500" />
								</Show>
								{flight.operatingCarrier.no}
							</A>
							{/* Cargo Badge */}
							<span class="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-orange-700">
								<Package class="h-3 w-3" />
								Cargo
							</span>
						</div>
						<p class="text-xs text-gray-500">
							{flight.operatingCarrier.airline}
						</p>

						{/* Codeshare Partners */}
						<Show when={flight.codeshareCount > 0}>
							<div class="mt-1.5 flex items-center gap-1.5">
								<Users class="h-3 w-3 text-gray-400" />
								<div class="flex flex-wrap gap-1">
									<For each={flight.flights.slice(1)}>
										{(cs) => (
											<span class="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
												{cs.no}
											</span>
										)}
									</For>
								</div>
							</div>
						</Show>
					</div>
				</div>

				{/* Right: Status */}
				<div class="shrink-0">
					<FlightStatus status={flight.status} />
				</div>
			</div>

			{/* Origin/Destination */}
			<div class="mt-4 flex items-center gap-2">
				<Plane class="h-4 w-4 text-gray-400" />
				<div class="flex items-center gap-2">
					<span class="inline-block rounded bg-orange-500 px-2.5 py-1 text-sm font-bold tracking-wide text-white">
						{flight.primaryAirport}
					</span>
					<Show when={flight.hasViaStops}>
						<span class="text-xs text-gray-500">
							via{" "}
							{isArrival()
								? flight.route.slice(1).join(" → ")
								: flight.route.slice(0, -1).join(" → ")}
						</span>
					</Show>
				</div>
				<span class="text-xs text-gray-400">
					{isArrival() ? "Origin" : "Destination"}
				</span>
			</div>

			{/* Bottom Info Row: Stand, Gate, Terminal */}
			<div class="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3">
				{/* Stand (Cargo parking position) */}
				<div class="flex items-center gap-2">
					<Warehouse class="h-4 w-4 text-gray-400" />
					<span class="text-xs text-gray-500">Stand:</span>
					<Show
						when={flight.stand}
						fallback={<span class="text-xs text-gray-400">—</span>}
					>
						<span class="inline-block rounded bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
							{flight.stand}
						</span>
					</Show>
				</div>

				{/* Gate (for departures) or Belt (for arrivals) */}
				<Show when={!isArrival()}>
					<div class="flex items-center gap-2">
						<span class="text-xs text-gray-500">Gate:</span>
						<Show
							when={flight.gate}
							fallback={
								<span class="text-xs text-gray-400">—</span>
							}
						>
							<span class="gate-badge text-sm">
								{flight.gate}
							</span>
						</Show>
					</div>
				</Show>

				<Show when={isArrival()}>
					<div class="flex items-center gap-2">
						<span class="text-xs text-gray-500">Belt:</span>
						<Show
							when={flight.baggageClaim}
							fallback={
								<span class="text-xs text-gray-400">—</span>
							}
						>
							<span class="inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
								{flight.baggageClaim}
							</span>
						</Show>
					</div>
				</Show>

				{/* Terminal */}
				<div class="flex items-center gap-2">
					<span class="text-xs text-gray-500">Terminal:</span>
					<span class="text-xs font-medium text-gray-700">
						{flight.terminal || "T1"}
					</span>
				</div>

				{/* Direction Badge */}
				<div class="ml-auto">
					<span
						class={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
							isArrival()
								? "bg-emerald-50 text-emerald-700"
								: "bg-blue-50 text-blue-700"
						}`}
					>
						<Show
							when={isArrival()}
							fallback={<PlaneTakeoff class="h-3 w-3" />}
						>
							<PlaneLanding class="h-3 w-3" />
						</Show>
						{isArrival() ? "Arrival" : "Departure"}
					</span>
				</div>
			</div>
		</div>
	);
}
