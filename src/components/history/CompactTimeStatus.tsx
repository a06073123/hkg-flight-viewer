/**
 * CompactTimeStatus - Single-line time and status display for history tables
 *
 * Design goals:
 * - Minimal height (single line)
 * - Show key info: actual/estimated time + status badge
 * - Color-coded for quick scanning
 * - Show day offset for extreme delays (e.g., "+2d" for 2 days delayed)
 *
 * Layout: [Time Change Indicator] [Actual Time] [Day Offset] [Status Badge]
 * Example: "→ 23:18 ✓ OK" or "→ 13:45 +2d Est"
 */

import {
	getStatusBadgeClasses,
	isCompletedStatus,
	STATUS_LABELS_COMPACT,
} from "@/lib/status-config";
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

/**
 * Format day offset as a compact string
 * e.g., +1d, +2d, -1d
 */
function formatDayOffset(offset: number): string {
	if (offset === 0) return "";
	const sign = offset > 0 ? "+" : "";
	return `${sign}${offset}d`;
}

export const CompactTimeStatus: Component<CompactTimeStatusProps> = (props) => {
	const hasActualTime = () => isCompletedStatus(props.status.type);
	const timeChanged = () =>
		props.status.time && props.scheduledTime !== props.status.time;
	const isOnTime = () =>
		hasActualTime() && !timeChanged() && !props.status.dayOffset;
	const isCancelled = () => props.status.type === StatusType.Cancelled;

	// Display time: actual/estimated if changed, otherwise scheduled
	const displayTime = () => props.status.time || props.scheduledTime;

	// Day offset display
	const dayOffsetText = () => {
		const offset = props.status.dayOffset;
		if (offset === undefined || offset === 0) return null;
		return formatDayOffset(offset);
	};

	// Time color - extreme delays get special treatment
	const timeColor = () => {
		if (isCancelled()) return "text-gray-400 line-through";
		if (isOnTime()) return "text-emerald-600";

		const offset = props.status.dayOffset ?? 0;

		// Extreme delay (2+ days)
		if (offset >= 2) return "text-red-600";
		// Significant delay (1 day)
		if (offset >= 1) return "text-orange-600";

		if (timeChanged() && hasActualTime()) return "text-emerald-600";
		if (timeChanged()) return "text-amber-600";
		return "text-gray-600";
	};

	return (
		<div class="flex items-center gap-1.5">
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

				{/* Day offset badge for multi-day delays */}
				<Show when={dayOffsetText()}>
					<span
						class={`rounded px-1 py-0.5 text-[9px] font-bold ${
							(props.status.dayOffset ?? 0) >= 2
								? "bg-red-100 text-red-700"
								: "bg-orange-100 text-orange-700"
						}`}
					>
						{dayOffsetText()}
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
					class={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${getStatusBadgeClasses(props.status.type)}`}
				>
					<Show when={props.status.type === StatusType.Estimated}>
						<Clock class="h-2.5 w-2.5" />
					</Show>
					{STATUS_LABELS_COMPACT[props.status.type]}
				</span>
			</Show>
		</div>
	);
};
