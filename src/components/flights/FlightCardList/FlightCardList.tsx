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
 * Loading skeleton for flight cards - HKIA style
 */
function FlightCardSkeleton() {
	return (
		<div class="animate-pulse overflow-hidden rounded-xl bg-white shadow-md">
			<div class="flex">
				{/* Left side panel skeleton */}
				<div class="w-32 bg-gray-200 p-4">
					<div class="mx-auto h-10 w-12 rounded bg-gray-300" />
				</div>
				{/* Content area skeleton */}
				<div class="flex-1 p-5">
					<div class="flex items-start justify-between">
						<div class="flex items-baseline gap-4">
							<div class="h-9 w-16 rounded bg-gray-200" />
							<div class="space-y-2">
								<div class="h-6 w-32 rounded bg-gray-200" />
								<div class="h-4 w-32 rounded bg-gray-200" />
							</div>
						</div>
						<div class="h-6 w-20 rounded bg-gray-200" />
					</div>
					<div class="mt-4 h-10 w-20 rounded bg-gray-200" />
				</div>
			</div>
			{/* Bottom bar skeleton */}
			<div class="flex gap-6 border-t border-gray-100 bg-gray-50/50 px-5 py-3">
				<div class="h-5 w-32 rounded bg-gray-200" />
				<div class="h-5 w-20 rounded bg-gray-200" />
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
