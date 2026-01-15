/**
 * Landing Page
 *
 * Site introduction and navigation guide - no data fetching
 */

import { A } from "@solidjs/router";
import {
	Calendar,
	Clock,
	DoorOpen,
	History,
	Package,
	Plane,
	PlaneLanding,
	PlaneTakeoff,
	Radio,
	Search,
} from "lucide-solid";

export default function LandingPage() {
	return (
		<div class="mx-auto max-w-4xl space-y-8">
			{/* Hero Section */}
			<div class="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white shadow-xl">
				<div class="flex items-center gap-3">
					<Plane class="h-10 w-10" />
					<h1 class="text-3xl font-bold">HKG Flight Viewer</h1>
				</div>
				<p class="mt-4 text-lg text-blue-100">
					香港國際機場航班資訊查詢系統
				</p>
				<p class="mt-2 text-blue-200">
					Real-time flight information and historical data for Hong
					Kong International Airport (HKIA)
				</p>
			</div>

			{/* Main Navigation Cards */}
			<div class="grid gap-6 md:grid-cols-2">
				{/* Live Flights Card */}
				<A
					href="/live"
					class="group rounded-xl border-2 border-green-200 bg-white p-6 shadow-md transition-all hover:border-green-400 hover:shadow-lg"
				>
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-green-100 p-3">
							<Radio class="h-6 w-6 text-green-600" />
						</div>
						<div>
							<h2 class="text-xl font-semibold text-gray-900 group-hover:text-green-600">
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
						<span class="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
							<PlaneLanding class="h-3 w-3" />
							Arrivals
						</span>
						<span class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
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
					class="group rounded-xl border-2 border-purple-200 bg-white p-6 shadow-md transition-all hover:border-purple-400 hover:shadow-lg"
				>
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-purple-100 p-3">
							<History class="h-6 w-6 text-purple-600" />
						</div>
						<div>
							<h2 class="text-xl font-semibold text-gray-900 group-hover:text-purple-600">
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
						<span class="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
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

			{/* Quick Access Section */}
			<div class="rounded-xl border bg-gray-50 p-6">
				<h3 class="mb-4 text-lg font-semibold text-gray-900">
					Quick Access
				</h3>
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<A
						href="/flight/CX888"
						class="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm hover:border-blue-300 hover:bg-blue-50"
					>
						<Plane class="h-4 w-4 text-blue-500" />
						<span>Flight CX888</span>
					</A>
					<A
						href="/flight/UO838"
						class="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm hover:border-blue-300 hover:bg-blue-50"
					>
						<Plane class="h-4 w-4 text-blue-500" />
						<span>Flight UO838</span>
					</A>
					<A
						href="/gate/23"
						class="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm hover:border-blue-300 hover:bg-blue-50"
					>
						<DoorOpen class="h-4 w-4 text-blue-500" />
						<span>Gate 23</span>
					</A>
				</div>
			</div>

			{/* Data Info */}
			<div class="rounded-xl border bg-white p-6">
				<h3 class="mb-4 text-lg font-semibold text-gray-900">
					About the Data
				</h3>
				<div class="grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
					<div class="flex items-start gap-3">
						<Clock class="mt-0.5 h-5 w-5 text-gray-400" />
						<div>
							<p class="font-medium text-gray-900">
								Real-time Updates
							</p>
							<p>
								Live data refreshes every 5 minutes from HKIA
								official API
							</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<Calendar class="mt-0.5 h-5 w-5 text-gray-400" />
						<div>
							<p class="font-medium text-gray-900">
								Historical Archive
							</p>
							<p>
								93+ days of flight data available for analysis
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<p class="text-center text-xs text-gray-400">
				Data sourced from Hong Kong International Airport •{" "}
				<a
					href="https://github.com"
					class="hover:text-gray-600 hover:underline"
				>
					Open Source Project
				</a>
			</p>
		</div>
	);
}
