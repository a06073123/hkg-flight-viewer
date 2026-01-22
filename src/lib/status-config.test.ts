/**
 * Tests for status-config.ts
 *
 * Ensures all status types are properly configured
 * and helper functions work correctly.
 */

import { StatusType } from "@/types/flight";
import { GateStatus } from "@/types/map";
import { describe, expect, it } from "vitest";
import {
    FlashSpeed,
    GATE_STATUS_COLORS,
    GATE_STATUS_FLASH,
    GATE_STATUS_LABELS,
    getGateStatusAnimationClass,
    getGateStatusBadgeClasses,
    getStatusAnimationClass,
    getStatusBadgeClasses,
    getStatusColors,
    getStatusFlashSpeed,
    getStatusSeverity,
    getStatusTimeColor,
    hasNoTimeUpdate,
    isBoardingStatus,
    isCompletedStatus,
    STATUS_COLORS,
    STATUS_FLASH_SPEED,
    STATUS_LABELS,
    STATUS_LABELS_COMPACT,
    STATUS_SEVERITY_MAP,
    statusRequiresEmphasis,
    StatusSeverity,
} from "./status-config";

describe("STATUS_SEVERITY_MAP", () => {
	it("should have mapping for all status types", () => {
		const allStatusTypes = Object.values(StatusType);
		for (const status of allStatusTypes) {
			expect(STATUS_SEVERITY_MAP[status]).toBeDefined();
			expect(typeof STATUS_SEVERITY_MAP[status]).toBe("number");
		}
	});

	it("should assign level 0 to completed statuses", () => {
		expect(STATUS_SEVERITY_MAP[StatusType.Departed]).toBe(StatusSeverity.None);
		expect(STATUS_SEVERITY_MAP[StatusType.Landed]).toBe(StatusSeverity.None);
		expect(STATUS_SEVERITY_MAP[StatusType.AtGate]).toBe(StatusSeverity.None);
	});

	it("should assign higher severity to urgent statuses", () => {
		expect(STATUS_SEVERITY_MAP[StatusType.FinalCall]).toBeGreaterThan(
			STATUS_SEVERITY_MAP[StatusType.Boarding]
		);
		expect(STATUS_SEVERITY_MAP[StatusType.Boarding]).toBeGreaterThan(
			STATUS_SEVERITY_MAP[StatusType.BoardingSoon]
		);
	});
});

describe("STATUS_COLORS", () => {
	it("should have colors for all status types", () => {
		const allStatusTypes = Object.values(StatusType);
		for (const status of allStatusTypes) {
			expect(STATUS_COLORS[status]).toBeDefined();
			expect(STATUS_COLORS[status].bg).toBeTruthy();
			expect(STATUS_COLORS[status].text).toBeTruthy();
		}
	});

	it("should use green for boarding status", () => {
		const boardingColors = STATUS_COLORS[StatusType.Boarding];
		expect(boardingColors.bg).toContain("emerald");
	});

	it("should use red for final call status", () => {
		const finalCallColors = STATUS_COLORS[StatusType.FinalCall];
		expect(finalCallColors.bg).toContain("red");
	});

	it("should use orange for delayed status", () => {
		const delayedColors = STATUS_COLORS[StatusType.Delayed];
		expect(delayedColors.bg).toContain("orange");
	});
});

describe("STATUS_FLASH_SPEED", () => {
	it("should have flash speed for all status types", () => {
		const allStatusTypes = Object.values(StatusType);
		for (const status of allStatusTypes) {
			expect(STATUS_FLASH_SPEED[status]).toBeDefined();
		}
	});

	it("should not flash for completed statuses", () => {
		expect(STATUS_FLASH_SPEED[StatusType.Departed]).toBe(FlashSpeed.None);
		expect(STATUS_FLASH_SPEED[StatusType.Landed]).toBe(FlashSpeed.None);
		expect(STATUS_FLASH_SPEED[StatusType.AtGate]).toBe(FlashSpeed.None);
	});

	it("should flash fast for final call", () => {
		expect(STATUS_FLASH_SPEED[StatusType.FinalCall]).toBe(FlashSpeed.Fast);
	});

	it("should flash medium for boarding", () => {
		expect(STATUS_FLASH_SPEED[StatusType.Boarding]).toBe(FlashSpeed.Medium);
	});
});

describe("STATUS_LABELS", () => {
	it("should have labels for all status types", () => {
		const allStatusTypes = Object.values(StatusType);
		for (const status of allStatusTypes) {
			expect(STATUS_LABELS[status]).toBeTruthy();
			expect(STATUS_LABELS_COMPACT[status]).toBeTruthy();
		}
	});

	it("should have shorter compact labels", () => {
		expect(STATUS_LABELS_COMPACT[StatusType.Departed].length).toBeLessThan(
			STATUS_LABELS[StatusType.Departed].length
		);
	});
});

describe("Helper functions", () => {
	describe("getStatusSeverity", () => {
		it("should return correct severity level", () => {
			expect(getStatusSeverity(StatusType.Departed)).toBe(StatusSeverity.None);
			expect(getStatusSeverity(StatusType.FinalCall)).toBe(StatusSeverity.Urgent);
		});
	});

	describe("getStatusColors", () => {
		it("should return color config", () => {
			const colors = getStatusColors(StatusType.Boarding);
			expect(colors.bg).toBeTruthy();
			expect(colors.text).toBeTruthy();
		});
	});

	describe("getStatusFlashSpeed", () => {
		it("should return flash speed", () => {
			expect(getStatusFlashSpeed(StatusType.Boarding)).toBe(FlashSpeed.Medium);
			expect(getStatusFlashSpeed(StatusType.Unknown)).toBe(FlashSpeed.None);
		});
	});

	describe("statusRequiresEmphasis", () => {
		it("should return false for level 0 statuses", () => {
			expect(statusRequiresEmphasis(StatusType.Departed)).toBe(false);
			expect(statusRequiresEmphasis(StatusType.Landed)).toBe(false);
		});

		it("should return true for urgent statuses", () => {
			expect(statusRequiresEmphasis(StatusType.Boarding)).toBe(true);
			expect(statusRequiresEmphasis(StatusType.FinalCall)).toBe(true);
		});
	});

	describe("isCompletedStatus", () => {
		it("should identify completed statuses", () => {
			expect(isCompletedStatus(StatusType.Departed)).toBe(true);
			expect(isCompletedStatus(StatusType.Landed)).toBe(true);
			expect(isCompletedStatus(StatusType.AtGate)).toBe(true);
			expect(isCompletedStatus(StatusType.Boarding)).toBe(false);
		});
	});

	describe("isBoardingStatus", () => {
		it("should identify boarding statuses", () => {
			expect(isBoardingStatus(StatusType.Boarding)).toBe(true);
			expect(isBoardingStatus(StatusType.BoardingSoon)).toBe(true);
			expect(isBoardingStatus(StatusType.FinalCall)).toBe(true);
			expect(isBoardingStatus(StatusType.GateClosed)).toBe(true);
			expect(isBoardingStatus(StatusType.Departed)).toBe(false);
		});
	});

	describe("hasNoTimeUpdate", () => {
		it("should identify statuses without time update", () => {
			expect(hasNoTimeUpdate(StatusType.Cancelled)).toBe(true);
			expect(hasNoTimeUpdate(StatusType.Unknown)).toBe(true);
			expect(hasNoTimeUpdate(StatusType.Departed)).toBe(false);
		});
	});

	describe("getStatusAnimationClass", () => {
		it("should return animation class for flashing statuses", () => {
			expect(getStatusAnimationClass(StatusType.Boarding)).toBe(
				"animate-pulse-medium"
			);
			expect(getStatusAnimationClass(StatusType.FinalCall)).toBe(
				"animate-pulse-fast"
			);
		});

		it("should return empty string for non-flashing statuses", () => {
			expect(getStatusAnimationClass(StatusType.Departed)).toBe("");
			expect(getStatusAnimationClass(StatusType.Unknown)).toBe("");
		});
	});

	describe("getStatusBadgeClasses", () => {
		it("should combine color and animation classes", () => {
			const classes = getStatusBadgeClasses(StatusType.Boarding);
			expect(classes).toContain("emerald");
			expect(classes).toContain("animate-pulse-medium");
		});

		it("should not include animation for non-flashing statuses", () => {
			const classes = getStatusBadgeClasses(StatusType.Departed);
			expect(classes).not.toContain("animate");
		});
	});

	describe("getStatusTimeColor", () => {
		it("should return time color for status", () => {
			expect(getStatusTimeColor(StatusType.Departed)).toContain("emerald");
			expect(getStatusTimeColor(StatusType.Delayed)).toContain("orange");
		});
	});
});

// ============================================================================
// GATE STATUS TESTS
// ============================================================================

describe("Gate Status Configuration", () => {
	describe("GATE_STATUS_COLORS", () => {
		it("should have colors for all gate statuses", () => {
			const allGateStatuses = Object.values(GateStatus);
			for (const status of allGateStatuses) {
				expect(GATE_STATUS_COLORS[status]).toBeDefined();
				expect(GATE_STATUS_COLORS[status].dotBg).toBeTruthy();
				expect(GATE_STATUS_COLORS[status].badgeBg).toBeTruthy();
				expect(GATE_STATUS_COLORS[status].text).toBeTruthy();
			}
		});

		it("should use green for boarding gate status", () => {
			const boardingColors = GATE_STATUS_COLORS[GateStatus.Boarding];
			expect(boardingColors.dotBg).toContain("emerald");
		});

		it("should use blue for scheduled gate status", () => {
			const scheduledColors = GATE_STATUS_COLORS[GateStatus.Scheduled];
			expect(scheduledColors.dotBg).toContain("003580");
		});
	});

	describe("GATE_STATUS_LABELS", () => {
		it("should have labels for all gate statuses", () => {
			const allGateStatuses = Object.values(GateStatus);
			for (const status of allGateStatuses) {
				expect(GATE_STATUS_LABELS[status]).toBeTruthy();
			}
		});
	});

	describe("GATE_STATUS_FLASH", () => {
		it("should flash for boarding status", () => {
			expect(GATE_STATUS_FLASH[GateStatus.Boarding]).toBe(FlashSpeed.Medium);
		});

		it("should not flash for idle status", () => {
			expect(GATE_STATUS_FLASH[GateStatus.Idle]).toBe(FlashSpeed.None);
		});
	});

	describe("getGateStatusAnimationClass", () => {
		it("should return animation class for boarding", () => {
			expect(getGateStatusAnimationClass(GateStatus.Boarding)).toBe(
				"animate-pulse-medium"
			);
		});

		it("should return empty string for idle", () => {
			expect(getGateStatusAnimationClass(GateStatus.Idle)).toBe("");
		});
	});

	describe("getGateStatusBadgeClasses", () => {
		it("should combine color and animation classes for boarding", () => {
			const classes = getGateStatusBadgeClasses(GateStatus.Boarding);
			expect(classes).toContain("emerald");
			expect(classes).toContain("animate-pulse-medium");
		});

		it("should not include animation for scheduled", () => {
			const classes = getGateStatusBadgeClasses(GateStatus.Scheduled);
			expect(classes).not.toContain("animate");
		});
	});
});
