/**
 * Arrival Card Component
 *
 * Displays passenger arrival flight information in a HKIA-inspired card format
 * References actual Hong Kong Airport FIDS design:
 * - Prominent belt/hall display
 * - Emerald green theme for arrivals
 * - Time and status prominently displayed on right
 * - Green origin label with airport name
 * - Codeshare partners in grid layout (5 rows x 2 columns max)
 */

import { A } from "@solidjs/router";
import { Luggage, PlaneLanding, Users } from "lucide-solid";
import { For, Show } from "solid-js";
import { getAirlineNameSync } from "../../../lib/airline-data";
import { getAirportName } from "../../../lib/airport-data";
import type { FlightRecord } from "../../../types/flight";
import { Tooltip } from "../../common";
import { FlightTimeStatus } from "../FlightCard";

export interface ArrivalCardProps {
	flight: FlightRecord;
}

export function ArrivalCard(props: ArrivalCardProps) {
	const { flight } = props;

	return (
		<div class="flight-row group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg">
			{/* Main Content Area */}
			<div class="flex">
				{/* Left: Belt Display - Emerald theme - Fixed width */}
				<div class="flex w-32 shrink-0 flex-col items-center justify-center bg-emerald-600 p-4">
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

				{/* Center: Flight Info - Fixed layout */}
				<div class="flex min-w-0 flex-1 gap-4 p-5">
					{/* Left Column: Flight details - Fixed widths */}
					<div class="flex min-w-0 flex-1 flex-row gap-x-4">
						{/* Flight Info Block - Fixed width */}
						<div class="flex w-48 shrink-0 flex-col">
							{/* Flight Number and Airline */}
							<div class="flex flex-col items-start">
								<A
									href={`/flight/${flight.operatingCarrier.no.replace(/\s+/g, "")}`}
									class="flex items-center gap-1.5 text-2xl font-bold text-emerald-700 hover:text-emerald-800"
								>
									<PlaneLanding class="h-5 w-5 shrink-0" />
									<span class="truncate">
										{flight.operatingCarrier.no}
									</span>
								</A>
								<span
									class="w-full truncate text-sm text-gray-500"
									title={`${getAirlineNameSync(flight.operatingCarrier.airline)} - ${flight.operatingCarrier.airline}`}
								>
									{getAirlineNameSync(
										flight.operatingCarrier.airline,
									)}{" "}
									- {flight.operatingCarrier.airline}
								</span>
							</div>

							{/* Origin - Emerald Label Style with Airport Name */}
							<div class="mt-3">
								<span class="inline-block rounded bg-emerald-600 px-3 py-1 text-base font-bold tracking-wider text-white shadow-sm">
									{flight.primaryAirport}
								</span>
								<p
									class="mt-1 w-full truncate text-sm text-gray-600"
									title={getAirportName(
										flight.primaryAirport,
									)}
								>
									{getAirportName(flight.primaryAirport)}
									<Show when={flight.hasViaStops}>
										<Tooltip
											content={
												<div class="space-y-1">
													<p class="font-medium">
														Route Details
													</p>
													{flight.route.map(
														(
															airport: string,
															i: number,
														) => (
															<p>
																{i + 1}.{" "}
																{airport} -{" "}
																{getAirportName(
																	airport,
																)}
															</p>
														),
													)}
												</div>
											}
											positioning={{
												placement: "bottom",
											}}
										>
											<span class="ml-2 cursor-help text-gray-400 underline decoration-dotted">
												via{" "}
												{flight.route
													.slice(1)
													.join(" → ")}
											</span>
										</Tooltip>
									</Show>
								</p>
							</div>
						</div>

						{/* Codeshare Partners - Fixed width area */}
						<div class="w-32 shrink-0">
							<Show when={flight.codeshareCount > 0}>
								<Tooltip
									content={
										<div class="space-y-1">
											<p class="font-medium">
												Codeshare Partners (
												{flight.codeshareCount})
											</p>
											{flight.flights
												.slice(1)
												.map((partner) => (
													<p>
														{partner.no} -{" "}
														{getAirlineNameSync(
															partner.airline,
														)}
													</p>
												))}
										</div>
									}
									positioning={{ placement: "bottom" }}
								>
									<div class="flex cursor-help items-start gap-2">
										<Users class="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
										<div class="grid grid-cols-1 gap-y-0.5">
											<For
												each={flight.flights.slice(
													1,
													5,
												)}
											>
												{(cs) => (
													<span class="truncate text-xs text-gray-500">
														{cs.no}
													</span>
												)}
											</For>
											<Show
												when={flight.codeshareCount > 4}
											>
												<span class="text-xs text-gray-400">
													+{flight.codeshareCount - 4}{" "}
													more
												</span>
											</Show>
										</div>
									</div>
								</Tooltip>
							</Show>
						</div>
					</div>

					{/* Right Column: Time + Status - Fixed width handled by FlightTimeStatus */}
					<div class="flex shrink-0 flex-col items-end justify-between">
						<FlightTimeStatus
							scheduledTime={flight.time}
							status={flight.status}
						/>
					</div>
				</div>
			</div>

			{/* Bottom Bar: Terminal first, then Arrival Hall */}
			<div class="flex items-center gap-6 border-t border-gray-100 bg-gray-50/50 px-5 py-3">
				{/* Terminal */}
				<div class="flex items-center gap-2">
					<span class="text-sm text-gray-600">Terminal:</span>
					<span class="text-sm font-semibold text-[#1A1A1B]">
						{flight.terminal || "T1"}
					</span>
				</div>

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

				{/* Luggage Icon */}
				<div class="ml-auto flex items-center gap-1 text-amber-600">
					<Luggage class="h-4 w-4" />
					<span class="text-xs font-medium">Baggage Claim</span>
				</div>
			</div>
		</div>
	);
}
