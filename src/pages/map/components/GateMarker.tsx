/**
 * Gate Marker Component
 *
 * Redesigned gate marker for the airport map.
 * Shows gate number prominently with flight info below.
 * Clear status indication via colors and visual hierarchy.
 */

import { Tooltip } from "@/components/common";
import { getGateStatusAnimationClass } from "@/lib/status-config";
import { GateStatus } from "@/types/map";
import { Show } from "solid-js";
import type { GateDisplayData } from "../utils/gate-utils";

export interface GateMarkerProps {
	gate: GateDisplayData;
	onClick: () => void;
}

/** Status-based styles */
const STATUS_STYLES = {
	[GateStatus.Boarding]: {
		bg: "bg-emerald-500",
		hoverBg: "hover:bg-emerald-600",
		ring: "ring-emerald-300",
		text: "text-white",
		subText: "text-emerald-100",
		glow: "shadow-emerald-500/30",
	},
	[GateStatus.Scheduled]: {
		bg: "bg-[#003580]",
		hoverBg: "hover:bg-[#002560]",
		ring: "ring-blue-300",
		text: "text-white",
		subText: "text-blue-200",
		glow: "shadow-blue-500/20",
	},
	[GateStatus.Idle]: {
		bg: "bg-slate-100",
		hoverBg: "hover:bg-slate-200",
		ring: "ring-slate-200",
		text: "text-slate-500",
		subText: "text-slate-400",
		glow: "",
	},
} as const;

export function GateMarker(props: GateMarkerProps) {
	const isActive = () => props.gate.status !== GateStatus.Idle;
	const styles = () => STATUS_STYLES[props.gate.status];
	const animationClass = () => getGateStatusAnimationClass(props.gate.status);

	// Build tooltip content for additional details
	const tooltipContent = () => {
		const lines: string[] = [];
		
		if (props.gate.destination) {
			lines.push(`→ ${props.gate.destination}`);
		}
		
		const statusText = {
			[GateStatus.Boarding]: "🟢 Boarding",
			[GateStatus.Scheduled]: "🔵 Scheduled",
			[GateStatus.Idle]: "⚪ Available",
		}[props.gate.status];
		lines.push(statusText);
		lines.push("Click for details");

		return lines.join("\n");
	};

	return (
		<Tooltip content={tooltipContent()}>
			<button
				type="button"
				onClick={props.onClick}
				class={`
					group relative flex flex-col items-center justify-center
					rounded-lg transition-all duration-150
					min-w-[3.2rem] px-1.5 py-1
					${styles().bg} ${styles().hoverBg}
					${isActive() ? `ring-2 ${styles().ring} shadow-md ${styles().glow}` : "border border-slate-200"}
					${props.gate.status === GateStatus.Boarding ? animationClass() : ""}
					hover:scale-105 hover:z-20 hover:shadow-lg
					cursor-pointer
				`}
			>
				{/* Gate number - always visible */}
				<span
					class={`
						font-bold leading-tight
						text-[11px]
						${styles().text}
					`}
				>
					{props.gate.gateNumber}
				</span>

				{/* Flight number - only for active gates */}
				<Show when={props.gate.flightNumber}>
					<span
						class={`
							text-[8px] font-medium leading-tight truncate max-w-full
							${styles().subText}
						`}
					>
						{props.gate.flightNumber}
					</span>
				</Show>

				{/* Boarding pulse indicator */}
				<Show when={props.gate.status === GateStatus.Boarding}>
					<span class="absolute -right-1 -top-1 flex h-2.5 w-2.5">
						<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
						<span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-400 ring-1 ring-white" />
					</span>
				</Show>
			</button>
		</Tooltip>
	);
}
