/**
 * Gate Popup Component
 *
 * Modal dialog showing gate details in HKIA style:
 * - Real-time gate status (prominent, animated)
 * - Current flight info (DepartureCard-inspired layout)
 * - Recent departure history
 * - Link to full gate analytics
 */

import { FlightTimeStatus } from "@/components/flights/shared";
import { CompactTimeStatus } from "@/components/history";
import { getAirlineDataVersion, getAirlineNameSync } from "@/lib/airline-data";
import { getAirportDataVersion, getAirportName } from "@/lib/airport-data";
import { createGateHistoryResource } from "@/lib/resources";
import { GATE_STATUS_LABELS } from "@/lib/status-config";
import type { FlightRecord } from "@/types/flight";
import { GateStatus } from "@/types/map";
import { A } from "@solidjs/router";
import {
	ArrowRight,
	Calendar,
	DoorOpen,
	Plane,
	PlaneTakeoff,
	TrendingUp,
	X,
} from "lucide-solid";
import { createMemo, For, onCleanup, onMount, Show } from "solid-js";
import type { GateDisplayData } from "../utils/gate-utils";

export interface GatePopupProps {
	gate: GateDisplayData;
	onClose: () => void;
}

/** Status-based accent colors */
const STATUS_COLORS = {
	[GateStatus.Boarding]: {
		bg: "bg-emerald-50",
		border: "border-emerald-200",
		text: "text-emerald-700",
		badge: "bg-emerald-500",
	},
	[GateStatus.Scheduled]: {
		bg: "bg-blue-50",
		border: "border-blue-200",
		text: "text-blue-700",
		badge: "bg-[#003580]",
	},
	[GateStatus.Idle]: {
		bg: "bg-slate-50",
		border: "border-slate-200",
		text: "text-slate-600",
		badge: "bg-slate-400",
	},
};

export function GatePopup(props: GatePopupProps) {
	// Load historical data for this gate
	const [gateHistory] = createGateHistoryResource(() => props.gate.gateNumber);

	// Subscribe to data versions for reactivity
	const _airlineVersion = () => getAirlineDataVersion();
	const _airportVersion = () => getAirportDataVersion();

	// Get recent departures from history (latest 5)
	const recentDepartures = createMemo(() => {
		const history = gateHistory();
		if (!history?.departures) return [];
		return history.departures.reverse().slice(0, 5);
	});

	const statusColors = () => STATUS_COLORS[props.gate.status];

	// Flight info helpers
	const airlineName = () => {
		_airlineVersion();
		const carrier = props.gate.flight?.operatingCarrier;
		return carrier ? getAirlineNameSync(carrier.airline) : "";
	};

	const airportName = () => {
		_airportVersion();
		return props.gate.flight ? getAirportName(props.gate.flight.primaryAirport) : "";
	};

	// Handle escape key
	onMount(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				props.onClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
	});

	return (
		<>
			{/* Backdrop */}
			<div
				class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
				onClick={props.onClose}
			/>

			{/* Popup */}
			<div class="fixed inset-x-4 top-1/2 z-50 max-h-[80vh] -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2">
				{/* Header - Gate number + Real-time Status Badge */}
				<div class="relative bg-linear-to-r from-[#003580] to-[#004a9f] px-5 py-4 text-white">
					{/* Close button */}
					<button
						type="button"
						onClick={props.onClose}
						class="absolute right-3 top-3 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
					>
						<X class="h-5 w-5" />
					</button>

					{/* Gate info with Status */}
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-4">
							<div class="flex h-16 w-16 items-center justify-center rounded-xl bg-[#FFD700] shadow-lg">
								<span class="text-2xl font-black text-[#003580]">{props.gate.gateNumber}</span>
							</div>
							<div>
								<h2 class="text-xl font-bold tracking-tight">
									Gate {props.gate.gateNumber}
								</h2>
								<div class="flex items-center gap-2 text-xs text-blue-200">
									<DoorOpen class="h-3 w-3" />
									<span class="capitalize">{props.gate.area} Concourse</span>
								</div>
							</div>
						</div>
						{/* Live Status Badge - Prominent */}
						<div class="flex flex-col items-end">
							<span
								class={`inline-flex items-center gap-1.5 rounded-full ${statusColors().badge} px-3 py-1.5 text-sm font-bold text-white shadow-lg`}
							>
								<span class={`h-2 w-2 rounded-full bg-white ${props.gate.status === GateStatus.Boarding ? "animate-pulse" : ""}`} />
								{GATE_STATUS_LABELS[props.gate.status]}
							</span>
						</div>
					</div>
				</div>

				{/* Content */}
				<div class="max-h-[calc(80vh-140px)] overflow-y-auto">
					{/* Current Flight Card - DepartureCard-inspired */}
					<div class="p-4">
						<Show
							when={props.gate.flight}
							fallback={
								<div class="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-center">
									<Plane class="mx-auto mb-2 h-10 w-10 text-slate-300" />
									<p class="text-sm font-medium text-slate-500">No Active Flight</p>
									<p class="text-xs text-slate-400">Gate is currently available</p>
								</div>
							}
						>
							{(flight) => (
								<div class={`overflow-hidden rounded-xl border-2 ${statusColors().border}`}>
									{/* Flight Card Body - 3-column layout like DepartureCard */}
									<div class={`${statusColors().bg} p-4`}>
										<div class="flex items-stretch gap-4">
											{/* Left: Flight Number Block */}
											<div class="flex min-w-0 flex-1 flex-col">
												<A
													href={`/flight/${flight().operatingCarrier?.iataCode}${flight().operatingCarrier?.flightNumber}`}
													class="group flex items-center gap-1.5"
												>
													<PlaneTakeoff class="h-5 w-5 shrink-0 text-[#003580]" />
													<span class="text-xl font-bold text-[#003580] group-hover:underline">
														{flight().operatingCarrier?.iataCode}{" "}
														{flight().operatingCarrier?.flightNumber}
													</span>
												</A>
												<span
													class="truncate text-sm text-slate-500"
													title={airlineName()}
												>
													{airlineName()}
												</span>
											</div>

											{/* Center: Destination Block */}
											<div class="flex flex-col items-center justify-center">
												<div class="flex items-center gap-1">
													<ArrowRight class="h-3 w-3 text-[#C41230]" />
													<span class="text-[10px] font-medium uppercase tracking-wide text-[#C41230]">
														To
													</span>
												</div>
												<span class="inline-block rounded-md bg-[#C41230] px-2.5 py-1 text-lg font-black tracking-wider text-white shadow-sm">
													{flight().primaryAirport}
												</span>
												<p class="mt-0.5 max-w-24 truncate text-center text-xs text-slate-600" title={airportName()}>
													{airportName()}
												</p>
											</div>

											{/* Right: Time + Status */}
											<div class="flex shrink-0 flex-col items-end justify-center">
												<FlightTimeStatus
													scheduledTime={flight().time}
													status={flight().status}
													compact
												/>
											</div>
										</div>
									</div>

									{/* Bottom Bar - Terminal & Check-in */}
									<Show when={flight().terminal || flight().aisle}>
										<div class="flex items-center justify-center gap-4 border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
											<Show when={flight().terminal}>
												<span>Terminal <span class="font-semibold">{flight().terminal}</span></span>
											</Show>
											<Show when={flight().aisle}>
												<span>Check-in <span class="font-semibold">Row {flight().aisle}</span></span>
											</Show>
										</div>
									</Show>
								</div>
							)}
						</Show>
					</div>

					{/* Recent History */}
					<div class="border-t px-4 py-4">
						<h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
							<Calendar class="h-4 w-4" />
							Recent Departures
						</h3>

						<Show
							when={!gateHistory.loading}
							fallback={
								<div class="py-6 text-center">
									<div class="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#003580]" />
									<p class="mt-2 text-xs text-slate-400">Loading history...</p>
								</div>
							}
						>
							<Show
								when={recentDepartures().length > 0}
								fallback={
									<div class="py-4 text-center text-sm text-slate-400">
										No historical data
									</div>
								}
							>
								<div class="space-y-1.5">
									<For each={recentDepartures()}>
										{(flight) => <HistoryFlightRow flight={flight} />}
									</For>
								</div>
							</Show>
						</Show>
					</div>
				</div>

				{/* Footer - Single CTA */}
				<div class="border-t bg-slate-50 px-4 py-3">
					<A
						href={`/gate/${props.gate.gateNumber}`}
						class="flex w-full items-center justify-center gap-2 rounded-xl bg-[#003580] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#002560]"
					>
						<TrendingUp class="h-4 w-4" />
						View Gate Analytics
					</A>
				</div>
			</div>
		</>
	);
}

/** Compact history row */
function HistoryFlightRow(props: { flight: FlightRecord }) {
	const flightNo = () => {
		const carrier = props.flight.operatingCarrier;
		return carrier ? `${carrier.iataCode}${carrier.flightNumber}` : "—";
	};

	return (
		<div class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm transition-colors hover:bg-slate-100">
			<div class="flex items-center gap-3">
				<span class="w-12 font-mono text-xs text-slate-400">
					{props.flight.date?.slice(5) ?? "—"}
				</span>
				<span class="font-medium text-slate-700">{flightNo()}</span>
				<span class="text-slate-400">→</span>
				<span class="text-slate-600">{props.flight.primaryAirport}</span>
			</div>
			<CompactTimeStatus
				scheduledTime={props.flight.time}
				status={props.flight.status}
			/>
		</div>
	);
}
