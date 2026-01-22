/**
 * HKIA Airport Map Types
 *
 * Type definitions for the virtual airport map feature (M5).
 * Based on official HKIA stand numbering and layout.
 */

/**
 * Aircraft size codes per ICAO classification
 * - F: Code F (A380, 747-8) - wingspan 65-80m
 * - E: Code E (777, 787, A350) - wingspan 52-65m
 * - C: Code C (A320, 737, A321) - wingspan 24-36m
 */
export type AircraftSizeCode = "F" | "E" | "C";

/**
 * Apron area within the passenger terminal complex
 */
export type ApronArea = "north" | "south" | "west" | "satellite" | "midfield";

/**
 * Gate/Stand status for real-time display
 */
export const GateStatus = {
  Boarding: "boarding",
  Scheduled: "scheduled",
  Idle: "idle",
} as const;
export type GateStatus = (typeof GateStatus)[keyof typeof GateStatus];

/**
 * Gate marker for SVG map display
 */
export interface GateMarker {
  /** Stand ID (e.g., "N5", "S23", "D201", "R15") */
  id: string;

  /** Display label (e.g., "Gate 5", "Gate 23") */
  label: string;

  /** Gate number extracted from API aisle field */
  gateNumber: string;

  /** SVG X coordinate */
  x: number;

  /** SVG Y coordinate */
  y: number;

  /** Apron area location */
  area: ApronArea;

  /** Terminal (always T1 for passenger) */
  terminal: "T1";

  /** Maximum aircraft size code */
  size: AircraftSizeCode;

  /** Whether stand has L/R split variants */
  hasLRSplit: boolean;

  /** Current flight number (if occupied) */
  currentFlight?: string;

  /** Current status */
  status: GateStatus;
}

/**
 * Area bounding box for pan/zoom navigation
 */
export interface AreaBounds {
  /** Area identifier */
  area: ApronArea;

  /** Display name */
  name: string;

  /** Minimum X coordinate */
  minX: number;

  /** Maximum X coordinate */
  maxX: number;

  /** Minimum Y coordinate */
  minY: number;

  /** Maximum Y coordinate */
  maxY: number;

  /** Center X for zoom target */
  centerX: number;

  /** Center Y for zoom target */
  centerY: number;
}

/**
 * Flight-to-gate mapping from API data
 */
export interface GateAssignment {
  /** Flight number */
  flightNo: string;

  /** Gate/Stand ID */
  gateId: string;

  /** Scheduled time */
  scheduledTime: string;

  /** Current status */
  status: GateStatus;
}
