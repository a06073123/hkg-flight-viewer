/**
 * StatusBadge - Reusable flight status badge component
 *
 * Uses centralized status configuration for consistent display across the app.
 * Supports different sizes and variants.
 */

import {
    getStatusBadgeClasses,
    getStatusSeverity,
    STATUS_LABELS,
    STATUS_LABELS_COMPACT,
} from "@/lib/status-config";
import type { StatusType } from "@/types/flight";
import type { Component, JSX } from "solid-js";
import { Show } from "solid-js";

export interface StatusBadgeProps {
	/** The status type to display */
	status: StatusType;
	/** Use compact labels */
	compact?: boolean;
	/** Size variant */
	size?: "xs" | "sm" | "md";
	/** Custom class names */
	class?: string;
	/** Icon to show before label */
	icon?: JSX.Element;
	/** Show as pill (rounded-full) or regular (rounded) */
	pill?: boolean;
}

const sizeClasses = {
	xs: "px-1 py-0.5 text-[9px]",
	sm: "px-1.5 py-0.5 text-[10px]",
	md: "px-2 py-0.5 text-xs",
};

export const StatusBadge: Component<StatusBadgeProps> = (props) => {
	const label = () =>
		props.compact
			? STATUS_LABELS_COMPACT[props.status]
			: STATUS_LABELS[props.status];

	const severity = () => getStatusSeverity(props.status);
	const baseClasses = () => getStatusBadgeClasses(props.status);
	const sizeClass = () => sizeClasses[props.size ?? "sm"];
	const roundedClass = () => (props.pill !== false ? "rounded-full" : "rounded");

	return (
		<span
			class={`inline-flex items-center gap-0.5 font-semibold ${roundedClass()} ${sizeClass()} ${baseClasses()} ${props.class ?? ""}`}
			data-status={props.status}
			data-severity={severity()}
		>
			<Show when={props.icon}>{props.icon}</Show>
			{label()}
		</span>
	);
};

/**
 * OnTimeBadge - Special badge for on-time flights
 */
export interface OnTimeBadgeProps {
	/** Size variant */
	size?: "xs" | "sm" | "md";
	/** Custom class names */
	class?: string;
	/** Show checkmark icon */
	showIcon?: boolean;
}

export const OnTimeBadge: Component<OnTimeBadgeProps> = (props) => {
	const sizeClass = () => sizeClasses[props.size ?? "sm"];

	return (
		<span
			class={`inline-flex items-center gap-0.5 rounded-full bg-emerald-100 font-semibold text-emerald-700 ${sizeClass()} ${props.class ?? ""}`}
		>
			<Show when={props.showIcon !== false}>
				<svg
					class="h-2.5 w-2.5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="3"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
			</Show>
			OK
		</span>
	);
};

export default StatusBadge;
