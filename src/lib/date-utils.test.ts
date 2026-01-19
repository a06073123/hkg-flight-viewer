/**
 * Date Utilities Tests
 *
 * Tests for date parsing and yesterday calculation functions
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getYesterdayHKT, parseDateParam } from "@/lib/date-utils";

describe("parseDateParam", () => {
	it("should return null for undefined input", () => {
		expect(parseDateParam(undefined)).toBeNull();
	});

	it("should return null for empty string", () => {
		expect(parseDateParam("")).toBeNull();
	});

	it("should parse yyyy-MM-dd format correctly", () => {
		expect(parseDateParam("2025-12-15")).toBe("2025-12-15");
		expect(parseDateParam("2024-01-01")).toBe("2024-01-01");
		expect(parseDateParam("2026-06-30")).toBe("2026-06-30");
	});

	it("should convert yyyyMMdd format to yyyy-MM-dd", () => {
		expect(parseDateParam("20251215")).toBe("2025-12-15");
		expect(parseDateParam("20240101")).toBe("2024-01-01");
		expect(parseDateParam("20260630")).toBe("2026-06-30");
	});

	it("should return null for invalid date formats", () => {
		expect(parseDateParam("2025/12/15")).toBeNull();
		expect(parseDateParam("12-15-2025")).toBeNull();
		expect(parseDateParam("2025-1-15")).toBeNull();
		expect(parseDateParam("not-a-date")).toBeNull();
		expect(parseDateParam("12345")).toBeNull();
	});
});

describe("getYesterdayHKT", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should return date in YYYY-MM-DD format", () => {
		// Set a fixed time: 2025-12-16 12:00:00 UTC
		// In HKT (UTC+8), this is 2025-12-16 20:00:00
		// Yesterday in HKT would be 2025-12-15
		vi.setSystemTime(new Date("2025-12-16T12:00:00.000Z"));

		const result = getYesterdayHKT();

		// Check format: YYYY-MM-DD
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(result).toBe("2025-12-15");
	});

	it("should handle date boundary correctly (UTC late night = HKT next day)", () => {
		// Set time to 2025-12-15 20:00:00 UTC
		// In HKT (UTC+8), this is 2025-12-16 04:00:00
		// Yesterday in HKT would be 2025-12-15
		vi.setSystemTime(new Date("2025-12-15T20:00:00.000Z"));

		const result = getYesterdayHKT();
		expect(result).toBe("2025-12-15");
	});

	it("should handle date boundary correctly (UTC early morning = HKT same day)", () => {
		// Set time to 2025-12-16 02:00:00 UTC
		// In HKT (UTC+8), this is 2025-12-16 10:00:00
		// Yesterday in HKT would be 2025-12-15
		vi.setSystemTime(new Date("2025-12-16T02:00:00.000Z"));

		const result = getYesterdayHKT();
		expect(result).toBe("2025-12-15");
	});

	it("should handle year boundary correctly", () => {
		// Set time to 2026-01-01 12:00:00 UTC
		// In HKT (UTC+8), this is 2026-01-01 20:00:00
		// Yesterday in HKT would be 2025-12-31
		vi.setSystemTime(new Date("2026-01-01T12:00:00.000Z"));

		const result = getYesterdayHKT();
		expect(result).toBe("2025-12-31");
	});

	it("should handle month boundary correctly", () => {
		// Set time to 2025-12-01 12:00:00 UTC
		// In HKT (UTC+8), this is 2025-12-01 20:00:00
		// Yesterday in HKT would be 2025-11-30
		vi.setSystemTime(new Date("2025-12-01T12:00:00.000Z"));

		const result = getYesterdayHKT();
		expect(result).toBe("2025-11-30");
	});

	it("should handle leap year correctly", () => {
		// Set time to 2024-03-01 12:00:00 UTC (2024 is a leap year)
		// In HKT (UTC+8), this is 2024-03-01 20:00:00
		// Yesterday in HKT would be 2024-02-29
		vi.setSystemTime(new Date("2024-03-01T12:00:00.000Z"));

		const result = getYesterdayHKT();
		expect(result).toBe("2024-02-29");
	});
});
