/**
 * Cargo Flight Card Component
 *
 * Displays cargo flight information in a HKIA-inspired card format
 * Uses orange theme to distinguish from passenger flights
 *
 * Data displayed:
 * - Scheduled time (prominently on right)
 * - Flight number(s) with codeshare partners in grid layout
 * - Origin/Destination with airport name
 * - Stand (parking position)
 * - Gate (for departures) / Belt (for arrivals)
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
import { getAirlineNameSync } from "../../../lib/airline-data";
import { getAirportName } from "../../../lib/airport-data";
import type { FlightRecord } from "../../../types/flight";
import { Tooltip } from "../../common";
import { FlightTimeStatus } from "../FlightCard";

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
				<div class="flex w-32 flex-col items-center justify-center bg-orange-500 p-4">
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
				<div class="flex flex-1 gap-4 p-5">
					{/* Left Column: Flight details */}
					<div class="flex flex-1 flex-row gap-x-5">
						<div class="flex flex-col">
							{/* Flight Number and Airline */}
							<div class="flex flex-col items-start">
								<div class="flex items-center gap-2">
									<A
										href={`/flight/${flight.operatingCarrier.no.replace(/\s+/g, "")}`}
										class="flex items-center gap-1.5 text-3xl font-bold text-orange-600 hover:text-orange-700"
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
								<span class="text-center text-sm text-gray-500">
									{getAirlineNameSync(
										flight.operatingCarrier.airline,
									)}{" "}
									- {flight.operatingCarrier.airline}
								</span>
							</div>

							{/* Origin/Destination - Orange Label Style with Airport Name */}
							<div class="mt-4">
								<span class="inline-block rounded bg-orange-500 px-4 py-1.5 text-lg font-bold tracking-wider text-white shadow-sm">
									{flight.primaryAirport}
								</span>
								<p class="mt-1 text-sm text-gray-600">
									{getAirportName(flight.primaryAirport)}
									<Show when={flight.hasViaStops}>
										<Tooltip
											content={
												<div class="space-y-1">
													<p class="font-medium">
														{isArrival()
															? "Origin Route"
															: "Destination Route"}
													</p>
													<For
														each={
															isArrival()
																? flight.route.slice(
																		0,
																		-1,
																	)
																: flight.route.slice(
																		1,
																	)
														}
													>
														{(code) => (
															<p>
																{code} -{" "}
																{getAirportName(
																	code,
																)}
															</p>
														)}
													</For>
												</div>
											}
											positioning={{
												placement: "bottom",
											}}
										>
											<span class="ml-2 cursor-help text-gray-400 underline decoration-dotted">
												via{" "}
												{isArrival()
													? flight.route
															.slice(1)
															.join(" → ")
													: flight.route
															.slice(0, -1)
															.join(" → ")}
											</span>
										</Tooltip>
									</Show>
								</p>
							</div>
						</div>

						{/* Codeshare Partners - Dynamic columns based on count */}
						<Show when={flight.codeshareCount > 0}>
							<Tooltip
								content={
									<div class="space-y-1">
										<p class="font-medium">
											Codeshare Partners (
											{flight.codeshareCount})
										</p>
										<For each={flight.flights.slice(1)}>
											{(partner) => (
												<p>
													{partner.no} -{" "}
													{getAirlineNameSync(
														partner.airline,
													)}
												</p>
											)}
										</For>
									</div>
								}
								positioning={{ placement: "bottom" }}
							>
								<div class="flex cursor-help items-start gap-2">
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
							</Tooltip>
						</Show>
					</div>

					{/* Right Column: Time + Status */}
					<div class="flex flex-col items-end justify-between">
						<FlightTimeStatus
							scheduledTime={flight.time}
							status={flight.status}
						/>
					</div>
				</div>
			</div>

			{/* Bottom Bar: Terminal first, then Gate/Belt, Direction */}
			<div class="flex items-center gap-6 border-t border-gray-100 bg-gray-50/50 px-5 py-3">
				{/* Terminal */}
				<div class="flex items-center gap-2">
					<span class="text-sm text-gray-600">Terminal:</span>
					<span class="text-sm font-semibold text-[#1A1A1B]">
						{flight.terminal || "T1"}
					</span>
				</div>

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
