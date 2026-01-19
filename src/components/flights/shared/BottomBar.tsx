/**
 * BottomBar Components - Terminal, Check-in, Hall, Direction displays
 *
 * Shared components for the bottom metadata bar of flight cards
 * 
 * Mobile-first responsive design:
 * - Compact text on mobile
 * - Normal sizing on tablet+
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
		<div class="flex shrink-0 items-center gap-1 sm:gap-2">
			<span class="text-xs text-gray-600 sm:text-sm">Terminal:</span>
			<span class="text-xs font-semibold text-[#1A1A1B] sm:text-sm">
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
		<div class="flex shrink-0 items-center gap-1 sm:gap-2">
			<DoorOpen class="h-3.5 w-3.5 text-[#003580] sm:h-4 sm:w-4" />
			<span class="hidden text-xs text-gray-600 xs:inline sm:text-sm">Check-in:</span>
			<Show
				when={props.aisle}
				fallback={<span class="text-xs text-gray-400 sm:text-sm">—</span>}
			>
				<span class="rounded bg-[#003580] px-1.5 py-0.5 text-xs font-bold text-white sm:px-2.5 sm:text-sm">
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
		<div class="flex shrink-0 items-center gap-1 sm:gap-2">
			<span class="hidden text-xs text-gray-600 xs:inline sm:text-sm">Hall:</span>
			<Show
				when={props.hall}
				fallback={<span class="text-xs text-gray-400 sm:text-sm">—</span>}
			>
				<span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white sm:h-7 sm:w-7 sm:text-sm">
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
		<div class="ml-auto flex shrink-0 items-center gap-1 text-amber-600">
			<Luggage class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
			<span class="hidden text-xs font-medium xs:inline">Baggage</span>
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
				<div class="flex shrink-0 items-center gap-1 sm:gap-2">
					<span class="hidden text-xs text-gray-600 xs:inline sm:text-sm">Gate:</span>
					<Show
						when={props.gate}
						fallback={<span class="text-xs text-gray-400 sm:text-sm">—</span>}
					>
						<A
							href={`/gate/${props.gate}`}
							class="inline-block rounded bg-[#003580] px-1.5 py-0.5 text-xs font-bold text-[#FFD700] hover:opacity-90 sm:px-2.5 sm:text-sm"
						>
							{props.gate}
						</A>
					</Show>
				</div>
			</Show>

			{/* Belt (for arrivals) */}
			<Show when={props.isArrival}>
				<div class="flex shrink-0 items-center gap-1 sm:gap-2">
					<span class="hidden text-xs text-gray-600 xs:inline sm:text-sm">Belt:</span>
					<Show
						when={props.belt}
						fallback={<span class="text-xs text-gray-400 sm:text-sm">—</span>}
					>
						<span class="rounded bg-amber-500 px-1.5 py-0.5 text-xs font-bold text-white sm:px-2.5 sm:text-sm">
							{props.belt}
						</span>
					</Show>
				</div>
			</Show>

			{/* Direction Badge */}
			<div class="ml-auto">
				<span
					class={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs ${
						props.isArrival
							? "bg-emerald-100 text-emerald-700"
							: "bg-blue-100 text-blue-700"
					}`}
				>
					<Show
						when={props.isArrival}
						fallback={<PlaneTakeoff class="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
					>
						<PlaneLanding class="h-3 w-3 sm:h-3.5 sm:w-3.5" />
					</Show>
					<span class="hidden xs:inline">{props.isArrival ? "Arrival" : "Departure"}</span>
				</span>
			</div>

			{/* Cargo Icon */}
			<div class="flex shrink-0 items-center gap-1 text-orange-600">
				<Warehouse class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
			</div>
		</>
	);
}
