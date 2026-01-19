/**
 * FlightTimeStatus Component
 *
 * Unified display of flight time and status with consistent layout.
 *
 * Design principles:
 * 1. Main time (final/actual/estimated) ALWAYS at same position (large, top-right)
 * 2. Original scheduled time shown as secondary info when changed
 * 3. Status badge below time, aligned right
 *
 * Time display modes:
 * - ON TIME: Green time + "On Time ✓" badge
 * - CHANGED: Large new time (green/amber) + small strikethrough original
 * - CANCELLED: Original time with red badge (no new time)
 * - BOARDING: Original time with amber badge
 * - UNKNOWN: Original time with gray badge
 */

import {
	getStatusBadgeClasses,
	hasNoTimeUpdate,
	isBoardingStatus,
	isCompletedStatus,
	STATUS_LABELS,
} from "@/lib/status-config";
import type { ParsedStatus } from "@/types/flight";
import { StatusType } from "@/types/flight";
import { Check, Clock } from "lucide-solid";
import type { Component } from "solid-js";
import { Match, Show, Switch } from "solid-js";

export interface FlightTimeStatusProps {
	/** Scheduled time (HH:MM) */
	scheduledTime: string;
	/** Parsed status with actual/estimated time */
	status: ParsedStatus;
	/** Show compact version */
	compact?: boolean;
}

export const FlightTimeStatus: Component<FlightTimeStatusProps> = (props) => {
	// Computed states using centralized helpers
	const hasActualTime = () => isCompletedStatus(props.status.type);
	const isBoarding = () => isBoardingStatus(props.status.type);
	const hasNoTime = () => hasNoTimeUpdate(props.status.type);
	const isEstimated = () =>
		props.status.type === StatusType.Estimated ||
		props.status.type === StatusType.Delayed;

	// Time comparison
	const timeChanged = () =>
		props.status.time && props.scheduledTime !== props.status.time;

	// On Time = completed + no time change
	const isOnTime = () => hasActualTime() && !timeChanged();

	// Main display time (always at same position)
	const mainTime = () => {
		if (hasNoTime()) return props.scheduledTime;
		if (timeChanged()) return props.status.time!;
		return props.scheduledTime;
	};

	// Time color based on status - use centralized config for status-based color
	const timeColor = () => {
		if (isOnTime()) return "text-emerald-600";
		if (timeChanged() && hasActualTime()) return "text-emerald-600";
		if (timeChanged() && isEstimated()) return "text-amber-600";
		if (isBoarding()) return "text-amber-600";
		if (hasNoTime()) return "text-gray-400";
		return "text-[#1A1A1B]";
	};

	// Responsive dimensions
	const timeSize = props.compact 
		? "text-xl sm:text-2xl" 
		: "text-2xl sm:text-3xl";

	return (
		<div class="flex flex-col items-center xs:items-end">
			{/* === MAIN TIME DISPLAY (always same position) === */}
			<div class="text-center xs:text-right">
				{/* Time label */}
				<div class="flex items-center justify-center gap-1 text-gray-400 xs:justify-end">
					<Clock class="h-3 w-3" />
					<span class="text-[10px] uppercase tracking-wide">
						<Switch fallback="Scheduled">
							<Match when={isOnTime()}>Actual</Match>
							<Match when={timeChanged() && hasActualTime()}>
								Actual
							</Match>
							<Match when={timeChanged() && isEstimated()}>
								Est.
							</Match>
							<Match when={isBoarding()}>Scheduled</Match>
						</Switch>
					</span>
				</div>

				{/* Main time (large, consistent position) */}
				<div class="flex items-center justify-center gap-1 xs:justify-end">
					<span
						class={`${timeSize} font-black tabular-nums leading-tight ${timeColor()}`}
					>
						{mainTime()}
					</span>
					{/* Day offset badge for multi-day delays */}
					<Show
						when={
							props.status.dayOffset &&
							props.status.dayOffset !== 0
						}
					>
						<span
							class={`rounded px-1 py-0.5 text-[10px] font-bold sm:text-xs ${
								(props.status.dayOffset ?? 0) >= 2
									? "bg-red-100 text-red-700"
									: (props.status.dayOffset ?? 0) >= 1
										? "bg-orange-100 text-orange-700"
										: "bg-blue-100 text-blue-700"
							}`}
						>
							{(props.status.dayOffset ?? 0) > 0 ? "+" : ""}
							{props.status.dayOffset}d
						</span>
					</Show>
				</div>

				{/* Original time when changed (shown below as secondary) */}
				<Show when={timeChanged() && !hasNoTime()}>
					<div class="mt-0.5 flex items-center justify-center gap-1 text-gray-400 xs:justify-end">
						<span class="text-[10px]">was</span>
						<span class="text-xs tabular-nums line-through decoration-red-400 sm:text-sm">
							{props.scheduledTime}
						</span>
					</div>
				</Show>
			</div>

			{/* === STATUS BADGE === */}
			<div class={props.compact ? "mt-1" : "mt-1.5 sm:mt-2"}>
				<Show
					when={isOnTime()}
					fallback={
						<span
							class={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:text-xs ${getStatusBadgeClasses(props.status.type)}`}
							data-status={props.status.type}
						>
							{STATUS_LABELS[props.status.type]}
						</span>
					}
				>
					{/* On Time badge - special style */}
					<span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 sm:px-2.5 sm:text-xs">
						<Check class="h-3 w-3" />
						On Time
					</span>
				</Show>
			</div>
		</div>
	);
};
