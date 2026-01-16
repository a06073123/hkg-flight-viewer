/**
 * Past Flights Page
 *
 * Historical flight data browser from archived JSON
 * Uses SolidJS createResource for data fetching
 */

import { Tabs } from "@ark-ui/solid";
import { A } from "@solidjs/router";
import {
	Calendar,
	History,
	Package,
	PlaneLanding,
	PlaneTakeoff,
	Search,
} from "lucide-solid";
import { createMemo, createSignal, Show, Suspense } from "solid-js";
import { FlightCardList } from "../../components/flights";
import { SearchBar } from "../../components/search";
import { filterFlights, sortFlightsByTime } from "../../lib/api";
import { createDailySnapshotResource } from "../../lib/resources";
import type { FlightRecord } from "../../types/flight";

// Default to yesterday (likely has complete data)
function getYesterdayHKT(): string {
	const now = new Date();
	const hkt = new Date(now.getTime() + 8 * 60 * 60 * 1000);
	hkt.setDate(hkt.getDate() - 1);
	return hkt.toISOString().split("T")[0];
}

export default function PastPage() {
	const [selectedDate, setSelectedDate] = createSignal(getYesterdayHKT());
	const [activeTab, setActiveTab] = createSignal<
		"departures" | "arrivals" | "cargo"
	>("departures");
	const [searchQuery, setSearchQuery] = createSignal("");

	// Load snapshot for selected date
	const [snapshot] = createDailySnapshotResource(selectedDate);

	const allFlights = createMemo<FlightRecord[]>(
		() => snapshot()?.flights ?? [],
	);

	// Filter by category
	const passengerArrivals = createMemo(() =>
		allFlights().filter((f: FlightRecord) => f.isArrival && !f.isCargo),
	);

	const passengerDepartures = createMemo(() =>
		allFlights().filter((f: FlightRecord) => !f.isArrival && !f.isCargo),
	);

	const cargoFlights = createMemo(() =>
		allFlights().filter((f: FlightRecord) => f.isCargo),
	);

	// Apply search filter
	const filteredArrivals = createMemo(() =>
		sortFlightsByTime(filterFlights(passengerArrivals(), searchQuery())),
	);

	const filteredDepartures = createMemo(() =>
		sortFlightsByTime(filterFlights(passengerDepartures(), searchQuery())),
	);

	const filteredCargo = createMemo(() =>
		sortFlightsByTime(filterFlights(cargoFlights(), searchQuery())),
	);

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

	// Get summary stats
	const stats = createMemo(() => {
		const flights = allFlights();
		return {
			total: flights.length,
			passenger: flights.filter((f) => !f.isCargo).length,
			cargo: flights.filter((f) => f.isCargo).length,
			arrivals: flights.filter((f) => f.isArrival).length,
			departures: flights.filter((f) => !f.isArrival).length,
		};
	});

	return (
		<div class="space-y-4">
			{/* Header */}
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-[#003580] p-2">
						<History class="h-6 w-6 text-[#FFD700]" />
					</div>
					<div>
						<h1 class="text-2xl font-bold text-[#1A1A1B]">
							Historical Data
						</h1>
						<p class="text-sm text-gray-500">
							Browse archived flight records
						</p>
					</div>
				</div>

				{/* Date Picker */}
				<div class="flex items-center gap-2">
					<Calendar class="h-4 w-4 text-[#003580]" />
					<input
						type="date"
						value={selectedDate()}
						onInput={(e) => setSelectedDate(e.currentTarget.value)}
						class="rounded-lg border-2 border-[#003580]/30 px-3 py-2 text-sm focus:border-[#003580] focus:outline-none focus:ring-1 focus:ring-[#003580]"
					/>
				</div>
			</div>

			{/* Quick Stats - HKIA Style */}
			<Show when={snapshot()}>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
					<div class="rounded-lg border-l-4 border-[#003580] bg-white p-3 shadow-sm">
						<p class="text-xs font-medium text-gray-500">Total</p>
						<p class="text-2xl font-bold text-[#003580]">
							{stats().total}
						</p>
					</div>
					<div class="rounded-lg border-l-4 border-blue-500 bg-white p-3 shadow-sm">
						<p class="text-xs font-medium text-gray-500">
							Passenger
						</p>
						<p class="text-2xl font-bold text-blue-600">
							{stats().passenger}
						</p>
					</div>
					<div class="rounded-lg border-l-4 border-orange-500 bg-white p-3 shadow-sm">
						<p class="text-xs font-medium text-gray-500">Cargo</p>
						<p class="text-2xl font-bold text-orange-600">
							{stats().cargo}
						</p>
					</div>
					<div class="rounded-lg border-l-4 border-emerald-500 bg-white p-3 shadow-sm">
						<p class="text-xs font-medium text-gray-500">
							Arrivals
						</p>
						<p class="text-2xl font-bold text-emerald-600">
							{stats().arrivals}
						</p>
					</div>
					<div class="rounded-lg border-l-4 border-[#003580] bg-white p-3 shadow-sm">
						<p class="text-xs font-medium text-gray-500">
							Departures
						</p>
						<p class="text-2xl font-bold text-[#003580]">
							{stats().departures}
						</p>
					</div>
				</div>
			</Show>

			{/* Search Bar */}
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div class="max-w-md flex-1">
					<SearchBar
						value={searchQuery()}
						onInput={setSearchQuery}
						placeholder="Search by flight number, destination, or airline..."
						resultCount={getCurrentCount()}
					/>
				</div>
				<A
					href="/flight/"
					class="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#003580] bg-white px-3 py-2 text-sm font-medium text-[#003580] hover:bg-[#003580] hover:text-white transition-colors"
				>
					<Search class="h-4 w-4" />
					Flight Lookup
				</A>
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
								Loading historical data...
							</div>
						}
					>
						<Show
							when={snapshot()}
							fallback={
								<div class="rounded-lg border-2 border-dashed bg-gray-50 py-12 text-center">
									<Calendar class="mx-auto h-12 w-12 text-gray-400" />
									<h2 class="mt-4 text-lg font-medium text-gray-900">
										No Data for Selected Date
									</h2>
									<p class="mt-2 text-gray-500">
										Try selecting a different date from the
										archive.
									</p>
								</div>
							}
						>
							<Tabs.Content value="departures">
								<FlightCardList
									flights={filteredDepartures()}
									type="departures"
									isLoading={snapshot.loading}
								/>
							</Tabs.Content>
							<Tabs.Content value="arrivals">
								<FlightCardList
									flights={filteredArrivals()}
									type="arrivals"
									isLoading={snapshot.loading}
								/>
							</Tabs.Content>
							<Tabs.Content value="cargo">
								<FlightCardList
									flights={filteredCargo()}
									type="cargo"
									isLoading={snapshot.loading}
								/>
							</Tabs.Content>
						</Show>
					</Suspense>
				</div>
			</Tabs.Root>

			{/* Archive info */}
			<Show when={snapshot()}>
				<p class="text-center text-xs text-gray-400">
					Archived at {snapshot()?.archivedAt} • Data from{" "}
					{selectedDate()}
				</p>
			</Show>
		</div>
	);
}
