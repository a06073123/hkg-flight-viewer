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

// Status badge styles (HKIA-inspired)
const statusStyles: Record<StatusType, string> = {
	// Completed states
	[StatusType.Departed]: "bg-[#003580]/10 text-[#003580]",
	[StatusType.Landed]: "bg-[#003580]/10 text-[#003580]",
	[StatusType.AtGate]: "bg-[#003580]/10 text-[#003580]",

	// Urgent boarding states
	[StatusType.Boarding]: "bg-amber-500 text-white",
	[StatusType.BoardingSoon]: "bg-amber-100 text-amber-800",
	[StatusType.FinalCall]: "bg-red-500 text-white animate-pulse",
	[StatusType.GateClosed]: "bg-gray-700 text-white",

	// Alert states
	[StatusType.Cancelled]: "bg-[#C41230] text-white",
	[StatusType.Delayed]: "bg-red-100 text-[#C41230]",

	// Informational
	[StatusType.Estimated]: "bg-amber-50 text-amber-700",
	[StatusType.Unknown]: "bg-gray-100 text-gray-500",
};

const statusLabels: Record<StatusType, string> = {
	[StatusType.Departed]: "Departed",
	[StatusType.Landed]: "Landed",
	[StatusType.AtGate]: "At Gate",
	[StatusType.Boarding]: "Boarding",
	[StatusType.BoardingSoon]: "Boarding Soon",
	[StatusType.FinalCall]: "Final Call",
	[StatusType.GateClosed]: "Gate Closed",
	[StatusType.Cancelled]: "Cancelled",
	[StatusType.Delayed]: "Delayed",
	[StatusType.Estimated]: "Estimated",
	[StatusType.Unknown]: "Scheduled",
};

/** Status types that indicate flight has actual time */
const ACTUAL_TIME_STATUSES: Set<StatusType> = new Set([
	StatusType.Departed,
	StatusType.Landed,
	StatusType.AtGate,
]);

/** Status types that indicate flight is in boarding process */
const BOARDING_STATUSES: Set<StatusType> = new Set([
	StatusType.Boarding,
	StatusType.BoardingSoon,
	StatusType.FinalCall,
	StatusType.GateClosed,
]);

/** Status types with no meaningful time update */
const NO_TIME_STATUSES: Set<StatusType> = new Set([
	StatusType.Cancelled,
	StatusType.Unknown,
]);

export const FlightTimeStatus: Component<FlightTimeStatusProps> = (props) => {
	// Computed states
	const hasActualTime = () => ACTUAL_TIME_STATUSES.has(props.status.type);
	const isBoarding = () => BOARDING_STATUSES.has(props.status.type);
	const hasNoTime = () => NO_TIME_STATUSES.has(props.status.type);
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

	// Time color based on status
	const timeColor = () => {
		if (isOnTime()) return "text-emerald-600";
		if (timeChanged() && hasActualTime()) return "text-emerald-600";
		if (timeChanged() && isEstimated()) return "text-amber-600";
		if (isBoarding()) return "text-amber-600";
		if (hasNoTime()) return "text-gray-400";
		return "text-[#1A1A1B]";
	};

	// Fixed dimensions
	const containerWidth = props.compact ? "w-28" : "w-44";
	const timeSize = props.compact ? "text-2xl" : "text-3xl";

	return (
		<div class={`flex flex-col items-end ${containerWidth}`}>
			{/* === MAIN TIME DISPLAY (always same position) === */}
			<div class="text-right">
				{/* Time label */}
				<div class="flex items-center justify-end gap-1 text-gray-400">
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
				<div class="flex items-center justify-end gap-1">
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
							class={`rounded px-1 py-0.5 text-xs font-bold ${
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
					<div class="mt-0.5 flex items-center justify-end gap-1 text-gray-400">
						<span class="text-[10px]">was</span>
						<span class="text-sm tabular-nums line-through decoration-red-400">
							{props.scheduledTime}
						</span>
					</div>
				</Show>
			</div>

			{/* === STATUS BADGE === */}
			<div class={props.compact ? "mt-1" : "mt-2"}>
				<Show
					when={isOnTime()}
					fallback={
						<span
							class={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[props.status.type]}`}
							data-status={props.status.type}
						>
							{statusLabels[props.status.type]}
						</span>
					}
				>
					{/* On Time badge - special style */}
					<span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
						<Check class="h-3 w-3" />
						On Time
					</span>
				</Show>
			</div>
		</div>
	);
};
