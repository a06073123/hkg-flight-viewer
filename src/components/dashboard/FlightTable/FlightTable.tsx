/**
 * Flight Table Component
 *
 * Displays flight data in a responsive table format
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
		<div class="overflow-x-auto rounded-lg border bg-white shadow">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
							Time
						</th>
						<th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
							Flight
						</th>
						<th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
							{props.isArrival ? "Origin" : "Destination"}
						</th>
						<th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
							Terminal
						</th>
						<th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
							{props.isArrival ? "Belt" : "Gate"}
						</th>
						<th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
							Status
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
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
								<tr class="transition-colors hover:bg-gray-50">
									<td class="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
										{flight.time}
									</td>
									<td class="px-4 py-3">
										<A
											href={`/flight/${flight.operatingCarrier.no.replace(/\s+/g, "")}`}
											class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
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
									<td class="px-4 py-3">
										<span class="text-sm font-medium">
											{flight.primaryAirport}
										</span>
										<Show when={flight.hasViaStops}>
											<span class="ml-1 text-xs text-gray-400">
												(via{" "}
												{flight.route
													.slice(0, -1)
													.join(", ")}
												)
											</span>
										</Show>
									</td>
									<td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
										{flight.terminal || "—"}
									</td>
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
												class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
											>
												{props.isArrival
													? flight.baggageClaim
													: flight.gate}
											</A>
										</Show>
									</td>
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
