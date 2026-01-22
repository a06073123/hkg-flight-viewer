/**
 * Virtual Flight Card List Component
 *
 * Uses TanStack Virtual for efficient rendering of large flight lists.
 * Only renders visible items in the viewport, significantly reducing
 * DOM nodes from 1000+ to ~20-30 at any time.
 *
 * Key features:
 * - Responsive 2-column layout on xl+ screens (1280px+)
 * - Dynamic height measurement (cards have variable heights)
 * - Smooth scrolling with overscan
 * - Auto-resize handling
 */

import { ArrivalCard } from "@/components/flights/ArrivalCard";
import { CargoFlightCard } from "@/components/flights/CargoFlightCard";
import { DepartureCard } from "@/components/flights/DepartureCard";
import { FlightCardSkeleton } from "@/components/flights/shared";
import { useIsXL } from "@/lib/use-breakpoint";
import type { FlightRecord } from "@/types/flight";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { createEffect, createMemo, For, Match, on, Show, Switch } from "solid-js";

export type VirtualFlightCardListType = "departures" | "arrivals" | "cargo";

export interface VirtualFlightCardListProps {
	flights: FlightRecord[];
	type: VirtualFlightCardListType;
	isLoading?: boolean;
	/** Container height - defaults to viewport-based calculation */
	height?: string;
	/** Enable 2-column layout on xl+ screens (default: true) */
	enableTwoColumn?: boolean;
}

/** Estimated item height for initial render (adjusted by measureElement) */
const ESTIMATED_ITEM_HEIGHT = 190;
/** Extra items to render above/below viewport for smoother scrolling */
const OVERSCAN_COUNT = 5;

/**
 * Empty state component
 */
function EmptyState(props: { type: VirtualFlightCardListType }) {
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
 * Render appropriate card based on type
 */
function FlightCard(props: {
	flight: FlightRecord;
	type: VirtualFlightCardListType;
}) {
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

export function VirtualFlightCardList(props: VirtualFlightCardListProps) {
	// Direct ref for scroll element (SolidJS pattern for tanstack-virtual)
	let scrollElement: HTMLDivElement | undefined;

	// Container height for scroll area
	const containerHeight = () => props.height ?? "calc(100vh - 300px)";

	// Use shared breakpoint hook for 2-column layout (deduplicates resize listeners)
	const isXL = useIsXL();
	const isTwoColumn = () => props.enableTwoColumn !== false && isXL();

	// Calculate column count for virtualizer
	const columnCount = () => (isTwoColumn() ? 2 : 1);

	// Row count based on column layout
	const rowCount = createMemo(() => 
		Math.ceil(props.flights.length / columnCount())
	);

	// Create virtualizer instance - virtualize ROWS not items
	const virtualizer = createVirtualizer({
		get count() {
			return rowCount();
		},
		getScrollElement: () => scrollElement ?? null,
		estimateSize: () => ESTIMATED_ITEM_HEIGHT,
		overscan: OVERSCAN_COUNT,
		// Gap between rows
		gap: 16,
	});

	// Get flights for a specific row
	const getFlightsForRow = (rowIndex: number): FlightRecord[] => {
		const cols = columnCount();
		const startIdx = rowIndex * cols;
		const flights: FlightRecord[] = [];
		for (let i = 0; i < cols && startIdx + i < props.flights.length; i++) {
			flights.push(props.flights[startIdx + i]);
		}
		return flights;
	};

	// Reset virtualizer when flights data changes
	createEffect(
		on(
			() => props.flights.length,
			(length, prevLength) => {
				// Only reset when data actually changes (not on initial render)
				if (prevLength !== undefined && length !== prevLength) {
					// Force remeasure all items
					virtualizer.measure();
					// Scroll to top
					virtualizer.scrollToIndex(0);
				}
			}
		)
	);

	return (
		<Show
			when={!props.isLoading}
			fallback={
				<div class="grid gap-4 xl:grid-cols-2">
					<FlightCardSkeleton />
					<FlightCardSkeleton />
					<FlightCardSkeleton />
					<FlightCardSkeleton />
					<FlightCardSkeleton />
					<FlightCardSkeleton />
				</div>
			}
		>
			<Show when={props.flights.length > 0} fallback={<EmptyState type={props.type} />}>
				{/* Scrollable container with custom scrollbar */}
				<div
					ref={scrollElement}
					class="overflow-auto rounded-lg pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
					style={{
						height: containerHeight(),
					}}
				>
					{/* Inner container with total height for scroll sizing */}
					<div
						style={{
							height: `${virtualizer.getTotalSize()}px`,
							width: "100%",
							position: "relative",
						}}
					>
						{/* Render only visible rows */}
						<For each={virtualizer.getVirtualItems()}>
							{(virtualRow) => (
								<div
									data-index={virtualRow.index}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										transform: `translateY(${virtualRow.start}px)`,
									}}
								>
									{/* Row container - grid for 2-column layout */}
									<div 
										class="grid gap-4"
										classList={{
											"grid-cols-1": !isTwoColumn(),
											"grid-cols-2": isTwoColumn(),
										}}
									>
										<For each={getFlightsForRow(virtualRow.index)}>
											{(flight) => (
												<FlightCard
													flight={flight}
													type={props.type}
												/>
											)}
										</For>
									</div>
								</div>
							)}
						</For>
					</div>
				</div>

				{/* Flight count indicator */}
				<div class="mt-2 text-center text-xs text-gray-400">
					Showing {props.flights.length} flights
				</div>
			</Show>
		</Show>
	);
}
