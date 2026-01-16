/**
 * Departure Card Component
 *
 * Displays passenger departure flight information in a HKIA-inspired card format
 * References actual Hong Kong Airport FIDS design:
 * - Large gate number with yellow on blue
 * - Time and status prominently displayed on right
 * - Red destination label with airport name
 * - Codeshare partners in grid layout (5 rows x 2 columns max)
 */

import { A } from "@solidjs/router";
import { Clock, DoorOpen, PlaneTakeoff, Users } from "lucide-solid";
import { For, Show } from "solid-js";
import { getAirportName } from "../../../lib/airport-data";
import type { FlightRecord } from "../../../types/flight";
import { FlightStatus } from "../FlightCard";

export interface DepartureCardProps {
	flight: FlightRecord;
}

export function DepartureCard(props: DepartureCardProps) {
	const { flight } = props;

	return (
		<div class="flight-row group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg">
			{/* Main Content Area */}
			<div class="flex">
				{/* Left: Gate Display - HKIA Style (Blue background, Yellow text) */}
				<div class="flex w-32 flex-col items-center justify-center bg-[#003580] p-4">
					<Show
						when={flight.gate}
						fallback={
							<span class="text-lg font-bold text-[#FFD700]/50">
								—
							</span>
						}
					>
						<A
							href={`/gate/${flight.gate}`}
							class="text-center hover:opacity-80"
						>
							<span class="text-3xl font-black text-[#FFD700]">
								{flight.gate}
							</span>
							<span class="block text-[10px] font-medium uppercase tracking-wider text-blue-200">
								Gate
							</span>
						</A>
					</Show>
				</div>

				{/* Center: Flight Info */}
				<div class="flex flex-1 gap-4 p-5">
					{/* Left Column: Flight details */}
					<div class="flex flex-1 flex-row gap-x-5">
						<div class="flex flex-col">
							{/* Flight Number and Airline */}
							<div class="flex flex-col items-start">
								<A
									href={`/flight/${flight.operatingCarrier.no.replace(/\s+/g, "")}`}
									class="flex items-center gap-1.5 text-3xl font-bold text-[#003580] hover:text-[#0052cc]"
								>
									<PlaneTakeoff class="h-5 w-5" />
									{flight.operatingCarrier.no}
								</A>
								<span class="text-sm text-center text-gray-500">
									{flight.operatingCarrier.airline}
								</span>
							</div>
							{/* Destination - HKIA Red Label Style with Airport Name */}
							<div class="mt-4">
								<span class="inline-block rounded bg-[#C41230] px-4 py-1.5 text-lg font-bold tracking-wider text-white shadow-sm">
									{flight.primaryAirport}
								</span>
								<p class="mt-1 text-sm text-gray-600">
									{getAirportName(flight.primaryAirport)}
									<Show when={flight.hasViaStops}>
										<span class="ml-2 text-gray-400">
											via{" "}
											{flight.route
												.slice(0, -1)
												.join(" → ")}
										</span>
									</Show>
								</p>
							</div>
						</div>

						{/* Codeshare Partners - Dynamic columns based on count */}
						<Show when={flight.codeshareCount > 0}>
							<div class="flex items-start gap-2">
								<Users class="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
								<div
									class={`grid gap-x-4 gap-y-0.5 ${flight.codeshareCount > 5 ? "grid-cols-2" : "grid-cols-1"}`}
								>
									<For each={flight.flights.slice(1, 11)}>
										{(cs) => (
											<span class="text-xs text-gray-500">
												{cs.no}
											</span>
										)}
									</For>
								</div>
							</div>
						</Show>
					</div>
					{/* Right Column: Time + Status */}
					<div class="flex flex-col items-end justify-between">
						{/* Scheduled Time - Large */}
						<div class="text-right">
							<div class="flex items-center gap-1.5 text-gray-400">
								<Clock class="h-3.5 w-3.5" />
								<span class="text-xs uppercase">Scheduled</span>
							</div>
							<span class="text-4xl font-black tabular-nums text-[#1A1A1B]">
								{flight.time}
							</span>
						</div>

						{/* Status */}
						<div class="mt-2">
							<FlightStatus status={flight.status} />
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Bar: Terminal first, then Check-in */}
			<div class="flex items-center gap-6 border-t border-gray-100 bg-gray-50/50 px-5 py-3">
				{/* Terminal */}
				<div class="flex items-center gap-2">
					<span class="text-sm text-gray-600">Terminal:</span>
					<span class="text-sm font-semibold text-[#1A1A1B]">
						{flight.terminal || "T1"}
					</span>
				</div>

				{/* Check-in Counter */}
				<div class="flex items-center gap-2">
					<DoorOpen class="h-4 w-4 text-[#003580]" />
					<span class="text-sm text-gray-600">Check-in:</span>
					<Show
						when={flight.aisle}
						fallback={<span class="text-sm text-gray-400">—</span>}
					>
						<span class="rounded bg-[#003580] px-2.5 py-0.5 text-sm font-bold text-white">
							Row {flight.aisle}
						</span>
					</Show>
				</div>
			</div>
		</div>
	);
}
