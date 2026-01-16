/**
 * Arrival Card Component
 *
 * Displays passenger arrival flight information in a card format
 * Uses HKIA Visual DNA color palette
 *
 * Data displayed:
 * - Scheduled time
 * - Flight number(s) with codeshare partners
 * - Origin (with via stops)
 * - Arrival Hall (A/B)
 * - Baggage Belt
 * - Status
 */

import { A } from "@solidjs/router";
import { Luggage, Plane, PlaneLanding, Users } from "lucide-solid";
import { For, Show } from "solid-js";
import type { FlightRecord } from "../../../types/flight";
import { FlightStatus } from "../FlightCard";

export interface ArrivalCardProps {
	flight: FlightRecord;
}

export function ArrivalCard(props: ArrivalCardProps) {
	const { flight } = props;

	return (
		<div class="flight-row rounded-lg border-2 border-emerald-100 bg-white p-4 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md">
			{/* Header: Time + Flight Number */}
			<div class="flex items-start justify-between gap-4">
				{/* Left: Time and Flight Info */}
				<div class="flex items-start gap-4">
					{/* Scheduled Time */}
					<div class="flex flex-col items-center">
						<span class="text-2xl font-bold text-emerald-700">
							{flight.time}
						</span>
						<span class="text-[10px] uppercase tracking-wide text-gray-400">
							Scheduled
						</span>
					</div>

					{/* Flight Number and Airline */}
					<div class="min-w-0">
						<A
							href={`/flight/${flight.operatingCarrier.no.replace(/\s+/g, "")}`}
							class="flex items-center gap-2 text-lg font-bold text-[#1A1A1B] hover:text-emerald-700"
						>
							<PlaneLanding class="h-4 w-4 text-emerald-600" />
							{flight.operatingCarrier.no}
						</A>
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

			{/* Origin */}
			<div class="mt-4 flex items-center gap-2">
				<Plane class="h-4 w-4 text-gray-400" />
				<div class="flex items-center gap-2">
					<span class="inline-block rounded bg-emerald-600 px-2.5 py-1 text-sm font-bold tracking-wide text-white">
						{flight.primaryAirport}
					</span>
					<Show when={flight.hasViaStops}>
						<span class="text-xs text-gray-500">
							via {flight.route.slice(1).join(" → ")}
						</span>
					</Show>
				</div>
			</div>

			{/* Bottom Info Row: Hall, Baggage, Terminal */}
			<div class="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3">
				{/* Arrival Hall */}
				<div class="flex items-center gap-2">
					<span class="text-xs text-gray-500">Hall:</span>
					<Show
						when={flight.hall}
						fallback={<span class="text-xs text-gray-400">—</span>}
					>
						<span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
							{flight.hall}
						</span>
					</Show>
				</div>

				{/* Baggage Belt */}
				<div class="flex items-center gap-2">
					<Luggage class="h-4 w-4 text-gray-400" />
					<span class="text-xs text-gray-500">Belt:</span>
					<Show
						when={flight.baggageClaim}
						fallback={<span class="text-xs text-gray-400">—</span>}
					>
						<span class="inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
							{flight.baggageClaim}
						</span>
					</Show>
				</div>

				{/* Terminal */}
				<div class="flex items-center gap-2">
					<span class="text-xs text-gray-500">Terminal:</span>
					<span class="text-xs font-medium text-gray-700">
						{flight.terminal || "T1"}
					</span>
				</div>
			</div>
		</div>
	);
}
