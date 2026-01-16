/**
 * Arrival Card Component
 *
 * Displays passenger arrival flight information in a HKIA-inspired card format
 * References actual Hong Kong Airport FIDS design:
 * - Prominent belt/hall display
 * - Emerald green theme for arrivals
 * - Clear time and flight number display
 * - Status prominently displayed
 */

import { A } from "@solidjs/router";
import { Luggage, PlaneLanding, Users } from "lucide-solid";
import { For, Show } from "solid-js";
import type { FlightRecord } from "../../../types/flight";
import { FlightStatus } from "../FlightCard";

export interface ArrivalCardProps {
	flight: FlightRecord;
}

export function ArrivalCard(props: ArrivalCardProps) {
	const { flight } = props;

	return (
		<div class="flight-row group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg">
			{/* Main Content Area */}
			<div class="flex">
				{/* Left: Belt Display - Emerald theme */}
				<div class="flex w-24 flex-col items-center justify-center bg-emerald-600 p-4">
					<Show
						when={flight.baggageClaim}
						fallback={
							<span class="text-lg font-bold text-white/50">
								—
							</span>
						}
					>
						<div class="text-center">
							<span class="text-3xl font-black text-white">
								{flight.baggageClaim}
							</span>
							<span class="block text-[10px] font-medium uppercase tracking-wider text-emerald-100">
								Belt
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
								<A
									href={`/flight/${flight.operatingCarrier.no.replace(/\s+/g, "")}`}
									class="flex items-center gap-1.5 text-xl font-bold text-emerald-700 hover:text-emerald-800"
								>
									<PlaneLanding class="h-5 w-5" />
									{flight.operatingCarrier.no}
								</A>
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

					{/* Origin - Green Label Style */}
					<div class="mt-4">
						<div class="flex items-center gap-3">
							<span class="inline-block rounded bg-emerald-600 px-4 py-1.5 text-lg font-bold tracking-wider text-white shadow-sm">
								{flight.primaryAirport}
							</span>
							<Show when={flight.hasViaStops}>
								<span class="text-sm text-gray-500">
									via {flight.route.slice(1).join(" → ")}
								</span>
							</Show>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Bar: Hall, Terminal */}
			<div class="flex items-center gap-6 border-t border-gray-100 bg-gray-50/50 px-5 py-3">
				{/* Arrival Hall */}
				<div class="flex items-center gap-2">
					<span class="text-sm text-gray-600">Arrival Hall:</span>
					<Show
						when={flight.hall}
						fallback={<span class="text-sm text-gray-400">—</span>}
					>
						<span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
							{flight.hall}
						</span>
					</Show>
				</div>

				{/* Terminal */}
				<div class="flex items-center gap-2">
					<span class="text-sm text-gray-600">Terminal:</span>
					<span class="text-sm font-semibold text-[#1A1A1B]">
						{flight.terminal || "T1"}
					</span>
				</div>

				{/* Luggage Icon */}
				<div class="ml-auto flex items-center gap-1 text-amber-600">
					<Luggage class="h-4 w-4" />
					<span class="text-xs font-medium">Baggage Claim</span>
				</div>
			</div>
		</div>
	);
}
