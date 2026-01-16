/**
 * CompactTimeStatus - Single-line time and status display for history tables
 *
 * Design goals:
 * - Minimal height (single line)
 * - Show key info: actual/estimated time + status badge
 * - Color-coded for quick scanning
 *
 * Layout: [Time Change Indicator] [Actual Time] [Status Badge]
 * Example: "→ 23:18 ✓ On Time" or "→ 23:25 Delayed"
 */

import type { ParsedStatus } from "@/types/flight";
import { StatusType } from "@/types/flight";
import { Check, Clock } from "lucide-solid";
import type { Component } from "solid-js";
import { Show } from "solid-js";

export interface CompactTimeStatusProps {
	/** Scheduled time (HH:MM) */
	scheduledTime: string;
	/** Parsed status with actual/estimated time */
	status: ParsedStatus;
}

// Compact badge styles
const badgeStyles: Record<StatusType, string> = {
	// Completed - subtle
	[StatusType.Departed]: "bg-[#003580]/10 text-[#003580]",
	[StatusType.Landed]: "bg-[#003580]/10 text-[#003580]",
	[StatusType.AtGate]: "bg-[#003580]/10 text-[#003580]",

	// Urgent - bold
	[StatusType.Boarding]: "bg-amber-500 text-white",
	[StatusType.BoardingSoon]: "bg-amber-100 text-amber-800",
	[StatusType.FinalCall]: "bg-red-500 text-white",
	[StatusType.GateClosed]: "bg-gray-700 text-white",

	// Alert
	[StatusType.Cancelled]: "bg-[#C41230] text-white",
	[StatusType.Delayed]: "bg-red-100 text-[#C41230]",

	// Info
	[StatusType.Estimated]: "bg-amber-50 text-amber-700",
	[StatusType.Unknown]: "bg-gray-100 text-gray-500",
};

const badgeLabels: Record<StatusType, string> = {
	[StatusType.Departed]: "Dep",
	[StatusType.Landed]: "Arr",
	[StatusType.AtGate]: "Gate",
	[StatusType.Boarding]: "Board",
	[StatusType.BoardingSoon]: "Soon",
	[StatusType.FinalCall]: "Final",
	[StatusType.GateClosed]: "Closed",
	[StatusType.Cancelled]: "Canx",
	[StatusType.Delayed]: "Delay",
	[StatusType.Estimated]: "Est",
	[StatusType.Unknown]: "Sched",
};

/** Status types with actual completion time */
const ACTUAL_TIME_STATUSES: Set<StatusType> = new Set([
	StatusType.Departed,
	StatusType.Landed,
	StatusType.AtGate,
]);

export const CompactTimeStatus: Component<CompactTimeStatusProps> = (props) => {
	const hasActualTime = () => ACTUAL_TIME_STATUSES.has(props.status.type);
	const timeChanged = () =>
		props.status.time && props.scheduledTime !== props.status.time;
	const isOnTime = () => hasActualTime() && !timeChanged();
	const isCancelled = () => props.status.type === StatusType.Cancelled;

	// Display time: actual/estimated if changed, otherwise scheduled
	const displayTime = () => props.status.time || props.scheduledTime;

	// Time color
	const timeColor = () => {
		if (isCancelled()) return "text-gray-400 line-through";
		if (isOnTime()) return "text-emerald-600";
		if (timeChanged() && hasActualTime()) return "text-emerald-600";
		if (timeChanged()) return "text-amber-600";
		return "text-gray-600";
	};

	return (
		<div class="flex items-center gap-2">
			{/* Time display */}
			<div class="flex items-center gap-1">
				{/* Show scheduled → actual if changed */}
				<Show when={timeChanged() && !isCancelled()}>
					<span class="text-xs tabular-nums text-gray-400 line-through">
						{props.scheduledTime}
					</span>
					<span class="text-gray-300">→</span>
				</Show>

				{/* Main time */}
				<span class={`text-sm font-bold tabular-nums ${timeColor()}`}>
					{displayTime()}
				</span>

				{/* Cross-day indicator */}
				<Show when={props.status.isDifferentDate && props.status.date}>
					<span class="text-[10px] text-gray-400">
						({props.status.date})
					</span>
				</Show>
			</div>

			{/* Status badge */}
			<Show
				when={!isOnTime()}
				fallback={
					<span class="inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
						<Check class="h-2.5 w-2.5" />
						OK
					</span>
				}
			>
				<span
					class={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${badgeStyles[props.status.type]}`}
				>
					<Show when={props.status.type === StatusType.Estimated}>
						<Clock class="h-2.5 w-2.5" />
					</Show>
					{badgeLabels[props.status.type]}
				</span>
			</Show>
		</div>
	);
};
