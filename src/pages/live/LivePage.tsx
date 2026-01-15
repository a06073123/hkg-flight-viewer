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
import { FlightTable } from "../../components/dashboard";
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
					<div class="rounded-lg bg-green-50 p-2">
						<Plane class="h-6 w-6 text-green-600" />
					</div>
					<div>
						<h1 class="text-2xl font-bold text-gray-900">
							Live Flights
						</h1>
						<p class="text-sm text-gray-500">
							Real-time data from HKIA
						</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<span class="text-xs text-gray-400">
						Last updated: {lastUpdated()}
					</span>
					<button
						type="button"
						onClick={handleRefresh}
						disabled={isLoading()}
						class="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
					>
						<RefreshCw
							class={`h-4 w-4 ${isLoading() ? "animate-spin" : ""}`}
						/>
						Refresh
					</button>
				</div>
			</div>

			{/* Search Bar */}
			<div class="max-w-md">
				<SearchBar
					value={searchQuery()}
					onInput={setSearchQuery}
					placeholder="Search by flight number, destination, or airline..."
					resultCount={getCurrentCount()}
				/>
			</div>

			{/* Tabs */}
			<Tabs.Root
				value={activeTab()}
				onValueChange={(details) =>
					setActiveTab(
						details.value as "departures" | "arrivals" | "cargo",
					)
				}
			>
				<Tabs.List class="flex gap-1 border-b">
					<Tabs.Trigger
						value="departures"
						class="flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 data-[selected]:border-blue-500 data-[selected]:text-blue-600"
					>
						<PlaneTakeoff class="h-4 w-4" />
						Departures
						<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
							{passengerDepartures().length}
						</span>
					</Tabs.Trigger>
					<Tabs.Trigger
						value="arrivals"
						class="flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 data-[selected]:border-green-500 data-[selected]:text-green-600"
					>
						<PlaneLanding class="h-4 w-4" />
						Arrivals
						<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
							{passengerArrivals().length}
						</span>
					</Tabs.Trigger>
					<Tabs.Trigger
						value="cargo"
						class="flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 data-[selected]:border-orange-500 data-[selected]:text-orange-600"
					>
						<Package class="h-4 w-4" />
						Cargo
						<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
							{(cargo() ?? []).length}
						</span>
					</Tabs.Trigger>
					<Tabs.Indicator class="bg-blue-500" />
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
							<FlightTable
								flights={filteredDepartures()}
								isArrival={false}
								isLoading={departures.loading}
							/>
						</Tabs.Content>
						<Tabs.Content value="arrivals">
							<FlightTable
								flights={filteredArrivals()}
								isArrival={true}
								isLoading={arrivals.loading}
							/>
						</Tabs.Content>
						<Tabs.Content value="cargo">
							<FlightTable
								flights={filteredCargo()}
								isArrival={false}
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
