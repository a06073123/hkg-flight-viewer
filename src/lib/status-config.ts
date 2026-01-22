/**
 * Flight Status Configuration
 *
 * Centralized configuration for flight status display including:
 * - Severity levels (0-5) for visual hierarchy
 * - Color schemes matching HKIA visual identity
 * - Flash animation speeds for urgent statuses
 *
 * Design Philosophy:
 * - Level 0: No visual emphasis (completed/informational)
 * - Level 1-2: Low urgency (boarding soon, estimated)
 * - Level 3: Medium urgency (boarding, delayed)
 * - Level 4: High urgency (final call)
 * - Level 5: Critical (gate closed, cancelled)
 */

import { StatusType } from "@/types/flight";

// ============================================================================
// STATUS SEVERITY LEVELS
// ============================================================================

/**
 * Severity levels for flight statuses
 *
 * Level 0: No impact on passengers - completed or normal state
 * Level 1: Informational - slight awareness needed
 * Level 2: Attention - passenger should be aware
 * Level 3: Action needed - passenger should prepare
 * Level 4: Urgent - immediate action required
 * Level 5: Critical - final warning or negative outcome
 */
export const StatusSeverity = {
	None: 0, // No visual emphasis
	Info: 1, // Informational only
	Attention: 2, // Slight attention needed
	Action: 3, // Action recommended
	Urgent: 4, // Immediate action needed
	Critical: 5, // Final warning / negative
} as const;
export type StatusSeverity = (typeof StatusSeverity)[keyof typeof StatusSeverity];

/**
 * Map each status type to its severity level
 */
export const STATUS_SEVERITY_MAP: Record<StatusType, StatusSeverity> = {
	// Level 0: Completed / No impact
	[StatusType.Departed]: StatusSeverity.None,
	[StatusType.Landed]: StatusSeverity.None,
	[StatusType.AtGate]: StatusSeverity.None,
	[StatusType.Unknown]: StatusSeverity.None,

	// Level 1: Informational
	[StatusType.Estimated]: StatusSeverity.Info,

	// Level 2: Attention
	[StatusType.BoardingSoon]: StatusSeverity.Attention,

	// Level 3: Action needed - Green (positive action)
	[StatusType.Boarding]: StatusSeverity.Action,
	[StatusType.Delayed]: StatusSeverity.Action,

	// Level 4: Urgent - Red, fast flash
	[StatusType.FinalCall]: StatusSeverity.Urgent,

	// Level 5: Critical - Final state
	[StatusType.GateClosed]: StatusSeverity.Critical,
	[StatusType.Cancelled]: StatusSeverity.Critical,
};

// ============================================================================
// COLOR CONFIGURATION
// ============================================================================

/**
 * Status color configuration with Tailwind classes
 *
 * Each status has:
 * - bg: Background color class
 * - text: Text color class
 * - border: Border color class (optional)
 */
export interface StatusColorConfig {
	bg: string;
	text: string;
	border?: string;
	/** For time display when status affects scheduled time */
	timeText?: string;
}

/**
 * Status colors following HKIA visual identity and severity levels
 */
export const STATUS_COLORS: Record<StatusType, StatusColorConfig> = {
	// Level 0: Completed - HKIA Blue (subtle, professional)
	[StatusType.Departed]: {
		bg: "bg-[#003580]/10",
		text: "text-[#003580]",
		timeText: "text-emerald-600",
	},
	[StatusType.Landed]: {
		bg: "bg-[#003580]/10",
		text: "text-[#003580]",
		timeText: "text-emerald-600",
	},
	[StatusType.AtGate]: {
		bg: "bg-[#003580]/10",
		text: "text-[#003580]",
		timeText: "text-emerald-600",
	},

	// Level 0: Unknown - Gray (neutral)
	[StatusType.Unknown]: {
		bg: "bg-gray-100",
		text: "text-gray-500",
		timeText: "text-gray-600",
	},

	// Level 1: Estimated - Amber (informational)
	[StatusType.Estimated]: {
		bg: "bg-amber-50",
		text: "text-amber-700",
		timeText: "text-amber-600",
	},

	// Level 2: Boarding Soon - Light amber (attention)
	[StatusType.BoardingSoon]: {
		bg: "bg-amber-100",
		text: "text-amber-800",
		timeText: "text-amber-600",
	},

	// Level 3: Boarding - Green (positive action)
	[StatusType.Boarding]: {
		bg: "bg-emerald-500",
		text: "text-white",
		timeText: "text-emerald-600",
	},

	// Level 3: Delayed - Orange (warning but not critical)
	[StatusType.Delayed]: {
		bg: "bg-orange-100",
		text: "text-orange-700",
		border: "border-orange-300",
		timeText: "text-orange-600",
	},

	// Level 4: Final Call - Red (urgent)
	[StatusType.FinalCall]: {
		bg: "bg-red-500",
		text: "text-white",
		timeText: "text-red-600",
	},

	// Level 5: Gate Closed - Dark gray (final, no action possible)
	[StatusType.GateClosed]: {
		bg: "bg-gray-700",
		text: "text-white",
		timeText: "text-gray-500",
	},

	// Level 5: Cancelled - HKIA Alert Red (critical)
	[StatusType.Cancelled]: {
		bg: "bg-[#C41230]",
		text: "text-white",
		timeText: "text-gray-400",
	},
};

// ============================================================================
// ANIMATION CONFIGURATION
// ============================================================================

/**
 * Flash animation speed configuration
 *
 * Speeds are CSS animation duration values
 * Faster = more urgent
 */
export const FlashSpeed = {
	None: "none",
	Slow: "3s", // Gentle pulse
	Medium: "1.5s", // Noticeable
	Fast: "0.75s", // Urgent
	Rapid: "0.4s", // Critical
} as const;
export type FlashSpeed = (typeof FlashSpeed)[keyof typeof FlashSpeed];

/**
 * Map severity levels to flash speeds
 */
export const SEVERITY_FLASH_SPEED: Record<StatusSeverity, FlashSpeed> = {
	[StatusSeverity.None]: FlashSpeed.None,
	[StatusSeverity.Info]: FlashSpeed.None,
	[StatusSeverity.Attention]: FlashSpeed.Slow,
	[StatusSeverity.Action]: FlashSpeed.Medium,
	[StatusSeverity.Urgent]: FlashSpeed.Fast,
	[StatusSeverity.Critical]: FlashSpeed.Rapid,
};

/**
 * Custom flash speeds per status (overrides severity defaults if needed)
 */
export const STATUS_FLASH_SPEED: Record<StatusType, FlashSpeed> = {
	// No flash for completed/informational
	[StatusType.Departed]: FlashSpeed.None,
	[StatusType.Landed]: FlashSpeed.None,
	[StatusType.AtGate]: FlashSpeed.None,
	[StatusType.Unknown]: FlashSpeed.None,
	[StatusType.Estimated]: FlashSpeed.None,

	// Slow flash for attention
	[StatusType.BoardingSoon]: FlashSpeed.Slow,

	// Medium flash for action needed
	[StatusType.Boarding]: FlashSpeed.Medium,
	[StatusType.Delayed]: FlashSpeed.Slow, // Delayed is persistent, no need fast flash

	// Fast flash for urgent
	[StatusType.FinalCall]: FlashSpeed.Fast,

	// Rapid flash for critical (short duration)
	[StatusType.GateClosed]: FlashSpeed.None, // Gate closed = too late, no flash
	[StatusType.Cancelled]: FlashSpeed.None, // Cancelled = final, no flash
};

// ============================================================================
// TAILWIND ANIMATION CLASSES
// ============================================================================

/**
 * Get Tailwind animation class for a status type
 */
export function getStatusAnimationClass(status: StatusType): string {
	const speed = STATUS_FLASH_SPEED[status];

	switch (speed) {
		case FlashSpeed.Slow:
			return "animate-pulse-slow";
		case FlashSpeed.Medium:
			return "animate-pulse-medium";
		case FlashSpeed.Fast:
			return "animate-pulse-fast";
		case FlashSpeed.Rapid:
			return "animate-pulse-rapid";
		default:
			return "";
	}
}

// ============================================================================
// STATUS LABELS
// ============================================================================

/**
 * Full status labels for display
 */
export const STATUS_LABELS: Record<StatusType, string> = {
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

/**
 * Compact status labels for badges
 */
export const STATUS_LABELS_COMPACT: Record<StatusType, string> = {
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the severity level for a status
 */
export function getStatusSeverity(status: StatusType): StatusSeverity {
	return STATUS_SEVERITY_MAP[status];
}

/**
 * Get the color configuration for a status
 */
export function getStatusColors(status: StatusType): StatusColorConfig {
	return STATUS_COLORS[status];
}

/**
 * Get the flash speed for a status
 */
export function getStatusFlashSpeed(status: StatusType): FlashSpeed {
	return STATUS_FLASH_SPEED[status];
}

/**
 * Check if a status requires visual emphasis (severity > 0)
 */
export function statusRequiresEmphasis(status: StatusType): boolean {
	return STATUS_SEVERITY_MAP[status] > StatusSeverity.None;
}

/**
 * Check if a status indicates completion (actual time available)
 */
export function isCompletedStatus(status: StatusType): boolean {
	return (
		status === StatusType.Departed ||
		status === StatusType.Landed ||
		status === StatusType.AtGate
	);
}

/**
 * Check if a status is in boarding process
 */
export function isBoardingStatus(status: StatusType): boolean {
	return (
		status === StatusType.Boarding ||
		status === StatusType.BoardingSoon ||
		status === StatusType.FinalCall ||
		status === StatusType.GateClosed
	);
}

/**
 * Check if a status indicates no time update (cancelled/unknown)
 */
export function hasNoTimeUpdate(status: StatusType): boolean {
	return status === StatusType.Cancelled || status === StatusType.Unknown;
}

/**
 * Get combined badge classes for a status
 */
export function getStatusBadgeClasses(status: StatusType): string {
	const colors = STATUS_COLORS[status];
	const animation = getStatusAnimationClass(status);

	const classes = [colors.bg, colors.text];

	if (colors.border) {
		classes.push("border", colors.border);
	}

	if (animation) {
		classes.push(animation);
	}

	return classes.join(" ");
}

/**
 * Get time display color based on status
 */
export function getStatusTimeColor(status: StatusType): string {
	return STATUS_COLORS[status].timeText || "text-gray-600";
}

// ============================================================================
// GATE STATUS CONFIGURATION (for Map page)
// ============================================================================

import { GateStatus } from "@/types/map";

/**
 * Gate status color configuration
 *
 * Gate statuses are simplified versions of flight statuses:
 * - Boarding: Active boarding (matches Flight Boarding/FinalCall)
 * - Scheduled: Flight assigned but not yet boarding
 * - Idle: No active flight
 */
export interface GateStatusColorConfig {
	/** Background color for status indicator dot */
	dotBg: string;
	/** Background color for badge/card */
	badgeBg: string;
	/** Text color */
	text: string;
	/** Border color */
	border: string;
	/** Ring color for active states */
	ring?: string;
}

export const GATE_STATUS_COLORS: Record<GateStatus, GateStatusColorConfig> = {
	// Boarding - Green (consistent with flight Boarding)
	// Using green instead of yellow to match the flight status system
	[GateStatus.Boarding]: {
		dotBg: "bg-emerald-500",
		badgeBg: "bg-emerald-100",
		text: "text-emerald-800",
		border: "border-emerald-300",
		ring: "ring-emerald-300",
	},

	// Scheduled - HKIA Blue (consistent with completed/scheduled flights)
	[GateStatus.Scheduled]: {
		dotBg: "bg-[#003580]",
		badgeBg: "bg-blue-100",
		text: "text-blue-800",
		border: "border-blue-300",
	},

	// Idle - Gray (no activity)
	[GateStatus.Idle]: {
		dotBg: "bg-gray-300",
		badgeBg: "bg-gray-100",
		text: "text-gray-600",
		border: "border-gray-300",
	},
};

export const GATE_STATUS_LABELS: Record<GateStatus, string> = {
	[GateStatus.Boarding]: "Boarding",
	[GateStatus.Scheduled]: "Scheduled",
	[GateStatus.Idle]: "Idle",
};

/**
 * Gate status flash speed
 */
export const GATE_STATUS_FLASH: Record<GateStatus, FlashSpeed> = {
	[GateStatus.Boarding]: FlashSpeed.Medium,
	[GateStatus.Scheduled]: FlashSpeed.None,
	[GateStatus.Idle]: FlashSpeed.None,
};

/**
 * Get animation class for gate status
 */
export function getGateStatusAnimationClass(status: GateStatus): string {
	const speed = GATE_STATUS_FLASH[status];

	switch (speed) {
		case FlashSpeed.Slow:
			return "animate-pulse-slow";
		case FlashSpeed.Medium:
			return "animate-pulse-medium";
		case FlashSpeed.Fast:
			return "animate-pulse-fast";
		case FlashSpeed.Rapid:
			return "animate-pulse-rapid";
		default:
			return "";
	}
}

/**
 * Get combined classes for gate status badge
 */
export function getGateStatusBadgeClasses(status: GateStatus): string {
	const colors = GATE_STATUS_COLORS[status];
	const animation = getGateStatusAnimationClass(status);

	const classes = [colors.badgeBg, colors.text, "border", colors.border];

	if (animation) {
		classes.push(animation);
	}

	return classes.join(" ");
}
