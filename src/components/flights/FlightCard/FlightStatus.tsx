/**
 * FlightStatus Sub-component
 *
 * Renders the status badge with HKIA-style FIDS coloring
 * - Departed/Arrived: Deep blue text on light grey
 * - Delayed: Red with pulse animation
 * - Boarding/Final Call: Yellow background (urgent)
 */

import type { Component } from "solid-js";
import type { ParsedStatus } from "../../../types/flight";
import { StatusType } from "../../../types/flight";

export interface FlightStatusProps {
	status: ParsedStatus;
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

export const FlightStatus: Component<FlightStatusProps> = (props) => {
	const style = () => statusStyles[props.status.type];
	const label = () => statusLabels[props.status.type];

	return (
		<span
			class={`flight-status inline-flex items-center rounded px-2.5 py-1 text-xs font-medium ${style()}`}
			data-status={props.status.type}
		>
			{label()}
			{props.status.time && (
				<span class="ml-1 font-normal opacity-80">
					{props.status.time}
				</span>
			)}
		</span>
	);
};
