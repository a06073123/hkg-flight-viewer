/**
 * Gate Card Component
 *
 * Compact gate display showing gate number, flight, and status.
 * Clickable to show detailed popup.
 */

import { GateStatus } from "@/types/map";
import { Show } from "solid-js";
import type { GateDisplayData } from "../utils/gate-utils";

export interface GateCardProps {
	gate: GateDisplayData;
	onClick: () => void;
}

const statusBgColors = {
	[GateStatus.Boarding]: "bg-yellow-400",
	[GateStatus.Scheduled]: "bg-blue-500",
	[GateStatus.Idle]: "bg-gray-200",
};

export function GateCard(props: GateCardProps) {
	const isActive = () => props.gate.status !== GateStatus.Idle;

	return (
		<button
			type="button"
			onClick={props.onClick}
			class={`
				group relative flex flex-col items-center justify-center rounded-lg border-2 p-1.5 transition-all
				hover:scale-105 hover:shadow-md
				${isActive() ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"}
				${props.gate.status === GateStatus.Boarding ? "ring-2 ring-yellow-300 animate-pulse" : ""}
			`}
			title={`Gate ${props.gate.gateNumber}${props.gate.flightNumber ? ` - ${props.gate.flightNumber}` : ""}`}
		>
			{/* Status indicator dot */}
			<span
				class={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white ${statusBgColors[props.gate.status]}`}
			/>

			{/* Gate number */}
			<span
				class={`text-xs font-bold ${isActive() ? "text-[#003580]" : "text-gray-400"}`}
			>
				{props.gate.gateNumber}
			</span>

			{/* Flight number (if any) */}
			<Show when={props.gate.flightNumber}>
				<span class="mt-0.5 max-w-full truncate text-[9px] font-medium text-gray-600">
					{props.gate.flightNumber}
				</span>
			</Show>

			{/* Empty indicator */}
			<Show when={!props.gate.flightNumber}>
				<span class="mt-0.5 text-[9px] text-gray-300">—</span>
			</Show>

			{/* Size indicator */}
			<span
				class={`mt-0.5 text-[8px] ${
					props.gate.size === "F"
						? "font-semibold text-purple-500"
						: props.gate.size === "E"
							? "text-blue-400"
							: "text-gray-400"
				}`}
			>
				{props.gate.size}
			</span>
		</button>
	);
}
