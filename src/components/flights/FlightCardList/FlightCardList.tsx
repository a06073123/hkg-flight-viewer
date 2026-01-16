/**
 * Flight Card List Component
 *
 * Wrapper component that renders appropriate card type based on flight data
 * Supports: DepartureCard, ArrivalCard, CargoFlightCard
 */

import { For, Show } from "solid-js";
import type { FlightRecord } from "../../../types/flight";
import { ArrivalCard } from "../ArrivalCard";
import { CargoFlightCard } from "../CargoFlightCard";
import { DepartureCard } from "../DepartureCard";

export type FlightCardListType = "departures" | "arrivals" | "cargo";

export interface FlightCardListProps {
	flights: FlightRecord[];
	type: FlightCardListType;
	isLoading?: boolean;
}

/**
 * Loading skeleton for flight cards
 */
function FlightCardSkeleton() {
	return (
		<div class="animate-pulse rounded-lg border-2 border-gray-100 bg-white p-4">
			<div class="flex items-start gap-4">
				<div class="h-12 w-16 rounded bg-gray-200" />
				<div class="flex-1 space-y-2">
					<div class="h-5 w-24 rounded bg-gray-200" />
					<div class="h-3 w-32 rounded bg-gray-200" />
				</div>
				<div class="h-6 w-20 rounded bg-gray-200" />
			</div>
			<div class="mt-4 h-8 w-20 rounded bg-gray-200" />
			<div class="mt-4 flex gap-4 border-t border-gray-100 pt-3">
				<div class="h-6 w-24 rounded bg-gray-200" />
				<div class="h-6 w-16 rounded bg-gray-200" />
				<div class="h-6 w-20 rounded bg-gray-200" />
			</div>
		</div>
	);
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

export function FlightCardList(props: FlightCardListProps) {
	return (
		<div class="space-y-3">
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
							<Show
								when={props.type === "cargo"}
								fallback={
									<Show
										when={props.type === "arrivals"}
										fallback={
											<DepartureCard flight={flight} />
										}
									>
										<ArrivalCard flight={flight} />
									</Show>
								}
							>
								<CargoFlightCard flight={flight} />
							</Show>
						)}
					</For>
				</Show>
			</Show>
		</div>
	);
}
