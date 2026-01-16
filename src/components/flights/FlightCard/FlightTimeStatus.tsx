/**
 * FlightTimeStatus Component
 *
 * Integrated display of flight time and status
 * Shows scheduled time, estimated/actual time (with strikethrough if changed),
 * and status badge
 *
 * Visual hierarchy:
 * - If time changed: Show original (strikethrough, small) + new time (large)
 * - Status badge below the time display
 */

import { Clock } from "lucide-solid";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { ParsedStatus } from "../../../types/flight";
import { StatusType } from "../../../types/flight";

export interface FlightTimeStatusProps {
	/** Scheduled time (HH:MM) */
	scheduledTime: string;
	/** Parsed status with actual/estimated time */
	status: ParsedStatus;
	/** Show compact version */
	compact?: boolean;
}

// HKIA-inspired status styles
const statusStyles: Record<StatusType, string> = {
	// Completed states - Deep blue on light grey
	[StatusType.Departed]: "bg-gray-100 text-[#003580] font-semibold",
	[StatusType.Landed]: "bg-gray-100 text-[#003580] font-semibold",
	[StatusType.AtGate]: "bg-blue-50 text-[#003580]",

	// Urgent states - Yellow background (high visibility)
	[StatusType.Boarding]: "status-urgent",
	[StatusType.BoardingSoon]: "bg-amber-100 text-amber-900 font-semibold",
	[StatusType.FinalCall]: "status-urgent animate-pulse",
	[StatusType.GateClosed]: "bg-gray-700 text-white font-semibold",

	// Alert states - Red (delayed/cancelled)
	[StatusType.Cancelled]: "bg-[#C41230] text-white font-bold",
	[StatusType.Delayed]: "bg-red-100 text-[#C41230] font-bold status-delayed",

	// Informational
	[StatusType.Estimated]: "bg-gray-100 text-gray-700",
	[StatusType.Unknown]: "bg-gray-50 text-gray-500",
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
	[StatusType.Unknown]: "—",
};

/**
 * Check if the time has changed from scheduled
 */
function hasTimeChanged(scheduledTime: string, status: ParsedStatus): boolean {
	if (!status.time) return false;
	// Compare HH:MM format
	return scheduledTime !== status.time;
}

/**
 * Get the display label for the new time
 */
function getTimeLabel(status: ParsedStatus): string {
	switch (status.type) {
		case StatusType.Departed:
			return "Actual";
		case StatusType.Landed:
			return "Actual";
		case StatusType.AtGate:
			return "Actual";
		case StatusType.Estimated:
			return "Est.";
		case StatusType.Delayed:
			return "Delayed";
		default:
			return "Est.";
	}
}

export const FlightTimeStatus: Component<FlightTimeStatusProps> = (props) => {
	const timeChanged = () => hasTimeChanged(props.scheduledTime, props.status);
	const displayTime = () => props.status.time || props.scheduledTime;
	const style = () => statusStyles[props.status.type];
	const label = () => statusLabels[props.status.type];
	const timeLabel = () => getTimeLabel(props.status);

	// Check if status indicates a completed or known actual time
	const hasActualTime = () =>
		props.status.type === StatusType.Departed ||
		props.status.type === StatusType.Landed ||
		props.status.type === StatusType.AtGate;

	// Check if status indicates an estimated time
	const hasEstimatedTime = () =>
		props.status.type === StatusType.Estimated ||
		(props.status.type === StatusType.Delayed && props.status.time);

	// Fixed width to prevent layout shift
	const containerWidth = props.compact ? "w-28" : "w-44";

	return (
		<div class={`flex flex-col items-end ${containerWidth}`}>
			{/* Time Display */}
			<div class="text-right">
				<Show
					when={
						timeChanged() && (hasActualTime() || hasEstimatedTime())
					}
					fallback={
						<>
							{/* No change - show scheduled time normally */}
							<div class="flex items-center justify-end gap-1.5 text-gray-400">
								<Clock class="h-3.5 w-3.5" />
								<span class="text-xs uppercase">Scheduled</span>
							</div>
							<span
								class={`tabular-nums text-[#1A1A1B] ${props.compact ? "text-2xl font-bold" : "text-4xl font-black"}`}
							>
								{props.scheduledTime}
							</span>
						</>
					}
				>
					{/* Time changed - show strikethrough original + new time */}
					<div class="flex items-center justify-end gap-1.5 text-gray-400">
						<Clock class="h-3.5 w-3.5" />
						<span class="text-xs uppercase">Scheduled</span>
					</div>
					<div class="flex items-baseline justify-end gap-2">
						<span class="text-lg tabular-nums text-gray-400 line-through decoration-red-400 decoration-2">
							{props.scheduledTime}
						</span>
						<span class="text-xs font-medium text-gray-500">→</span>
					</div>
					<div class="mt-0.5 flex flex-wrap items-baseline justify-end gap-x-1.5">
						<span
							class={`text-xs font-medium ${hasActualTime() ? "text-emerald-600" : "text-amber-600"}`}
						>
							{timeLabel()}
						</span>
						<span
							class={`tabular-nums ${hasActualTime() ? "text-emerald-600" : "text-amber-600"} ${props.compact ? "text-2xl font-bold" : "text-3xl font-black"}`}
						>
							{displayTime()}
						</span>
						<Show
							when={
								props.status.isDifferentDate &&
								props.status.date
							}
						>
							<span class="w-full text-right text-[10px] text-gray-500">
								({props.status.date})
							</span>
						</Show>
					</div>
				</Show>
			</div>

			{/* Status Badge */}
			<div class={props.compact ? "mt-1" : "mt-2"}>
				<span
					class={`flight-status inline-flex items-center rounded px-2.5 py-1 text-xs font-medium ${style()}`}
					data-status={props.status.type}
				>
					{label()}
				</span>
			</div>
		</div>
	);
};
