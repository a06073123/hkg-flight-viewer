/**
 * Live Flights Page
 *
 * Real-time flight information from HKIA API
 * Uses SolidJS createResource for data fetching
 *
 * Performance optimized: Single API call shared across all tabs
 */

import { VirtualFlightCardList } from "@/components/flights";
import { FlightSearch } from "@/components/search";
import { filterFlights, sortFlightsByTime } from "@/lib/api";
import { createLiveAllFlightsResource } from "@/lib/resources";
import type { FlightRecord } from "@/types/flight";
import { StatusType } from "@/types/flight";
import { Switch, Tabs } from "@ark-ui/solid";
import {
	Eye,
	EyeOff,
	Package,
	Plane,
	PlaneLanding,
	PlaneTakeoff,
	RefreshCw,
} from "lucide-solid";
import { createMemo, createSignal, onCleanup, Suspense } from "solid-js";

// Refresh interval: 5 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000;

/**
 * Check if a flight has completed or passed its departure time
 * For Live page: hide flights that are already departed or past their scheduled time
 */
function isCompletedFlight(flight: FlightRecord): boolean {
	// Status-based completion
	const completedStatuses: StatusType[] = [
		StatusType.Departed,
		StatusType.Landed,
		StatusType.AtGate,
		StatusType.GateClosed, // Gate closed = about to depart or already departed
	];
	
	if (completedStatuses.includes(flight.status.type)) {
		return true;
	}
	
	// Time-based completion: hide flights past their scheduled time by more than 30 minutes
	// This catches cases where status hasn't updated yet
	const now = new Date();
	const [hours, minutes] = flight.time.split(":").map(Number);
	const scheduledTime = new Date();
	scheduledTime.setHours(hours, minutes, 0, 0);
	
	// If scheduled time is in the future (e.g., 23:00 when it's 01:00), don't hide
	// Only hide if scheduled time + 30 min buffer has passed
	const bufferMs = 30 * 60 * 1000; // 30 minutes
	const timeDiff = now.getTime() - scheduledTime.getTime();
	
	// Only apply time-based filtering if:
	// 1. Flight is more than 30 minutes past scheduled time
	// 2. Time difference is reasonable (not crossing midnight boundary)
	if (timeDiff > bufferMs && timeDiff < 12 * 60 * 60 * 1000) {
		return true;
	}
	
	return false;
}

export default function LivePage() {
	const [activeTab, setActiveTab] = createSignal<
		"departures" | "arrivals" | "cargo"
	>("departures");
	const [searchQuery, setSearchQuery] = createSignal("");
	const [showCompleted, setShowCompleted] = createSignal(false);

	// Single shared resource for all flight data (optimized: 1 API call instead of 3)
	const [allFlights, { refetch }] = createLiveAllFlightsResource();
	
	// Track last refresh time
	const [lastRefreshTime, setLastRefreshTime] = createSignal(new Date());

	// Auto-refresh timer
	const timer = setInterval(() => {
		refetch();
		setLastRefreshTime(new Date());
	}, REFRESH_INTERVAL);

	onCleanup(() => clearInterval(timer));

	// Derive passenger arrivals from shared data
	const passengerArrivals = createMemo(() =>
		(allFlights() ?? []).filter((f: FlightRecord) => f.isArrival && !f.isCargo),
	);

	// Derive passenger departures from shared data
	const passengerDepartures = createMemo(() =>
		(allFlights() ?? []).filter((f: FlightRecord) => !f.isArrival && !f.isCargo),
	);

	// Derive cargo flights from shared data
	const cargoFlights = createMemo(() =>
		(allFlights() ?? []).filter((f: FlightRecord) => f.isCargo),
	);

	// Apply search filter and optionally hide completed flights
	const filteredArrivals = createMemo(() => {
		let flights = sortFlightsByTime(
			filterFlights(passengerArrivals(), searchQuery()),
		);
		if (!showCompleted()) {
			flights = flights.filter((f) => !isCompletedFlight(f));
		}
		return flights;
	});

	const filteredDepartures = createMemo(() => {
		let flights = sortFlightsByTime(
			filterFlights(passengerDepartures(), searchQuery()),
		);
		if (!showCompleted()) {
			flights = flights.filter((f) => !isCompletedFlight(f));
		}
		return flights;
	});

	const filteredCargo = createMemo(() => {
		let flights = sortFlightsByTime(
			filterFlights(cargoFlights(), searchQuery()),
		);
		if (!showCompleted()) {
			flights = flights.filter((f) => !isCompletedFlight(f));
		}
		return flights;
	});


	const isLoading = () => allFlights.loading;

	const handleRefresh = () => {
		refetch();
		setLastRefreshTime(new Date());
	};

	const lastUpdated = () =>
		lastRefreshTime().toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});

	const getCurrentCount = () => {
		switch (activeTab()) {
			case "arrivals":
				return filteredArrivals().length;
			case "departures":
				return filteredDepartures().length;
			case "cargo":
				return filteredCargo().length;
		}
	};

	return (
		<div class="space-y-3 sm:space-y-4">
			{/* Header */}
			<div class="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-2 sm:gap-3">
					<div class="rounded-lg bg-[#003580] p-1.5 sm:p-2">
						<Plane class="h-5 w-5 text-[#FFD700] sm:h-6 sm:w-6" />
					</div>
					<div>
						<h1 class="text-xl font-bold text-[#1A1A1B] sm:text-2xl">
							Live Flights
						</h1>
						<p class="text-xs text-gray-500 sm:text-sm">
							Real-time data from HKIA
						</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<span class="text-[10px] text-gray-500 xs:text-xs">
						Last updated: {lastUpdated()}
					</span>
					<button
						type="button"
						onClick={handleRefresh}
						disabled={isLoading()}
						title="Click to refresh flight data"
						class="inline-flex items-center gap-1 rounded-lg bg-[#003580] px-2 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[#002855] active:scale-95 transition-all disabled:opacity-50 sm:gap-1.5 sm:px-3 sm:py-2 sm:text-sm"
					>
						<RefreshCw
							class={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isLoading() ? "animate-spin" : ""}`}
						/>
						<span class="hidden xs:inline">{isLoading() ? "Refreshing..." : "Refresh"}</span>
					</button>
				</div>
			</div>

			{/* Search Bar and Filters */}
			<div class="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="w-full sm:max-w-lg">
					<FlightSearch
						mode="filter"
						value={searchQuery()}
						onFilter={setSearchQuery}
						placeholder="Search by flight number, destination, or airline..."
						resultCount={getCurrentCount()}
					/>
				</div>

				{/* Show Completed Toggle */}
				<Switch.Root
					checked={showCompleted()}
					onCheckedChange={(details) =>
						setShowCompleted(details.checked)
					}
					class="flex shrink-0 items-center gap-1.5 sm:gap-2"
				>
					<Switch.Label class="flex cursor-pointer items-center gap-1 text-xs text-gray-600 sm:gap-1.5 sm:text-sm">
						<EyeOff class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
					</Switch.Label>
					<Switch.Control class="inline-flex h-5 w-9 cursor-pointer items-center rounded-full bg-gray-200 p-0.5 transition-colors sm:h-6 sm:w-11 data-[state=checked]:bg-[#003580]">
						<Switch.Thumb class="h-4 w-4 rounded-full bg-white shadow-md transition-transform sm:h-5 sm:w-5 data-[state=checked]:translate-x-4 sm:data-[state=checked]:translate-x-5" />
					</Switch.Control>
					<Switch.Label class="flex cursor-pointer items-center gap-1 text-xs text-gray-600 sm:gap-1.5 sm:text-sm">
						<Eye class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
					</Switch.Label>
					<Switch.HiddenInput />
				</Switch.Root>
			</div>

			{/* Tabs - HKIA Style */}
			<Tabs.Root
				value={activeTab()}
				onValueChange={(details) =>
					setActiveTab(
						details.value as "departures" | "arrivals" | "cargo",
					)
				}
			>
				<Tabs.List class="flex gap-0.5 overflow-x-auto border-b-2 border-[#003580]/20 xs:gap-1">
					<Tabs.Trigger
						value="departures"
						class="flex shrink-0 items-center gap-1 border-b-2 border-transparent px-2 py-2 text-xs font-medium text-gray-500 transition-colors hover:text-[#003580] xs:gap-1.5 xs:px-3 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm data-selected:border-[#003580] data-selected:text-[#003580] data-selected:font-bold"
					>
						<PlaneTakeoff class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
						<span class="hidden xs:inline">Departures</span>
						<span class="rounded-full bg-[#003580]/10 px-1.5 py-0.5 text-[10px] text-[#003580] sm:px-2 sm:text-xs">
							{passengerDepartures().length}
						</span>
					</Tabs.Trigger>
					<Tabs.Trigger
						value="arrivals"
						class="flex shrink-0 items-center gap-1 border-b-2 border-transparent px-2 py-2 text-xs font-medium text-gray-500 transition-colors hover:text-emerald-600 xs:gap-1.5 xs:px-3 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm data-selected:border-emerald-500 data-selected:text-emerald-600 data-selected:font-bold"
					>
						<PlaneLanding class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
						<span class="hidden xs:inline">Arrivals</span>
						<span class="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-600 sm:px-2 sm:text-xs">
							{passengerArrivals().length}
						</span>
					</Tabs.Trigger>
					<Tabs.Trigger
						value="cargo"
						class="flex shrink-0 items-center gap-1 border-b-2 border-transparent px-2 py-2 text-xs font-medium text-gray-500 transition-colors hover:text-orange-600 xs:gap-1.5 xs:px-3 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm data-selected:border-orange-500 data-selected:text-orange-600 data-selected:font-bold"
					>
						<Package class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
						<span class="hidden xs:inline">Cargo</span>
						<span class="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] text-orange-600 sm:px-2 sm:text-xs">
							{cargoFlights().length}
						</span>
					</Tabs.Trigger>
				</Tabs.List>

				<div class="mt-3 sm:mt-4">
					<Suspense
						fallback={
							<div class="py-8 text-center text-sm text-gray-500 sm:py-12">
								Loading flights...
							</div>
						}
					>
						<Tabs.Content value="departures">
							<VirtualFlightCardList
								flights={filteredDepartures()}
								type="departures"
								isLoading={allFlights.loading}
							/>
						</Tabs.Content>
						<Tabs.Content value="arrivals">
							<VirtualFlightCardList
								flights={filteredArrivals()}
								type="arrivals"
								isLoading={allFlights.loading}
							/>
						</Tabs.Content>
						<Tabs.Content value="cargo">
							<VirtualFlightCardList
								flights={filteredCargo()}
								type="cargo"
								isLoading={allFlights.loading}
							/>
						</Tabs.Content>
					</Suspense>
				</div>
			</Tabs.Root>

			{/* Auto-refresh notice */}
			<p class="text-center text-[10px] text-gray-400 sm:text-xs">
				Data refreshes automatically every 5 minutes
			</p>
		</div>
	);
}
