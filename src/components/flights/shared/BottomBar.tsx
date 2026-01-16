/**
 * BottomBar Components - Terminal, Check-in, Hall, Direction displays
 *
 * Shared components for the bottom metadata bar of flight cards
 */

import { A } from "@solidjs/router";
import {
	DoorOpen,
	Luggage,
	PlaneLanding,
	PlaneTakeoff,
	Warehouse,
} from "lucide-solid";
import { Show } from "solid-js";

export interface TerminalDisplayProps {
	terminal: string | undefined;
}

export interface CheckInDisplayProps {
	aisle: string | undefined;
}

export interface ArrivalHallDisplayProps {
	hall: string | undefined;
}

export interface CargoBottomBarProps {
	terminal: string | undefined;
	gate?: string;
	belt?: string;
	isArrival: boolean;
}

/**
 * Terminal Display
 */
export function TerminalDisplay(props: TerminalDisplayProps) {
	return (
		<div class="flex items-center gap-2">
			<span class="text-sm text-gray-600">Terminal:</span>
			<span class="text-sm font-semibold text-[#1A1A1B]">
				{props.terminal || "T1"}
			</span>
		</div>
	);
}

/**
 * Check-in Counter Display - For departures
 */
export function CheckInDisplay(props: CheckInDisplayProps) {
	return (
		<div class="flex items-center gap-2">
			<DoorOpen class="h-4 w-4 text-[#003580]" />
			<span class="text-sm text-gray-600">Check-in:</span>
			<Show
				when={props.aisle}
				fallback={<span class="text-sm text-gray-400">—</span>}
			>
				<span class="rounded bg-[#003580] px-2.5 py-0.5 text-sm font-bold text-white">
					Row {props.aisle}
				</span>
			</Show>
		</div>
	);
}

/**
 * Arrival Hall Display - For arrivals
 */
export function ArrivalHallDisplay(props: ArrivalHallDisplayProps) {
	return (
		<div class="flex items-center gap-2">
			<span class="text-sm text-gray-600">Arrival Hall:</span>
			<Show
				when={props.hall}
				fallback={<span class="text-sm text-gray-400">—</span>}
			>
				<span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
					{props.hall}
				</span>
			</Show>
		</div>
	);
}

/**
 * Baggage Claim Indicator
 */
export function BaggageClaimIndicator() {
	return (
		<div class="ml-auto flex items-center gap-1 text-amber-600">
			<Luggage class="h-4 w-4" />
			<span class="text-xs font-medium">Baggage Claim</span>
		</div>
	);
}

/**
 * Departure Bottom Bar - Terminal + Check-in
 */
export function DepartureBottomBar(props: {
	terminal?: string;
	aisle?: string;
}) {
	return (
		<>
			<TerminalDisplay terminal={props.terminal} />
			<CheckInDisplay aisle={props.aisle} />
		</>
	);
}

/**
 * Arrival Bottom Bar - Terminal + Arrival Hall + Baggage Claim
 */
export function ArrivalBottomBar(props: { terminal?: string; hall?: string }) {
	return (
		<>
			<TerminalDisplay terminal={props.terminal} />
			<ArrivalHallDisplay hall={props.hall} />
			<BaggageClaimIndicator />
		</>
	);
}

/**
 * Cargo Bottom Bar - Terminal + Gate/Belt + Direction Badge
 */
export function CargoBottomBar(props: CargoBottomBarProps) {
	return (
		<>
			<TerminalDisplay terminal={props.terminal} />

			{/* Gate (for departures) */}
			<Show when={!props.isArrival}>
				<div class="flex items-center gap-2">
					<span class="text-sm text-gray-600">Gate:</span>
					<Show
						when={props.gate}
						fallback={<span class="text-sm text-gray-400">—</span>}
					>
						<A
							href={`/gate/${props.gate}`}
							class="inline-block rounded bg-[#003580] px-2.5 py-0.5 text-sm font-bold text-[#FFD700] hover:opacity-90"
						>
							{props.gate}
						</A>
					</Show>
				</div>
			</Show>

			{/* Belt (for arrivals) */}
			<Show when={props.isArrival}>
				<div class="flex items-center gap-2">
					<span class="text-sm text-gray-600">Belt:</span>
					<Show
						when={props.belt}
						fallback={<span class="text-sm text-gray-400">—</span>}
					>
						<span class="rounded bg-amber-500 px-2.5 py-0.5 text-sm font-bold text-white">
							{props.belt}
						</span>
					</Show>
				</div>
			</Show>

			{/* Direction Badge */}
			<div class="ml-auto">
				<span
					class={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
						props.isArrival
							? "bg-emerald-100 text-emerald-700"
							: "bg-blue-100 text-blue-700"
					}`}
				>
					<Show
						when={props.isArrival}
						fallback={<PlaneTakeoff class="h-3.5 w-3.5" />}
					>
						<PlaneLanding class="h-3.5 w-3.5" />
					</Show>
					{props.isArrival ? "Arrival" : "Departure"}
				</span>
			</div>

			{/* Cargo Icon */}
			<div class="flex items-center gap-1 text-orange-600">
				<Warehouse class="h-4 w-4" />
			</div>
		</>
	);
}
