/**
 * Flight Table Component
 *
 * Displays flight data in a FIDS (Flight Information Display System) style
 * Uses HKIA Visual DNA color palette
 */

import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import type { FlightRecord } from "../../../types/flight";
import { FlightStatus } from "../../flights/FlightCard";

export interface FlightTableProps {
	flights: FlightRecord[];
	isArrival: boolean;
	isLoading?: boolean;
}

export function FlightTable(props: FlightTableProps) {
	return (
		<div class="overflow-x-auto rounded-lg border border-[#003580]/20 bg-white shadow-md">
			<table class="min-w-full">
				<thead class="bg-[#003580] text-white">
					<tr>
						<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
							Time
						</th>
						<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
							Flight
						</th>
						<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
							{props.isArrival ? "Origin" : "Destination"}
						</th>
						<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
							Terminal
						</th>
						<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
							{props.isArrival ? "Belt" : "Gate"}
						</th>
						<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
							Status
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					<Show
						when={!props.isLoading}
						fallback={
							<tr>
								<td
									colspan="6"
									class="py-8 text-center text-gray-500"
								>
									Loading flights...
								</td>
							</tr>
						}
					>
						<For
							each={props.flights}
							fallback={
								<tr>
									<td
										colspan="6"
										class="py-8 text-center text-gray-500"
									>
										No flights found
									</td>
								</tr>
							}
						>
							{(flight) => (
								<tr class="flight-row transition-colors">
									{/* Time */}
									<td class="whitespace-nowrap px-4 py-3 text-sm font-bold text-[#1A1A1B]">
										{flight.time}
									</td>

									{/* Flight Number */}
									<td class="px-4 py-3">
										<A
											href={`/flight/${flight.operatingCarrier.no.replace(/\s+/g, "")}`}
											class="text-sm font-bold text-[#003580] hover:text-[#0052cc] hover:underline"
										>
											{flight.operatingCarrier.no}
										</A>
										<div class="text-xs text-gray-500">
											{flight.operatingCarrier.airline}
										</div>
										<Show when={flight.codeshareCount > 0}>
											<div class="text-xs text-gray-400">
												+{flight.codeshareCount}{" "}
												codeshare
											</div>
										</Show>
									</td>

									{/* Destination/Origin - Red Label Style */}
									<td class="px-4 py-3">
										<span class="inline-block rounded bg-[#C41230] px-2.5 py-1 text-xs font-bold tracking-wide text-white">
											{flight.primaryAirport}
										</span>
										<Show when={flight.hasViaStops}>
											<span class="ml-1.5 text-xs text-gray-400">
												via{" "}
												{flight.route
													.slice(0, -1)
													.join(", ")}
											</span>
										</Show>
									</td>

									{/* Terminal */}
									<td class="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-700">
										{flight.terminal || "—"}
									</td>

									{/* Gate/Belt - HKIA Style Gate Badge */}
									<td class="whitespace-nowrap px-4 py-3">
										<Show
											when={
												props.isArrival
													? flight.baggageClaim
													: flight.gate
											}
											fallback={
												<span class="text-sm text-gray-400">
													—
												</span>
											}
										>
											<A
												href={`/gate/${props.isArrival ? flight.baggageClaim : flight.gate}`}
												class="gate-badge inline-block hover:opacity-90"
											>
												{props.isArrival
													? flight.baggageClaim
													: flight.gate}
											</A>
										</Show>
									</td>

									{/* Status */}
									<td class="whitespace-nowrap px-4 py-3">
										<FlightStatus status={flight.status} />
									</td>
								</tr>
							)}
						</For>
					</Show>
				</tbody>
			</table>
		</div>
	);
}
