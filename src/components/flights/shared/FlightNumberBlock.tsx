/**
 * FlightNumberBlock - Flight Number with Codeshare Partners
 *
 * Displays:
 * - Operating carrier flight number with icon
 * - Airline name
 * - Codeshare partners list (if any)
 *
 * Used in the left section of flight cards
 */

import { Tooltip } from "@/components/common";
import { getAirlineDataVersion, getAirlineNameSync } from "@/lib/airline-data";
import type { FlightIdentifier } from "@/types/flight";
import { A } from "@solidjs/router";
import { Package, PlaneLanding, PlaneTakeoff, Users } from "lucide-solid";
import { For, Show } from "solid-js";
import type { FlightCardTheme } from "./FlightCardLayout";

export interface FlightNumberBlockProps {
	/** Operating carrier info */
	operatingCarrier: FlightIdentifier;
	/** All flights including operating carrier (first) and codeshares (rest) */
	flights: FlightIdentifier[];
	/** Total codeshare count (excluding operating carrier) */
	codeshareCount: number;
	/** Theme variant */
	theme: FlightCardTheme;
	/** Whether this is an arrival flight */
	isArrival?: boolean;
	/** Whether this is a cargo flight */
	isCargo?: boolean;
}

const flightNumberStyles: Record<FlightCardTheme, string> = {
	departure: "text-[#003580] hover:text-[#0052cc]",
	arrival: "text-emerald-700 hover:text-emerald-800",
	cargo: "text-orange-600 hover:text-orange-700",
};

export function FlightNumberBlock(props: FlightNumberBlockProps) {
	// Subscribe to airline data version to re-render when data loads
	// This must be called at the top level to track all usages of getAirlineNameSync
	const _version = () => getAirlineDataVersion();
	
	const Icon = props.isArrival ? PlaneLanding : PlaneTakeoff;
	const airlineName = () => {
		_version(); // Triggers reactivity
		return getAirlineNameSync(props.operatingCarrier.airline);
	};
	const airlineTitle = () =>
		`${airlineName()} - ${props.operatingCarrier.airline}`;

	return (
		<div class="flex w-44 shrink-0 flex-col">
			{/* Flight Number and Airline */}
			<div class="flex flex-col items-start">
				<div class="flex items-center gap-2">
					<A
						href={`/flight/${props.operatingCarrier.no.replace(/\s+/g, "")}`}
						class={`flex items-center gap-1.5 text-2xl font-bold ${flightNumberStyles[props.theme]}`}
					>
						<Icon class="h-5 w-5 shrink-0" />
						<span class="truncate">
							{props.operatingCarrier.no}
						</span>
					</A>
					{/* Cargo Badge */}
					<Show when={props.isCargo}>
						<span class="inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold uppercase text-orange-700">
							<Package class="h-3 w-3" />
							Cargo
						</span>
					</Show>
				</div>
				<span
					class="w-full truncate text-sm text-gray-500"
					title={airlineTitle()}
				>
					{airlineName()} - {props.operatingCarrier.airline}
				</span>
			</div>

			{/* Codeshare Partners */}
			<Show when={props.codeshareCount > 0}>
				<div class="mt-2">
					<Tooltip
						content={
							<div class="space-y-1">
								<p class="font-medium">
									Codeshare Partners ({props.codeshareCount})
								</p>
								<For each={props.flights.slice(1)}>
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
						<div class="flex cursor-help items-center gap-1.5">
							<Users class="h-3.5 w-3.5 shrink-0 text-gray-400" />
							<div class="flex flex-wrap gap-x-2 gap-y-0.5">
								<For each={props.flights.slice(1, 4)}>
									{(cs) => (
										<span class="text-xs text-gray-500">
											{cs.no}
										</span>
									)}
								</For>
								<Show when={props.codeshareCount > 3}>
									<span class="text-xs text-gray-400">
										+{props.codeshareCount - 3}
									</span>
								</Show>
							</div>
						</div>
					</Tooltip>
				</div>
			</Show>
		</div>
	);
}
