/**
 * FlightNumberBlock - Flight Number with Codeshare Partners
 *
 * Displays:
 * - Operating carrier flight number with icon
 * - Airline name
 * - Codeshare partners list (if any)
 *
 * Used in the left section of flight cards
 * 
 * Mobile-first responsive design:
 * - Compact layout on mobile (full width, smaller text)
 * - Fixed width on tablet+ for consistent alignment
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
		<div class="flex w-full shrink-0 flex-col xs:w-auto sm:w-36 md:w-44">
			{/* Flight Number and Airline */}
			<div class="flex flex-col items-start">
				<div class="flex items-center gap-1.5 sm:gap-2">
					<A
						href={`/flight/${props.operatingCarrier.no.replace(/\s+/g, "")}`}
						class={`flex items-center gap-1 text-lg font-bold sm:gap-1.5 sm:text-xl md:text-2xl ${flightNumberStyles[props.theme]}`}
					>
						<Icon class="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
						<span class="truncate">
							{props.operatingCarrier.no}
						</span>
					</A>
					{/* Cargo Badge */}
					<Show when={props.isCargo}>
						<span class="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-orange-700 sm:gap-1 sm:px-2 sm:text-xs">
							<Package class="h-2.5 w-2.5 sm:h-3 sm:w-3" />
							<span class="hidden xs:inline">Cargo</span>
						</span>
					</Show>
				</div>
				<span
					class="w-full truncate text-xs text-gray-500 sm:text-sm"
					title={airlineTitle()}
				>
					{airlineName()}
				</span>
			</div>

			{/* Codeshare Partners */}
			<Show when={props.codeshareCount > 0}>
				<div class="mt-1.5 sm:mt-2">
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
						<div class="flex cursor-help items-center gap-1 sm:gap-1.5">
							<Users class="h-3 w-3 shrink-0 text-gray-400 sm:h-3.5 sm:w-3.5" />
							<div class="flex flex-wrap gap-x-1.5 gap-y-0.5 sm:gap-x-2">
								<For each={props.flights.slice(1, 4)}>
									{(cs) => (
										<span class="text-[10px] text-gray-500 sm:text-xs">
											{cs.no}
										</span>
									)}
								</For>
								<Show when={props.codeshareCount > 3}>
									<span class="text-[10px] text-gray-400 sm:text-xs">
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
