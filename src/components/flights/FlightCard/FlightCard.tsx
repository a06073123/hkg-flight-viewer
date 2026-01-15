/**
 * FlightCard Component
 *
 * Displays a single flight's information in a card format
 */

import type { Component } from "solid-js";
import type { FlightRecord } from "../../../types/flight";
import { FlightStatus } from "./FlightStatus";

export interface FlightCardProps {
	flight: FlightRecord;
	onSelect?: (flight: FlightRecord) => void;
}

export const FlightCard: Component<FlightCardProps> = (props) => {
	return (
		<article
			class="flight-card rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
			onClick={() => props.onSelect?.(props.flight)}
			role="button"
			tabIndex={0}
		>
			<header class="flight-card-header mb-2 flex items-center justify-between">
				<div class="flight-number">
					<span class="text-lg font-bold">
						{props.flight.operatingCarrier.no}
					</span>
					<span class="ml-2 text-sm text-gray-500">
						{props.flight.operatingCarrier.airline}
					</span>
				</div>
				<FlightStatus status={props.flight.status} />
			</header>

			<div class="flight-card-body flex items-center justify-between">
				<div class="route">
					<span class="text-sm text-gray-600">
						{props.flight.isArrival ? "From" : "To"}
					</span>
					<span class="ml-1 font-medium">
						{props.flight.primaryAirport}
					</span>
					{props.flight.hasViaStops && (
						<span class="ml-1 text-xs text-gray-400">
							(via {props.flight.viaStopCount} stop
							{props.flight.viaStopCount > 1 ? "s" : ""})
						</span>
					)}
				</div>

				<div class="time text-right">
					<span class="text-lg font-semibold">
						{props.flight.time}
					</span>
					{props.flight.gate && (
						<div class="text-sm text-gray-500">
							Gate {props.flight.gate}
						</div>
					)}
				</div>
			</div>

			{props.flight.codeshareCount > 0 && (
				<footer class="flight-card-footer mt-2 border-t pt-2 text-xs text-gray-400">
					+{props.flight.codeshareCount} codeshare
					{props.flight.codeshareCount > 1 ? "s" : ""}
				</footer>
			)}
		</article>
	);
};
