/**
 * FlightHistoryTable - Unified table display for flight history
 *
 * Features:
 * - Date as first column
 * - Sortable columns (future)
 * - Consistent layout with fixed column widths
 * - Responsive design
 */

import { CompactTimeStatus } from "@/components/history/CompactTimeStatus";
import type { FlightRecord } from "@/types/flight";
import { A } from "@solidjs/router";
import { DoorOpen, Luggage, Users } from "lucide-solid";
import { For, Show } from "solid-js";

export interface FlightHistoryTableProps {
	/** Flight records to display */
	flights: FlightRecord[];
	/** Hide the flight number column (for single flight view) */
	hideFlightNo?: boolean;
	/** Show gate instead of belt for departures */
	showGate?: boolean;
}

/**
 * Fixed column widths for consistent layout
 */
const COLUMNS = {
	date: "w-[100px]",
	time: "w-[60px]",
	flight: "w-[100px]",
	route: "w-[80px]",
	checkin: "w-[80px]",
	gateBelt: "w-[60px]",
	status: "w-[160px]",
};

/**
 * Table header cell component
 */
function TableHeader(props: { children: string; class?: string }) {
	return (
		<th
			class={`px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 ${props.class ?? ""}`}
		>
			{props.children}
		</th>
	);
}

export function FlightHistoryTable(props: FlightHistoryTableProps) {
	return (
		<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<TableHeader class={COLUMNS.date}>Date</TableHeader>
							<TableHeader class={COLUMNS.time}>Time</TableHeader>
							<Show when={!props.hideFlightNo}>
								<TableHeader class={COLUMNS.flight}>
									Flight
								</TableHeader>
							</Show>
							<TableHeader class={COLUMNS.route}>
								Route
							</TableHeader>
							<TableHeader class={COLUMNS.checkin}>
								Check-in
							</TableHeader>
							<TableHeader class={COLUMNS.gateBelt}>
								{props.showGate ? "Gate" : "Gate/Belt"}
							</TableHeader>
							<TableHeader class={COLUMNS.status}>
								Status
							</TableHeader>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 bg-white">
						<For each={props.flights}>
							{(flight) => (
								<tr class="transition-colors hover:bg-gray-50">
									{/* Date */}
									<td
										class={`${COLUMNS.date} whitespace-nowrap px-3 py-2`}
									>
										<span class="text-xs font-medium text-gray-600">
											{flight.date}
										</span>
									</td>

									{/* Time */}
									<td
										class={`${COLUMNS.time} whitespace-nowrap px-3 py-2`}
									>
										<span class="text-sm font-bold tabular-nums text-[#1A1A1B]">
											{flight.time}
										</span>
									</td>

									{/* Flight Number */}
									<Show when={!props.hideFlightNo}>
										<td
											class={`${COLUMNS.flight} whitespace-nowrap px-3 py-2`}
										>
											<A
												href={`/flight/${flight.operatingCarrier.no.replace(/\s+/g, "")}`}
												class="text-sm font-semibold text-[#003580] hover:underline"
											>
												{flight.operatingCarrier.no}
											</A>
											<Show
												when={flight.codeshareCount > 0}
											>
												<span class="ml-1 text-[10px] text-gray-400">
													+{flight.codeshareCount}
												</span>
											</Show>
										</td>
									</Show>

									{/* Route */}
									<td
										class={`${COLUMNS.route} whitespace-nowrap px-3 py-2`}
									>
										<span
											class={`inline-block rounded px-2 py-0.5 text-xs font-bold text-white ${
												flight.isArrival
													? "bg-emerald-600"
													: "bg-[#C41230]"
											}`}
										>
											{flight.isArrival ? "From" : "To"}{" "}
											{flight.primaryAirport}
										</span>
									</td>

									{/* Check-in / Hall */}
									<td
										class={`${COLUMNS.checkin} whitespace-nowrap px-3 py-2`}
									>
										<Show
											when={!flight.isArrival}
											fallback={
												<Show
													when={flight.hall}
													fallback={
														<span class="text-sm text-gray-400">
															—
														</span>
													}
												>
													<span class="inline-flex items-center gap-1 text-xs text-emerald-600">
														<DoorOpen class="h-3 w-3" />
														Hall {flight.hall}
													</span>
												</Show>
											}
										>
											<Show
												when={flight.aisle}
												fallback={
													<span class="text-sm text-gray-400">
														—
													</span>
												}
											>
												<span class="inline-flex items-center gap-1 text-xs text-[#003580]">
													<Users class="h-3 w-3" />
													Row {flight.aisle}
												</span>
											</Show>
										</Show>
									</td>

									{/* Gate / Belt */}
									<td
										class={`${COLUMNS.gateBelt} whitespace-nowrap px-3 py-2`}
									>
										<Show
											when={
												flight.isArrival
													? flight.baggageClaim
													: flight.gate
											}
											fallback={
												<span class="text-sm text-gray-400">
													—
												</span>
											}
										>
											<Show
												when={flight.isArrival}
												fallback={
													<A
														href={`/gate/${flight.gate}`}
														class="gate-badge inline-block text-xs hover:ring-2 hover:ring-[#003580]/30"
													>
														{flight.gate}
													</A>
												}
											>
												<span class="inline-flex items-center gap-1 text-xs text-gray-600">
													<Luggage class="h-3 w-3" />
													{flight.baggageClaim}
												</span>
											</Show>
										</Show>
									</td>

									{/* Status */}
									<td
										class={`${COLUMNS.status} whitespace-nowrap px-3 py-2`}
									>
										<CompactTimeStatus
											scheduledTime={flight.time}
											status={flight.status}
										/>
									</td>
								</tr>
							)}
						</For>
					</tbody>
				</table>
			</div>

			{/* Empty state */}
			<Show when={props.flights.length === 0}>
				<div class="py-12 text-center text-gray-500">
					No flight records found
				</div>
			</Show>
		</div>
	);
}
