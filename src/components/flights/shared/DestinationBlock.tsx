/**
 * DestinationBlock - Airport/Route Information
 *
 * Displays:
 * - Airport IATA code in colored badge (large, prominent)
 * - Airport full name
 * - Via stops tooltip if multi-leg route
 *
 * Used in the center section of flight cards
 */

import { Tooltip } from "@/components/common";
import { getAirportDataVersion, getAirportName } from "@/lib/airport-data";
import { ArrowRight } from "lucide-solid";
import { Index, Show } from "solid-js";
import type { FlightCardTheme } from "./FlightCardLayout";

export interface DestinationBlockProps {
	/** Primary airport IATA code */
	airportCode: string;
	/** Full route array for via stops display */
	route: string[];
	/** Whether this flight has via stops */
	hasViaStops: boolean;
	/** Theme for badge color */
	theme: FlightCardTheme;
	/** Whether this is an arrival (affects label and via display) */
	isArrival?: boolean;
}

const badgeStyles: Record<FlightCardTheme, string> = {
	departure: "bg-[#C41230]",
	arrival: "bg-emerald-600",
	cargo: "bg-orange-500",
};

const labelStyles: Record<FlightCardTheme, string> = {
	departure: "text-[#C41230]",
	arrival: "text-emerald-600",
	cargo: "text-orange-600",
};

export function DestinationBlock(props: DestinationBlockProps) {
	// Subscribe to airport data version to re-render when data loads
	const airportName = () => {
		getAirportDataVersion(); // Triggers reactivity
		return getAirportName(props.airportCode);
	};

	// Via stops display depends on direction
	const viaStops = () => {
		if (props.isArrival) {
			return props.route.slice(1).join(" → ");
		}
		return props.route.slice(0, -1).join(" → ");
	};

	const label = () => (props.isArrival ? "From" : "To");

	return (
		<div class="flex min-w-0 flex-1 flex-col items-center justify-center">
			{/* Label */}
			<div class="flex items-center gap-1.5">
				<ArrowRight
					class={`h-4 w-4 ${labelStyles[props.theme]} ${props.isArrival ? "rotate-180" : ""}`}
				/>
				<span
					class={`text-xs font-medium uppercase tracking-wide ${labelStyles[props.theme]}`}
				>
					{label()}
				</span>
			</div>

			{/* Airport Code Badge */}
			<span
				class={`mt-1 inline-block rounded-lg px-4 py-1.5 text-2xl font-black tracking-wider text-white shadow-sm ${badgeStyles[props.theme]}`}
			>
				{props.airportCode}
			</span>

			{/* Airport Name */}
			<p
				class="mt-1 max-w-full truncate text-center text-sm text-gray-600"
				title={airportName()}
			>
				{airportName()}
			</p>

			{/* Via Stops */}
			<Show when={props.hasViaStops}>
				<Tooltip
					content={
						<div class="space-y-1">
							<p class="font-medium">Route Details</p>
							<Index each={props.route}>
								{(airport, i) => (
									<p>
										{i + 1}. {airport()} -{" "}
										{getAirportName(airport())}
									</p>
								)}
							</Index>
						</div>
					}
					positioning={{ placement: "bottom" }}
				>
					<span class="mt-0.5 cursor-help text-xs text-gray-400 underline decoration-dotted">
						via {viaStops()}
					</span>
				</Tooltip>
			</Show>
		</div>
	);
}
