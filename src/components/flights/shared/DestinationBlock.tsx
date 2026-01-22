/**
 * DestinationBlock - Airport/Route Information
 *
 * Displays:
 * - Airport IATA code in colored badge (large, prominent)
 * - Airport full name
 * - Via stops tooltip if multi-leg route
 *
 * Used in the center section of flight cards
 * 
 * Mobile-first responsive design:
 * - Compact centered layout on mobile
 * - Larger badges and text on tablet+
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
			return props.route.slice(1);
		}
		return props.route.slice(0, -1);
	};

	// Compact via display - just show count if multiple
	const viaDisplay = () => {
		const stops = viaStops();
		if (stops.length === 0) return "";
		if (stops.length === 1) return `via ${stops[0]}`;
		return `via ${stops[0]} +${stops.length - 1}`;
	};

	const label = () => (props.isArrival ? "From" : "To");

	return (
		<div class="flex min-w-0 flex-1 flex-col items-center justify-center">
			{/* Label */}
			<div class="flex items-center gap-1">
				<ArrowRight
					class={`h-3 w-3 sm:h-4 sm:w-4 ${labelStyles[props.theme]} ${props.isArrival ? "rotate-180" : ""}`}
				/>
				<span
					class={`text-[10px] font-medium uppercase tracking-wide sm:text-xs ${labelStyles[props.theme]}`}
				>
					{label()}
				</span>
			</div>

			{/* Airport Code Badge */}
			<span
				class={`mt-0.5 inline-block rounded-md px-2.5 py-1 text-lg font-black tracking-wider text-white shadow-sm sm:mt-1 sm:rounded-lg sm:px-4 sm:py-1.5 sm:text-2xl ${badgeStyles[props.theme]}`}
			>
				{props.airportCode}
			</span>

			{/* Airport Name */}
			<p
				class="mt-0.5 max-w-full truncate text-center text-xs text-gray-600 sm:mt-1 sm:text-sm"
				title={airportName()}
			>
				{airportName()}
			</p>

			{/* Via Stops - compact single line */}
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
					<span class="mt-0.5 max-w-full cursor-help truncate text-[10px] text-gray-400 underline decoration-dotted sm:text-xs">
						{viaDisplay()}
					</span>
				</Tooltip>
			</Show>
		</div>
	);
}
