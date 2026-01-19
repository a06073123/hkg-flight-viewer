/**
 * Live Flights Page
 *
 * Real-time flight information from HKIA API
 * Uses SolidJS createResource for data fetching
 *
 * Performance optimized: Single API call shared across all tabs
 */

import { FlightCardList } from "@/components/flights";
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

	// Auto-refresh timer
	const timer = setInterval(() => {
		refetch();
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
	};

	const lastUpdated = () =>
		new Date().toLocaleTimeString("en-US", {
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
		<div class="space-y-4">
			{/* Header */}
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-[#003580] p-2">
						<Plane class="h-6 w-6 text-[#FFD700]" />
					</div>
					<div>
						<h1 class="text-2xl font-bold text-[#1A1A1B]">
							Live Flights
						</h1>
						<p class="text-sm text-gray-500">
							Real-time data from HKIA
						</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<span class="text-xs text-gray-500">
						Last updated: {lastUpdated()}
					</span>
					<button
						type="button"
						onClick={handleRefresh}
						disabled={isLoading()}
						class="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#003580] bg-white px-3 py-2 text-sm font-medium text-[#003580] shadow-sm hover:bg-[#003580] hover:text-white transition-colors disabled:opacity-50"
					>
						<RefreshCw
							class={`h-4 w-4 ${isLoading() ? "animate-spin" : ""}`}
						/>
						Refresh
					</button>
				</div>
			</div>

			{/* Search Bar and Filters */}
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="w-full max-w-lg">
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
					class="flex items-center gap-2"
				>
					<Switch.Label class="flex cursor-pointer items-center gap-1.5 text-sm text-gray-600">
						<EyeOff class="h-4 w-4" />
					</Switch.Label>
					<Switch.Control class="inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-200 p-0.5 transition-colors data-[state=checked]:bg-[#003580]">
						<Switch.Thumb class="h-5 w-5 rounded-full bg-white shadow-md transition-transform data-[state=checked]:translate-x-5" />
					</Switch.Control>
					<Switch.Label class="flex cursor-pointer items-center gap-1.5 text-sm text-gray-600">
						<Eye class="h-4 w-4" />
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
				<Tabs.List class="flex gap-1 border-b-2 border-[#003580]/20">
					<Tabs.Trigger
						value="departures"
						class="flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#003580] data-selected:border-[#003580] data-selected:text-[#003580] data-selected:font-bold"
					>
						<PlaneTakeoff class="h-4 w-4" />
						Departures
						<span class="rounded-full bg-[#003580]/10 px-2 py-0.5 text-xs text-[#003580]">
							{passengerDepartures().length}
						</span>
					</Tabs.Trigger>
					<Tabs.Trigger
						value="arrivals"
						class="flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:text-emerald-600 data-selected:border-emerald-500 data-selected:text-emerald-600 data-selected:font-bold"
					>
						<PlaneLanding class="h-4 w-4" />
						Arrivals
						<span class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-600">
							{passengerArrivals().length}
						</span>
					</Tabs.Trigger>
					<Tabs.Trigger
						value="cargo"
						class="flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:text-orange-600 data-selected:border-orange-500 data-selected:text-orange-600 data-selected:font-bold"
					>
						<Package class="h-4 w-4" />
						Cargo
						<span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">
							{cargoFlights().length}
						</span>
					</Tabs.Trigger>
				</Tabs.List>

				<div class="mt-4">
					<Suspense
						fallback={
							<div class="py-12 text-center text-gray-500">
								Loading flights...
							</div>
						}
					>
						<Tabs.Content value="departures">
							<FlightCardList
								flights={filteredDepartures()}
								type="departures"
								isLoading={allFlights.loading}
							/>
						</Tabs.Content>
						<Tabs.Content value="arrivals">
							<FlightCardList
								flights={filteredArrivals()}
								type="arrivals"
								isLoading={allFlights.loading}
							/>
						</Tabs.Content>
						<Tabs.Content value="cargo">
							<FlightCardList
								flights={filteredCargo()}
								type="cargo"
								isLoading={allFlights.loading}
							/>
						</Tabs.Content>
					</Suspense>
				</div>
			</Tabs.Root>

			{/* Auto-refresh notice */}
			<p class="text-center text-xs text-gray-400">
				Data refreshes automatically every 5 minutes
			</p>
		</div>
	);
}
