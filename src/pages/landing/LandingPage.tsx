/**
 * Landing Page
 *
 * Site introduction and navigation guide - no data fetching
 * Uses HKIA Visual DNA color palette with fixed layouts
 */

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

/**
 * Fixed grid layouts for consistent design
 */
const GRID_LAYOUTS = {
	nav: "grid gap-6 md:grid-cols-2",
	features: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
	info: "grid gap-4 text-sm text-gray-600 sm:grid-cols-2",
};

export default function LandingPage() {
	return (
		<div class="mx-auto max-w-4xl space-y-8">
			{/* Hero Section - HKIA Deep Blue */}
			<div class="rounded-2xl bg-[#003580] p-8 text-white shadow-xl">
				<div class="flex items-center gap-3 justify-center">
					<Plane class="h-10 w-10 text-[#FFD700]" />
					<h1 class="text-3xl font-bold">HKG Flight Viewer</h1>
				</div>
				<p class="mt-4 text-lg text-blue-100">
					香港國際機場航班資訊查詢系統
				</p>
				<p class="mt-2 text-blue-200">
					Real-time flight information and historical data for Hong
					Kong International Airport (HKIA)
				</p>

				{/* Quick Action Buttons */}
				<div class="mt-6 flex flex-wrap gap-3 justify-center">
					<A
						href="/live"
						class="inline-flex items-center gap-2 rounded-lg bg-[#FFD700] px-4 py-2.5 font-semibold text-[#003580] transition-colors hover:bg-yellow-300"
					>
						<Radio class="h-4 w-4" />
						View Live Flights
					</A>
					<A
						href="/past"
						class="inline-flex items-center gap-2 rounded-lg border-2 border-white/50 px-4 py-2.5 font-medium text-white transition-colors hover:bg-white/10"
					>
						<History class="h-4 w-4" />
						Browse History
					</A>
				</div>
			</div>

			{/* Main Navigation Cards - Fixed grid */}
			<div class={GRID_LAYOUTS.nav}>
				{/* Live Flights Card */}
				<A
					href="/live"
					class="group rounded-xl border-2 border-[#003580]/20 bg-white p-6 shadow-md transition-all hover:border-[#003580] hover:shadow-lg"
				>
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-[#003580] p-3">
							<Radio class="h-6 w-6 text-[#FFD700]" />
						</div>
						<div>
							<h2 class="text-xl font-semibold text-[#1A1A1B] group-hover:text-[#003580]">
								Live Flights
							</h2>
							<p class="text-sm text-gray-500">即時航班資訊</p>
						</div>
					</div>
					<p class="mt-4 text-gray-600">
						View real-time arrivals and departures with automatic
						updates every 5 minutes.
					</p>
					<div class="mt-4 flex flex-wrap gap-2">
						<span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
							<PlaneLanding class="h-3 w-3" />
							Arrivals
						</span>
						<span class="inline-flex items-center gap-1 rounded-full bg-[#003580]/10 px-2.5 py-1 text-xs font-medium text-[#003580]">
							<PlaneTakeoff class="h-3 w-3" />
							Departures
						</span>
						<span class="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
							<Package class="h-3 w-3" />
							Cargo
						</span>
					</div>
				</A>

				{/* Historical Data Card */}
				<A
					href="/past"
					class="group rounded-xl border-2 border-[#003580]/20 bg-white p-6 shadow-md transition-all hover:border-[#003580] hover:shadow-lg"
				>
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-[#003580] p-3">
							<History class="h-6 w-6 text-[#FFD700]" />
						</div>
						<div>
							<h2 class="text-xl font-semibold text-[#1A1A1B] group-hover:text-[#003580]">
								Historical Data
							</h2>
							<p class="text-sm text-gray-500">歷史航班資料</p>
						</div>
					</div>
					<p class="mt-4 text-gray-600">
						Browse archived flight data from the past 93+ days.
						Analyze trends and patterns.
					</p>
					<div class="mt-4 flex flex-wrap gap-2">
						<span class="inline-flex items-center gap-1 rounded-full bg-[#003580]/10 px-2.5 py-1 text-xs font-medium text-[#003580]">
							<Calendar class="h-3 w-3" />
							Date Browser
						</span>
						<span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
							<Search class="h-3 w-3" />
							Flight Search
						</span>
					</div>
				</A>
			</div>

			{/* Features Section */}
			<div class="rounded-xl border-2 border-[#003580]/10 bg-white p-6">
				<h3 class="mb-4 text-lg font-semibold text-[#1A1A1B]">
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

			{/* Quick Access Section */}
			<div class="rounded-xl border-2 border-[#003580]/10 bg-white p-6">
				<h3 class="mb-4 text-lg font-semibold text-[#1A1A1B]">
					Quick Access
				</h3>
				<div class={GRID_LAYOUTS.features}>
					<A
						href="/flight/CX888"
						class="flex items-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium hover:border-[#003580] hover:bg-[#003580]/5"
					>
						<Plane class="h-4 w-4 text-[#003580]" />
						<span>Flight CX888</span>
					</A>
					<A
						href="/flight/UO838"
						class="flex items-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium hover:border-[#003580] hover:bg-[#003580]/5"
					>
						<Plane class="h-4 w-4 text-[#003580]" />
						<span>Flight UO838</span>
					</A>
					<A
						href="/gate/23"
						class="flex items-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium hover:border-[#003580] hover:bg-[#003580]/5"
					>
						<span class="gate-badge text-xs">23</span>
						<span>Gate Analytics</span>
					</A>
				</div>
			</div>

			{/* Data Info */}
			<div class="rounded-xl border-2 border-[#003580]/10 bg-white p-6">
				<h3 class="mb-4 text-lg font-semibold text-[#1A1A1B]">
					About the Data
				</h3>
				<div class={GRID_LAYOUTS.info}>
					<div class="flex items-start gap-3">
						<div class="rounded-lg bg-[#003580]/10 p-2">
							<Clock class="h-5 w-5 text-[#003580]" />
						</div>
						<div>
							<p class="font-medium text-[#1A1A1B]">
								Real-time Updates
							</p>
							<p>
								Live data refreshes every 5 minutes from HKIA
								official API
							</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="rounded-lg bg-[#003580]/10 p-2">
							<Calendar class="h-5 w-5 text-[#003580]" />
						</div>
						<div>
							<p class="font-medium text-[#1A1A1B]">
								Historical Archive
							</p>
							<p>
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
		<div class="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
			<div class="rounded-lg bg-[#003580]/10 p-2">
				<props.icon class="h-4 w-4 text-[#003580]" />
			</div>
			<div>
				<p class="font-medium text-[#1A1A1B]">{props.title}</p>
				<p class="text-xs text-gray-500">{props.description}</p>
			</div>
		</div>
	);
}
