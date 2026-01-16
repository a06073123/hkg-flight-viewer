/**
 * Live Flights Page
 *
 * Real-time flight information from HKIA API
 * Uses SolidJS createResource for data fetching
 */

import { Tabs } from "@ark-ui/solid";
import {
	Package,
	Plane,
	PlaneLanding,
	PlaneTakeoff,
	RefreshCw,
} from "lucide-solid";
import { createMemo, createSignal, onCleanup, Suspense } from "solid-js";
import { FlightCardList } from "../../components/flights";
import { SearchBar } from "../../components/search";
import { filterFlights, sortFlightsByTime } from "../../lib/api";
import {
	createLiveArrivalsResource,
	createLiveCargoResource,
	createLiveDeparturesResource,
} from "../../lib/resources";
import type { FlightRecord } from "../../types/flight";

// Refresh interval: 5 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000;

export default function LivePage() {
	const [activeTab, setActiveTab] = createSignal<
		"departures" | "arrivals" | "cargo"
	>("departures");
	const [searchQuery, setSearchQuery] = createSignal("");

	// Live data resources
	const [arrivals, { refetch: refetchArrivals }] =
		createLiveArrivalsResource();
	const [departures, { refetch: refetchDepartures }] =
		createLiveDeparturesResource();
	const [cargo, { refetch: refetchCargo }] = createLiveCargoResource();

	// Auto-refresh timer
	const timer = setInterval(() => {
		refetchArrivals();
		refetchDepartures();
		refetchCargo();
	}, REFRESH_INTERVAL);

	onCleanup(() => clearInterval(timer));

	// Filter to passenger flights only for arrivals/departures tabs
	const passengerArrivals = createMemo(() =>
		(arrivals() ?? []).filter((f: FlightRecord) => !f.isCargo),
	);

	const passengerDepartures = createMemo(() =>
		(departures() ?? []).filter((f: FlightRecord) => !f.isCargo),
	);

	// Apply search filter
	const filteredArrivals = createMemo(() =>
		sortFlightsByTime(filterFlights(passengerArrivals(), searchQuery())),
	);

	const filteredDepartures = createMemo(() =>
		sortFlightsByTime(filterFlights(passengerDepartures(), searchQuery())),
	);

	const filteredCargo = createMemo(() =>
		sortFlightsByTime(filterFlights(cargo() ?? [], searchQuery())),
	);

	const isLoading = () =>
		arrivals.loading || departures.loading || cargo.loading;

	const handleRefresh = () => {
		refetchArrivals();
		refetchDepartures();
		refetchCargo();
	};

	const lastUpdated = () =>
		new Date().toLocaleTimeString("en-HK", {
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

			{/* Search Bar - Fixed width container */}
			<div class="w-full max-w-lg">
				<SearchBar
					value={searchQuery()}
					onInput={setSearchQuery}
					placeholder="Search by flight number, destination, or airline..."
					resultCount={getCurrentCount()}
				/>
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
							{(cargo() ?? []).length}
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
								isLoading={departures.loading}
							/>
						</Tabs.Content>
						<Tabs.Content value="arrivals">
							<FlightCardList
								flights={filteredArrivals()}
								type="arrivals"
								isLoading={arrivals.loading}
							/>
						</Tabs.Content>
						<Tabs.Content value="cargo">
							<FlightCardList
								flights={filteredCargo()}
								type="cargo"
								isLoading={cargo.loading}
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
