/**
 * Landing Page
 *
 * Site introduction and navigation guide - no data fetching
 * Uses HKIA Visual DNA color palette with fixed layouts
 */

import { FlightSearch, type FlightSearchOption } from "@/components/search";
import { createFlightListResource } from "@/lib/resources";
import { A } from "@solidjs/router";
import {
	Calendar,
	Clock,
	DoorOpen,
	History,
	Luggage,
	Package,
	Plane,
	PlaneLanding,
	PlaneTakeoff,
	Radio,
	Search,
	Users,
} from "lucide-solid";
import { createMemo } from "solid-js";

/**
 * Fixed grid layouts for consistent design
 */
const GRID_LAYOUTS = {
	nav: "grid gap-4 sm:gap-6 md:grid-cols-2",
	features: "grid gap-2 xs:gap-3 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3",
	info: "grid gap-3 text-sm text-gray-600 sm:gap-4 sm:grid-cols-2",
};

export default function LandingPage() {
	// Load flight list for search autocomplete
	const [flightList] = createFlightListResource();

	// Transform flight list entries into FlightSearchOptions
	const flightOptions = createMemo<FlightSearchOption[]>(() => {
		const entries = flightList();
		if (!entries || entries.length === 0) return [];

		return entries.map((entry) => ({
			label: entry.flightNo,
			value: entry.flightNo,
			airline: entry.airline,
		}));
	});

	return (
		<div class="mx-auto max-w-4xl space-y-4 sm:space-y-8">
			{/* Hero Section - HKIA Deep Blue */}
			<div class="rounded-xl bg-[#003580] p-4 text-white shadow-xl sm:rounded-2xl sm:p-8">
				<div class="flex items-center gap-2 justify-center sm:gap-3">
					<Plane class="h-7 w-7 text-[#FFD700] sm:h-10 sm:w-10" />
					<h1 class="text-xl font-bold sm:text-3xl">HKG Flight Viewer</h1>
				</div>
				<p class="mt-2 text-center text-sm text-blue-100 sm:mt-4 sm:text-lg">
					香港國際機場航班資訊查詢系統
				</p>
				<p class="mt-1.5 text-center text-xs text-blue-200 sm:mt-2 sm:text-base">
					Real-time flight information and historical data for Hong
					Kong International Airport (HKIA)
				</p>

				{/* Quick Action Buttons */}
				<div class="mt-4 flex flex-wrap gap-2 justify-center sm:mt-6 sm:gap-3">
					<A
						href="/live"
						class="inline-flex items-center gap-1.5 rounded-lg bg-[#FFD700] px-3 py-2 text-sm font-semibold text-[#003580] transition-colors hover:bg-yellow-300 sm:gap-2 sm:px-4 sm:py-2.5"
					>
						<Radio class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
						<span class="hidden xs:inline">View </span>Live Flights
					</A>
					<A
						href="/past"
						class="inline-flex items-center gap-1.5 rounded-lg border-2 border-white/50 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:gap-2 sm:px-4 sm:py-2.5"
					>
						<History class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
						<span class="hidden xs:inline">Browse </span>History
					</A>
				</div>
			</div>

			{/* Main Navigation Cards - Fixed grid */}
			<div class={GRID_LAYOUTS.nav}>
				{/* Live Flights Card */}
				<A
					href="/live"
					class="group rounded-xl border-2 border-[#003580]/20 bg-white p-4 shadow-md transition-all hover:border-[#003580] hover:shadow-lg sm:p-6"
				>
					<div class="flex items-center gap-2 sm:gap-3">
						<div class="rounded-lg bg-[#003580] p-2 sm:p-3">
							<Radio class="h-5 w-5 text-[#FFD700] sm:h-6 sm:w-6" />
						</div>
						<div>
							<h2 class="text-lg font-semibold text-[#1A1A1B] group-hover:text-[#003580] sm:text-xl">
								Live Flights
							</h2>
							<p class="text-xs text-gray-500 sm:text-sm">即時航班資訊</p>
						</div>
					</div>
					<p class="mt-3 text-sm text-gray-600 sm:mt-4">
						View real-time arrivals and departures with automatic
						updates every 5 minutes.
					</p>
					<div class="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
						<span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 sm:px-2.5 sm:py-1 sm:text-xs">
							<PlaneLanding class="h-2.5 w-2.5 sm:h-3 sm:w-3" />
							Arrivals
						</span>
						<span class="inline-flex items-center gap-1 rounded-full bg-[#003580]/10 px-2 py-0.5 text-[10px] font-medium text-[#003580] sm:px-2.5 sm:py-1 sm:text-xs">
							<PlaneTakeoff class="h-2.5 w-2.5 sm:h-3 sm:w-3" />
							Departures
						</span>
						<span class="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-700 sm:px-2.5 sm:py-1 sm:text-xs">
							<Package class="h-2.5 w-2.5 sm:h-3 sm:w-3" />
							Cargo
						</span>
					</div>
				</A>

				{/* Historical Data Card */}
				<A
					href="/past"
					class="group rounded-xl border-2 border-[#003580]/20 bg-white p-4 shadow-md transition-all hover:border-[#003580] hover:shadow-lg sm:p-6"
				>
					<div class="flex items-center gap-2 sm:gap-3">
						<div class="rounded-lg bg-[#003580] p-2 sm:p-3">
							<History class="h-5 w-5 text-[#FFD700] sm:h-6 sm:w-6" />
						</div>
						<div>
							<h2 class="text-lg font-semibold text-[#1A1A1B] group-hover:text-[#003580] sm:text-xl">
								Historical Data
							</h2>
							<p class="text-xs text-gray-500 sm:text-sm">歷史航班資料</p>
						</div>
					</div>
					<p class="mt-3 text-sm text-gray-600 sm:mt-4">
						Browse archived flight data from the past 93+ days.
						Analyze trends and patterns.
					</p>
					<div class="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
						<span class="inline-flex items-center gap-1 rounded-full bg-[#003580]/10 px-2 py-0.5 text-[10px] font-medium text-[#003580] sm:px-2.5 sm:py-1 sm:text-xs">
							<Calendar class="h-2.5 w-2.5 sm:h-3 sm:w-3" />
							Date Browser
						</span>
						<span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700 sm:px-2.5 sm:py-1 sm:text-xs">
							<Search class="h-2.5 w-2.5 sm:h-3 sm:w-3" />
							Flight Search
						</span>
					</div>
				</A>
			</div>

			{/* Features Section */}
			<div class="rounded-xl border-2 border-[#003580]/10 bg-white p-4 sm:p-6">
				<h3 class="mb-3 text-base font-semibold text-[#1A1A1B] sm:mb-4 sm:text-lg">
					Features
				</h3>
				<div class={GRID_LAYOUTS.features}>
					<FeatureItem
						icon={Users}
						title="Codeshare Info"
						description="See all codeshare flight numbers"
					/>
					<FeatureItem
						icon={DoorOpen}
						title="Check-in Counter"
						description="View check-in row for departures"
					/>
					<FeatureItem
						icon={Luggage}
						title="Baggage Claim"
						description="Find your baggage belt & hall"
					/>
				</div>
			</div>

			{/* Flight Search Section */}
			<div class="rounded-xl border-2 border-[#003580]/10 bg-white p-4 sm:p-6">
				<h3 class="mb-3 text-base font-semibold text-[#1A1A1B] sm:mb-4 sm:text-lg">
					<Search class="mr-1.5 inline-block h-4 w-4 text-[#003580] sm:mr-2 sm:h-5 sm:w-5" />
					Flight Search
				</h3>
				<p class="mb-3 text-xs text-gray-600 sm:mb-4 sm:text-sm">
					Enter a flight number to view its history and on-time
					performance (e.g., CX888, UO 192)
				</p>
				<FlightSearch
					mode="navigate"
					placeholder="Search flight number..."
					options={flightOptions()}
				/>
			</div>

			{/* Quick Access Section */}
			<div class="rounded-xl border-2 border-[#003580]/10 bg-white p-4 sm:p-6">
				<h3 class="mb-3 text-base font-semibold text-[#1A1A1B] sm:mb-4 sm:text-lg">
					Quick Access
				</h3>
				<div class={GRID_LAYOUTS.features}>
					<A
						href="/flight/CX888"
						class="flex items-center gap-1.5 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs font-medium hover:border-[#003580] hover:bg-[#003580]/5 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
					>
						<Plane class="h-3.5 w-3.5 text-[#003580] sm:h-4 sm:w-4" />
						<span>Flight CX888</span>
					</A>
					<A
						href="/flight/UO838"
						class="flex items-center gap-1.5 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs font-medium hover:border-[#003580] hover:bg-[#003580]/5 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
					>
						<Plane class="h-3.5 w-3.5 text-[#003580] sm:h-4 sm:w-4" />
						<span>Flight UO838</span>
					</A>
					<A
						href="/gate/23"
						class="flex items-center gap-1.5 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs font-medium hover:border-[#003580] hover:bg-[#003580]/5 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
					>
						<span class="gate-badge text-[10px] sm:text-xs">23</span>
						<span>Gate Analytics</span>
					</A>
				</div>
			</div>

			{/* Data Info */}
			<div class="rounded-xl border-2 border-[#003580]/10 bg-white p-4 sm:p-6">
				<h3 class="mb-3 text-base font-semibold text-[#1A1A1B] sm:mb-4 sm:text-lg">
					About the Data
				</h3>
				<div class={GRID_LAYOUTS.info}>
					<div class="flex items-start gap-2 sm:gap-3">
						<div class="rounded-lg bg-[#003580]/10 p-1.5 sm:p-2">
							<Clock class="h-4 w-4 text-[#003580] sm:h-5 sm:w-5" />
						</div>
						<div>
							<p class="text-sm font-medium text-[#1A1A1B]">
								Real-time Updates
							</p>
							<p class="text-xs sm:text-sm">
								Live data refreshes every 5 minutes from HKIA
								official API
							</p>
						</div>
					</div>
					<div class="flex items-start gap-2 sm:gap-3">
						<div class="rounded-lg bg-[#003580]/10 p-1.5 sm:p-2">
							<Calendar class="h-4 w-4 text-[#003580] sm:h-5 sm:w-5" />
						</div>
						<div>
							<p class="text-sm font-medium text-[#1A1A1B]">
								Historical Archive
							</p>
							<p class="text-xs sm:text-sm">
								93+ days of flight data available for analysis
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Feature item component for consistent display
 */
function FeatureItem(props: {
	icon: typeof Clock;
	title: string;
	description: string;
}) {
	return (
		<div class="flex items-start gap-2 rounded-lg bg-gray-50 p-2 sm:gap-3 sm:p-3">
			<div class="rounded-lg bg-[#003580]/10 p-1.5 sm:p-2">
				<props.icon class="h-3.5 w-3.5 text-[#003580] sm:h-4 sm:w-4" />
			</div>
			<div>
				<p class="text-sm font-medium text-[#1A1A1B]">{props.title}</p>
				<p class="text-[10px] text-gray-500 sm:text-xs">{props.description}</p>
			</div>
		</div>
	);
}
