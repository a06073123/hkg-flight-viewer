/**
 * Flight Card List Component
 *
 * Wrapper component that renders appropriate card type based on flight data
 * Supports: DepartureCard, ArrivalCard, CargoFlightCard
 */

import { ArrivalCard } from "@/components/flights/ArrivalCard";
import { CargoFlightCard } from "@/components/flights/CargoFlightCard";
import { DepartureCard } from "@/components/flights/DepartureCard";
import { FlightCardSkeleton } from "@/components/flights/shared";
import type { FlightRecord } from "@/types/flight";
import { For, Match, Show, Switch } from "solid-js";

export type FlightCardListType = "departures" | "arrivals" | "cargo";

export interface FlightCardListProps {
	flights: FlightRecord[];
	type: FlightCardListType;
	isLoading?: boolean;
}

/**
 * Empty state component
 */
function EmptyState(props: { type: FlightCardListType }) {
	const getMessage = () => {
		switch (props.type) {
			case "departures":
				return "No departures found";
			case "arrivals":
				return "No arrivals found";
			case "cargo":
				return "No cargo flights found";
		}
	};

	return (
		<div class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-12">
			<p class="text-gray-500">{getMessage()}</p>
			<p class="mt-1 text-sm text-gray-400">
				Try adjusting your search or check back later
			</p>
		</div>
	);
}

/**
 * Render appropriate card based on type using Switch/Match (cleaner than nested Show)
 */
function FlightCard(props: { flight: FlightRecord; type: FlightCardListType }) {
	return (
		<Switch>
			<Match when={props.type === "cargo"}>
				<CargoFlightCard flight={props.flight} />
			</Match>
			<Match when={props.type === "arrivals"}>
				<ArrivalCard flight={props.flight} />
			</Match>
			<Match when={props.type === "departures"}>
				<DepartureCard flight={props.flight} />
			</Match>
		</Switch>
	);
}

export function FlightCardList(props: FlightCardListProps) {
	return (
		<div class="space-y-4">
			<Show
				when={!props.isLoading}
				fallback={
					<>
						<FlightCardSkeleton />
						<FlightCardSkeleton />
						<FlightCardSkeleton />
						<FlightCardSkeleton />
						<FlightCardSkeleton />
					</>
				}
			>
				<Show
					when={props.flights.length > 0}
					fallback={<EmptyState type={props.type} />}
				>
					<For each={props.flights}>
						{(flight) => (
							<FlightCard flight={flight} type={props.type} />
						)}
					</For>
				</Show>
			</Show>
		</div>
	);
}
