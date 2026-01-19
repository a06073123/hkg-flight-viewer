/**
 * Gate Card Component
 *
 * Compact gate display showing gate number, flight, and destination.
 * Clickable to show detailed popup.
 */

import {
	GATE_STATUS_COLORS,
	getGateStatusAnimationClass,
} from "@/lib/status-config";
import { GateStatus } from "@/types/map";
import { Show } from "solid-js";
import type { GateDisplayData } from "../utils/gate-utils";

export interface GateCardProps {
	gate: GateDisplayData;
	onClick: () => void;
}

export function GateCard(props: GateCardProps) {
	const isActive = () => props.gate.status !== GateStatus.Idle;
	const colors = () => GATE_STATUS_COLORS[props.gate.status];
	const animationClass = () => getGateStatusAnimationClass(props.gate.status);

	return (
		<button
			type="button"
			onClick={props.onClick}
			class={`
				group relative flex h-full w-full flex-col items-center justify-center rounded-lg border-2 transition-all
				hover:scale-105 hover:shadow-md
				${isActive() ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"}
				${props.gate.status === GateStatus.Boarding ? `ring-2 ${colors().ring} ${animationClass()}` : ""}
			`}
			title={`Gate ${props.gate.gateNumber}${props.gate.flightNumber ? ` - ${props.gate.flightNumber}` : ""}${props.gate.destination ? ` → ${props.gate.destination}` : ""}`}
		>
			{/* Status indicator dot */}
			<span
				class={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-1 ring-white ${colors().dotBg}`}
			/>

			{/* Gate number */}
			<span
				class={`text-[10px] font-bold leading-tight ${isActive() ? "text-[#003580]" : "text-gray-400"}`}
			>
				{props.gate.gateNumber}
			</span>

			{/* Flight number (if any) */}
			<Show when={props.gate.flightNumber}>
				<span class="max-w-full truncate text-[8px] font-medium leading-tight text-gray-600">
					{props.gate.flightNumber}
				</span>
			</Show>

			{/* Destination airport code */}
			<Show when={props.gate.destination}>
				<span class="text-[8px] font-semibold leading-tight text-amber-600">
					{props.gate.destination}
				</span>
			</Show>

			{/* Empty indicator */}
			<Show when={!props.gate.flightNumber}>
				<span class="text-[8px] text-gray-300">—</span>
			</Show>
		</button>
	);
}
