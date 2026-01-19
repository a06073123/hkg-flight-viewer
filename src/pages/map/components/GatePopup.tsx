/**
 * Gate Popup Component
 *
 * Modal dialog showing gate details including:
 * - Current live flight information
 * - Historical gate usage data
 */

import { CompactTimeStatus } from "@/components/history";
import { createGateHistoryResource } from "@/lib/resources";
import {
	GATE_STATUS_LABELS,
	getGateStatusBadgeClasses,
} from "@/lib/status-config";
import type { FlightRecord } from "@/types/flight";
import { A } from "@solidjs/router";
import {
	Calendar,
	DoorOpen,
	ExternalLink,
	Plane,
	X,
} from "lucide-solid";
import { createMemo, For, onCleanup, onMount, Show } from "solid-js";
import type { GateDisplayData } from "../utils/gate-utils";

export interface GatePopupProps {
	gate: GateDisplayData;
	onClose: () => void;
}

export function GatePopup(props: GatePopupProps) {
	// Load historical data for this gate
	const [gateHistory] = createGateHistoryResource(() => props.gate.gateNumber);

	// Get recent departures from history
	const recentDepartures = createMemo(() => {
		const history = gateHistory();
		if (!history?.departures) return [];
		// Get latest 10 departures
		return history.departures.reverse().slice(0, 10);
	});

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
				class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
				onClick={props.onClose}
			/>

			{/* Popup */}
			<div class="fixed inset-x-4 top-1/2 z-50 max-h-[85vh] -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2">
				{/* Header */}
				<div class="flex items-center justify-between border-b bg-[#003580] px-4 py-3 text-white sm:px-6 sm:py-4">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-[#FFD700] p-2">
							<DoorOpen class="h-5 w-5 text-[#003580]" />
						</div>
						<div>
							<h2 class="text-lg font-bold sm:text-xl">
								Gate {props.gate.gateNumber}
							</h2>
							<p class="text-xs text-blue-200 capitalize">
								{props.gate.area} Apron • Code {props.gate.size}
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={props.onClose}
						class="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
					>
						<X class="h-5 w-5" />
					</button>
				</div>

				{/* Content */}
				<div class="max-h-[calc(85vh-120px)] overflow-y-auto">
					{/* Current Status */}
					<div class="border-b p-4 sm:p-6">
						<h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
							<Plane class="h-4 w-4" />
							Current Status
						</h3>

						<div
							class={`rounded-lg border-2 p-4 ${getGateStatusBadgeClasses(props.gate.status)}`}
						>
							<div class="flex items-center justify-between">
								<span class="font-medium">
									{GATE_STATUS_LABELS[props.gate.status]}
								</span>
								<Show
									when={props.gate.flight}
									fallback={
										<span class="text-sm text-gray-500">No active flight</span>
									}
								>
									{(flight) => (
										<A
											href={`/flight/${flight().operatingCarrier?.airline}${flight().operatingCarrier?.flightNumber}`}
											class="flex items-center gap-1 text-sm font-semibold text-[#003580] hover:underline"
										>
											{flight().operatingCarrier?.airline}
											{flight().operatingCarrier?.flightNumber}
											<ExternalLink class="h-3 w-3" />
										</A>
									)}
								</Show>
							</div>

							<Show when={props.gate.flight}>
								{(flight) => (
									<div class="mt-3 space-y-2 text-sm">
										<FlightDetailRow
											label="Destination"
											value={flight().primaryAirport}
										/>
										<FlightDetailRow
											label="Scheduled"
											value={flight().time}
										/>
										<FlightDetailRow label="Status" value={flight().status.raw} />
										<Show when={flight().terminal}>
											<FlightDetailRow
												label="Terminal"
												value={`T${flight().terminal}`}
											/>
										</Show>
										<Show when={flight().aisle}>
											<FlightDetailRow
												label="Check-in"
												value={`Row ${flight().aisle}`}
											/>
										</Show>
									</div>
								)}
							</Show>
						</div>
					</div>

					{/* Historical Data */}
					<div class="p-4 sm:p-6">
						<div class="mb-3 flex items-center justify-between">
							<h3 class="flex items-center gap-2 text-sm font-semibold text-gray-700">
								<Calendar class="h-4 w-4" />
								Recent Departures
							</h3>
							<A
								href={`/gate/${props.gate.gateNumber}`}
								class="flex items-center gap-1 text-xs text-[#003580] hover:underline"
							>
								View all
								<ExternalLink class="h-3 w-3" />
							</A>
						</div>

						<Show
							when={!gateHistory.loading}
							fallback={
								<div class="py-4 text-center text-sm text-gray-400">
									Loading history...
								</div>
							}
						>
							<Show
								when={recentDepartures().length > 0}
								fallback={
									<div class="py-4 text-center text-sm text-gray-400">
										No historical data available
									</div>
								}
							>
								<div class="space-y-2">
									<For each={recentDepartures()}>
										{(flight) => (
											<HistoryFlightRow flight={flight} />
										)}
									</For>
								</div>
							</Show>
						</Show>
					</div>
				</div>

				{/* Footer */}
				<div class="border-t bg-gray-50 px-4 py-3 sm:px-6">
					<A
						href={`/gate/${props.gate.gateNumber}`}
						class="block w-full rounded-lg bg-[#003580] py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#002560]"
					>
						View Full Gate Analytics
					</A>
				</div>
			</div>
		</>
	);
}

function FlightDetailRow(props: { label: string; value: string | undefined }) {
	return (
		<Show when={props.value}>
			<div class="flex justify-between">
				<span class="text-gray-500">{props.label}</span>
				<span class="font-medium">{props.value}</span>
			</div>
		</Show>
	);
}

function HistoryFlightRow(props: { flight: FlightRecord }) {
	const flightNo = () => {
		const carrier = props.flight.operatingCarrier;
		return carrier ? `${carrier.airline}${carrier.flightNumber}` : "—";
	};

	return (
		<div class="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm">
			<div class="flex items-center gap-3">
				<span class="font-mono text-xs text-gray-400">
					{props.flight.date?.slice(5) ?? "—"}
				</span>
				<A
					href={`/flight/${flightNo()}`}
					class="font-medium text-[#003580] hover:underline"
				>
					{flightNo()}
				</A>
				<span class="text-gray-500">→ {props.flight.primaryAirport}</span>
			</div>
			<CompactTimeStatus
				scheduledTime={props.flight.time}
				status={props.flight.status}
			/>
		</div>
	);
}
