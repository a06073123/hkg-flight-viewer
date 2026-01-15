/**
 * FlightStatus Sub-component
 *
 * Renders the status badge with appropriate styling
 */

import type { Component } from "solid-js";
import type { ParsedStatus } from "../../../types/flight";
import { StatusType } from "../../../types/flight";

export interface FlightStatusProps {
	status: ParsedStatus;
}

const statusStyles: Record<StatusType, string> = {
	[StatusType.Departed]: "bg-green-100 text-green-800",
	[StatusType.Landed]: "bg-green-100 text-green-800",
	[StatusType.AtGate]: "bg-blue-100 text-blue-800",
	[StatusType.Boarding]: "bg-yellow-100 text-yellow-800",
	[StatusType.BoardingSoon]: "bg-yellow-100 text-yellow-800",
	[StatusType.FinalCall]: "bg-orange-100 text-orange-800",
	[StatusType.GateClosed]: "bg-red-100 text-red-800",
	[StatusType.Cancelled]: "bg-red-100 text-red-800",
	[StatusType.Delayed]: "bg-red-100 text-red-800",
	[StatusType.Estimated]: "bg-gray-100 text-gray-800",
	[StatusType.Unknown]: "bg-gray-100 text-gray-600",
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
			class={`flight-status inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style()}`}
			data-status={props.status.type}
		>
			{label()}
			{props.status.time && (
				<span class="ml-1 font-normal">{props.status.time}</span>
			)}
		</span>
	);
};
