/**
 * Past Flights Page
 *
 * Historical flight data browser from archived JSON
 * Uses SolidJS createResource for data fetching
 *
 * Supports URL parameter: /past/:date
 * Date formats: yyyy-MM-dd or yyyyMMdd
 */

import { DatePicker } from "@/components/common";
import { FlightCardList } from "@/components/flights";
import { FlightSearch } from "@/components/search";
import { filterFlights, sortFlightsByTime } from "@/lib/api";
import { getYesterdayHKT, parseDateParam } from "@/lib/date-utils";
import { createDailySnapshotResource } from "@/lib/resources";
import type { FlightRecord } from "@/types/flight";
import { Tabs } from "@ark-ui/solid";
import { useNavigate, useParams } from "@solidjs/router";
import {
	Calendar,
	History,
	Package,
	PlaneLanding,
	PlaneTakeoff,
} from "lucide-solid";
import {
	createEffect,
	createMemo,
	createSignal,
	Show,
	Suspense,
} from "solid-js";

export default function PastPage() {
	const params = useParams<{ date?: string }>();
	const navigate = useNavigate();

	// Initialize date from URL param or default to yesterday
	const initialDate = () => parseDateParam(params.date) ?? getYesterdayHKT();
	const [selectedDate, setSelectedDate] = createSignal(initialDate());
	const [activeTab, setActiveTab] = createSignal<
		"departures" | "arrivals" | "cargo"
	>("departures");
	const [searchQuery, setSearchQuery] = createSignal("");

	// Sync URL when date changes
	const handleDateChange = (date: string) => {
		setSelectedDate(date);
		navigate(`/past/${date}`, { replace: true });
	};

	// Update date when URL param changes (including when navigating to /past without param)
	createEffect(() => {
		const parsed = parseDateParam(params.date);
		const newDate = parsed ?? getYesterdayHKT();
		if (newDate !== selectedDate()) {
			setSelectedDate(newDate);
		}
	});

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
		<div class="space-y-3 sm:space-y-4">
			{/* Header */}
			<div class="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-2 sm:gap-3">
					<div class="rounded-lg bg-[#003580] p-1.5 sm:p-2">
						<History class="h-5 w-5 text-[#FFD700] sm:h-6 sm:w-6" />
					</div>
					<div>
						<h1 class="text-xl font-bold text-[#1A1A1B] sm:text-2xl">
							Historical Data
						</h1>
						<p class="text-xs text-gray-500 sm:text-sm">
							Browse archived flight records
						</p>
					</div>
				</div>

				{/* Date Picker */}
				<DatePicker
					value={selectedDate()}
					onChange={handleDateChange}
					label="Select date"
				/>
			</div>

			{/* Quick Stats - HKIA Style */}
			<Show when={snapshot()}>
				<div class="grid grid-cols-3 gap-2 xs:grid-cols-5 sm:gap-3">
					<div class="rounded-lg border-l-4 border-[#003580] bg-white p-2 shadow-sm sm:p-3">
						<p class="text-[10px] font-medium text-gray-500 sm:text-xs">Total</p>
						<p class="text-lg font-bold text-[#003580] sm:text-2xl">
							{stats().total}
						</p>
					</div>
					<div class="rounded-lg border-l-4 border-blue-500 bg-white p-2 shadow-sm sm:p-3">
						<p class="text-[10px] font-medium text-gray-500 sm:text-xs">
							<span class="hidden xs:inline">Passenger</span>
							<span class="xs:hidden">Pax</span>
						</p>
						<p class="text-lg font-bold text-blue-600 sm:text-2xl">
							{stats().passenger}
						</p>
					</div>
					<div class="rounded-lg border-l-4 border-orange-500 bg-white p-2 shadow-sm sm:p-3">
						<p class="text-[10px] font-medium text-gray-500 sm:text-xs">Cargo</p>
						<p class="text-lg font-bold text-orange-600 sm:text-2xl">
							{stats().cargo}
						</p>
					</div>
					<div class="hidden rounded-lg border-l-4 border-emerald-500 bg-white p-2 shadow-sm xs:block sm:p-3">
						<p class="text-[10px] font-medium text-gray-500 sm:text-xs">
							Arrivals
						</p>
						<p class="text-lg font-bold text-emerald-600 sm:text-2xl">
							{stats().arrivals}
						</p>
					</div>
					<div class="hidden rounded-lg border-l-4 border-[#003580] bg-white p-2 shadow-sm xs:block sm:p-3">
						<p class="text-[10px] font-medium text-gray-500 sm:text-xs">
							Departures
						</p>
						<p class="text-lg font-bold text-[#003580] sm:text-2xl">
							{stats().departures}
						</p>
					</div>
				</div>
			</Show>

			{/* Search Bar */}
			<div class="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center">
				<div class="w-full sm:max-w-md sm:flex-1">
					<FlightSearch
						mode="filter"
						value={searchQuery()}
						onFilter={setSearchQuery}
						placeholder="Search by flight number, destination, or airline..."
						resultCount={getCurrentCount()}
					/>
				</div>
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
								Loading historical data...
							</div>
						}
					>
						<Show
							when={snapshot()}
							fallback={
								<div class="rounded-lg border-2 border-dashed bg-gray-50 py-8 text-center sm:py-12">
									<Calendar class="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
									<h2 class="mt-3 text-base font-medium text-gray-900 sm:mt-4 sm:text-lg">
										No Data for Selected Date
									</h2>
									<p class="mt-1.5 text-sm text-gray-500 sm:mt-2">
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
				<p class="text-center text-[10px] text-gray-400 sm:text-xs">
					Archived at {snapshot()?.archivedAt} • Data from{" "}
					{selectedDate()}
				</p>
			</Show>
		</div>
	);
}
