/**
 * LeftPanel Components - Gate, Belt, Stand displays
 *
 * Shared components for the left panel area of flight cards
 */

import { A } from "@solidjs/router";
import { Show } from "solid-js";

export interface GatePanelProps {
	gate: string | undefined;
}

export interface BeltPanelProps {
	belt: string | undefined;
}

export interface StandPanelProps {
	stand: string | undefined;
}

/**
 * Gate Display - HKIA Style (Blue background, Yellow text)
 * Used for departure flights
 */
export function GatePanel(props: GatePanelProps) {
	return (
		<Show
			when={props.gate}
			fallback={
				<span class="text-lg font-bold text-[#FFD700]/50">—</span>
			}
		>
			<A
				href={`/gate/${props.gate}`}
				class="text-center hover:opacity-80"
			>
				<span class="text-3xl font-black text-[#FFD700]">
					{props.gate}
				</span>
				<span class="block text-[10px] font-medium uppercase tracking-wider text-blue-200">
					Gate
				</span>
			</A>
		</Show>
	);
}

/**
 * Belt Display - Emerald theme
 * Used for arrival flights
 */
export function BeltPanel(props: BeltPanelProps) {
	return (
		<Show
			when={props.belt}
			fallback={<span class="text-lg font-bold text-white/50">—</span>}
		>
			<div class="text-center">
				<span class="text-3xl font-black text-white">{props.belt}</span>
				<span class="block text-[10px] font-medium uppercase tracking-wider text-emerald-100">
					Belt
				</span>
			</div>
		</Show>
	);
}

/**
 * Stand Display - Orange theme
 * Used for cargo flights
 */
export function StandPanel(props: StandPanelProps) {
	return (
		<Show
			when={props.stand}
			fallback={<span class="text-lg font-bold text-white/50">—</span>}
		>
			<div class="text-center">
				<span class="text-2xl font-black text-white">
					{props.stand}
				</span>
				<span class="block text-[10px] font-medium uppercase tracking-wider text-orange-100">
					Stand
				</span>
			</div>
		</Show>
	);
}
