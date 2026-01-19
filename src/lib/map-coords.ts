/**
 * HKIA Gate Coordinate Mapping
 *
 * SVG coordinates for all passenger terminal stands.
 * Based on official HKIA terminal layout (AIRPORT-LAYOUT.md).
 *
 * SVG viewBox: 0 0 1200 800
 * Coordinate system: Origin at top-left
 *
 * Layout overview:
 * - North Apron (N stands): Top right
 * - South Apron (S stands): Bottom right
 * - West Apron (W stands): Center
 * - Satellite (R stands): Far top right
 * - Midfield (D stands): Left side
 */

import type { AircraftSizeCode, ApronArea, AreaBounds } from "../types/map";

/**
 * Stand metadata definition
 */
export interface StandInfo {
  /** Stand ID (e.g., "N5", "S23") */
  id: string;
  /** Gate number for display */
  gateNumber: string;
  /** SVG X coordinate */
  x: number;
  /** SVG Y coordinate */
  y: number;
  /** Apron area */
  area: ApronArea;
  /** Maximum aircraft size */
  size: AircraftSizeCode;
  /** Has L/R split variants */
  hasLRSplit: boolean;
}

// ============================================================================
// NORTH APRON STANDS (Top of main terminal)
// ============================================================================

/**
 * North Apron - Contact Stands (N5-N70)
 * Connected to main terminal building via jet bridges
 */
const NORTH_CONTACT_STANDS: StandInfo[] = [
  // N5-N10: West end of North Apron (Code F capable at N5)
  { id: "N5", gateNumber: "5", x: 750, y: 180, area: "north", size: "F", hasLRSplit: false },
  { id: "N6L", gateNumber: "6", x: 770, y: 165, area: "north", size: "E", hasLRSplit: true },
  { id: "N6R", gateNumber: "6", x: 770, y: 195, area: "north", size: "E", hasLRSplit: true },
  { id: "N7", gateNumber: "7", x: 790, y: 180, area: "north", size: "E", hasLRSplit: false },
  { id: "N8L", gateNumber: "8", x: 810, y: 165, area: "north", size: "E", hasLRSplit: true },
  { id: "N8R", gateNumber: "8", x: 810, y: 195, area: "north", size: "E", hasLRSplit: true },
  { id: "N9", gateNumber: "9", x: 830, y: 180, area: "north", size: "E", hasLRSplit: false },
  { id: "N10", gateNumber: "10", x: 850, y: 180, area: "north", size: "C", hasLRSplit: false },
  { id: "N12", gateNumber: "12", x: 870, y: 180, area: "north", size: "C", hasLRSplit: false },

  // N24-N36: Central North Apron
  { id: "N24L", gateNumber: "24", x: 900, y: 165, area: "north", size: "E", hasLRSplit: true },
  { id: "N24R", gateNumber: "24", x: 900, y: 195, area: "north", size: "E", hasLRSplit: true },
  { id: "N26", gateNumber: "26", x: 920, y: 180, area: "north", size: "E", hasLRSplit: false },
  { id: "N28L", gateNumber: "28", x: 940, y: 165, area: "north", size: "E", hasLRSplit: true },
  { id: "N28R", gateNumber: "28", x: 940, y: 195, area: "north", size: "E", hasLRSplit: true },
  { id: "N30", gateNumber: "30", x: 960, y: 180, area: "north", size: "E", hasLRSplit: false },
  { id: "N32L", gateNumber: "32", x: 980, y: 165, area: "north", size: "E", hasLRSplit: true },
  { id: "N32R", gateNumber: "32", x: 980, y: 195, area: "north", size: "E", hasLRSplit: true },
  { id: "N34", gateNumber: "34", x: 1000, y: 180, area: "north", size: "E", hasLRSplit: false },
  { id: "N36L", gateNumber: "36", x: 1020, y: 165, area: "north", size: "E", hasLRSplit: true },
  { id: "N36R", gateNumber: "36", x: 1020, y: 195, area: "north", size: "E", hasLRSplit: true },

  // N60-N70: East end of North Apron (Code F capable at N60-66)
  { id: "N60", gateNumber: "60", x: 1040, y: 180, area: "north", size: "F", hasLRSplit: false },
  { id: "N62", gateNumber: "62", x: 1060, y: 180, area: "north", size: "F", hasLRSplit: false },
  { id: "N64", gateNumber: "64", x: 1080, y: 180, area: "north", size: "F", hasLRSplit: false },
  { id: "N66", gateNumber: "66", x: 1100, y: 180, area: "north", size: "F", hasLRSplit: false },
  { id: "N68", gateNumber: "68", x: 1120, y: 180, area: "north", size: "E", hasLRSplit: false },
  { id: "N70", gateNumber: "70", x: 1140, y: 180, area: "north", size: "E", hasLRSplit: false },
];

/**
 * North Apron - Remote Stands (N141-N145)
 * Bus boarding required
 */
const NORTH_REMOTE_STANDS: StandInfo[] = [
  { id: "N141", gateNumber: "141", x: 720, y: 120, area: "north", size: "E", hasLRSplit: false },
  { id: "N142", gateNumber: "142", x: 740, y: 120, area: "north", size: "E", hasLRSplit: false },
  { id: "N143", gateNumber: "143", x: 760, y: 120, area: "north", size: "E", hasLRSplit: false },
  { id: "N144", gateNumber: "144", x: 780, y: 120, area: "north", size: "E", hasLRSplit: false },
  { id: "N145", gateNumber: "145", x: 800, y: 120, area: "north", size: "C", hasLRSplit: false },
];

// ============================================================================
// SOUTH APRON STANDS (Bottom of main terminal)
// ============================================================================

/**
 * South Apron - Contact Stands (S1-S47)
 * Connected to main terminal building via jet bridges
 */
const SOUTH_CONTACT_STANDS: StandInfo[] = [
  // S1-S4: Near West Apron connection
  { id: "S1", gateNumber: "501", x: 700, y: 520, area: "south", size: "E", hasLRSplit: false },
  { id: "S2L", gateNumber: "502", x: 720, y: 505, area: "south", size: "E", hasLRSplit: true },
  { id: "S2R", gateNumber: "502", x: 720, y: 535, area: "south", size: "E", hasLRSplit: true },
  { id: "S3", gateNumber: "503", x: 740, y: 520, area: "south", size: "E", hasLRSplit: false },
  { id: "S4", gateNumber: "504", x: 760, y: 520, area: "south", size: "E", hasLRSplit: false },

  // S11-S35: Main South Apron (S23 is Code F capable)
  { id: "S11", gateNumber: "511", x: 820, y: 520, area: "south", size: "E", hasLRSplit: false },
  { id: "S23", gateNumber: "523", x: 880, y: 520, area: "south", size: "F", hasLRSplit: false },
  { id: "S25L", gateNumber: "525", x: 900, y: 505, area: "south", size: "E", hasLRSplit: true },
  { id: "S25R", gateNumber: "525", x: 900, y: 535, area: "south", size: "E", hasLRSplit: true },
  { id: "S27", gateNumber: "527", x: 920, y: 520, area: "south", size: "E", hasLRSplit: false },
  { id: "S29L", gateNumber: "529", x: 940, y: 505, area: "south", size: "E", hasLRSplit: true },
  { id: "S29R", gateNumber: "529", x: 940, y: 535, area: "south", size: "E", hasLRSplit: true },
  { id: "S31", gateNumber: "531", x: 960, y: 520, area: "south", size: "E", hasLRSplit: false },
  { id: "S33L", gateNumber: "533", x: 980, y: 505, area: "south", size: "E", hasLRSplit: true },
  { id: "S33R", gateNumber: "533", x: 980, y: 535, area: "south", size: "E", hasLRSplit: true },
  { id: "S35", gateNumber: "535", x: 1000, y: 520, area: "south", size: "E", hasLRSplit: false },

  // S41-S47: East end of South Apron
  { id: "S41", gateNumber: "541", x: 1040, y: 520, area: "south", size: "E", hasLRSplit: false },
  { id: "S43L", gateNumber: "543", x: 1060, y: 505, area: "south", size: "E", hasLRSplit: true },
  { id: "S43R", gateNumber: "543", x: 1060, y: 535, area: "south", size: "E", hasLRSplit: true },
  { id: "S45", gateNumber: "545", x: 1080, y: 520, area: "south", size: "E", hasLRSplit: false },
  { id: "S47", gateNumber: "547", x: 1100, y: 520, area: "south", size: "E", hasLRSplit: false },
];

/**
 * South Apron - Remote Stands (S101-S111)
 * Bus boarding required
 */
const SOUTH_REMOTE_STANDS: StandInfo[] = [
  { id: "S101", gateNumber: "601", x: 820, y: 600, area: "south", size: "E", hasLRSplit: false },
  { id: "S102", gateNumber: "602", x: 840, y: 600, area: "south", size: "E", hasLRSplit: false },
  { id: "S103", gateNumber: "603", x: 860, y: 600, area: "south", size: "E", hasLRSplit: false },
  { id: "S104", gateNumber: "604", x: 880, y: 600, area: "south", size: "E", hasLRSplit: false },
  { id: "S105", gateNumber: "605", x: 900, y: 600, area: "south", size: "E", hasLRSplit: false },
  { id: "S106", gateNumber: "606", x: 920, y: 600, area: "south", size: "E", hasLRSplit: false },
  { id: "S107", gateNumber: "607", x: 940, y: 600, area: "south", size: "E", hasLRSplit: false },
  { id: "S108", gateNumber: "608", x: 960, y: 600, area: "south", size: "E", hasLRSplit: false },
  { id: "S109", gateNumber: "609", x: 980, y: 600, area: "south", size: "C", hasLRSplit: false },
  { id: "S110", gateNumber: "610", x: 1000, y: 600, area: "south", size: "E", hasLRSplit: false },
  { id: "S111", gateNumber: "611", x: 1020, y: 600, area: "south", size: "E", hasLRSplit: false },
];

// ============================================================================
// WEST APRON STANDS (Center of main terminal)
// ============================================================================

/**
 * West Apron - Contact Stands (W40-W71)
 * Central finger pier between North and South aprons
 */
const WEST_CONTACT_STANDS: StandInfo[] = [
  // W40-W50: West side
  { id: "W40L", gateNumber: "40", x: 620, y: 335, area: "west", size: "E", hasLRSplit: true },
  { id: "W40R", gateNumber: "40", x: 620, y: 365, area: "west", size: "E", hasLRSplit: true },
  { id: "W42", gateNumber: "42", x: 640, y: 350, area: "west", size: "E", hasLRSplit: false },
  { id: "W44L", gateNumber: "44", x: 660, y: 335, area: "west", size: "E", hasLRSplit: true },
  { id: "W44R", gateNumber: "44", x: 660, y: 365, area: "west", size: "E", hasLRSplit: true },
  { id: "W46", gateNumber: "46", x: 680, y: 350, area: "west", size: "E", hasLRSplit: false },
  { id: "W48L", gateNumber: "48", x: 700, y: 335, area: "west", size: "E", hasLRSplit: true },
  { id: "W48R", gateNumber: "48", x: 700, y: 365, area: "west", size: "E", hasLRSplit: true },
  { id: "W50", gateNumber: "50", x: 720, y: 350, area: "west", size: "E", hasLRSplit: false },

  // W61-W71: East side
  { id: "W61", gateNumber: "61", x: 740, y: 350, area: "west", size: "E", hasLRSplit: false },
  { id: "W63L", gateNumber: "63", x: 760, y: 335, area: "west", size: "E", hasLRSplit: true },
  { id: "W63R", gateNumber: "63", x: 760, y: 365, area: "west", size: "E", hasLRSplit: true },
  { id: "W65", gateNumber: "65", x: 780, y: 350, area: "west", size: "E", hasLRSplit: false },
  { id: "W67L", gateNumber: "67", x: 800, y: 335, area: "west", size: "E", hasLRSplit: true },
  { id: "W67R", gateNumber: "67", x: 800, y: 365, area: "west", size: "E", hasLRSplit: true },
  { id: "W69", gateNumber: "69", x: 820, y: 350, area: "west", size: "E", hasLRSplit: false },
  { id: "W71", gateNumber: "71", x: 840, y: 350, area: "west", size: "E", hasLRSplit: false },
];

/**
 * West Apron - Remote Stands (W121-W126)
 * Bus boarding required
 */
const WEST_REMOTE_STANDS: StandInfo[] = [
  { id: "W121", gateNumber: "121", x: 560, y: 350, area: "west", size: "E", hasLRSplit: false },
  { id: "W122", gateNumber: "122", x: 540, y: 350, area: "west", size: "E", hasLRSplit: false },
  { id: "W123", gateNumber: "123", x: 520, y: 350, area: "west", size: "E", hasLRSplit: false },
  { id: "W124", gateNumber: "124", x: 500, y: 350, area: "west", size: "E", hasLRSplit: false },
  { id: "W125", gateNumber: "125", x: 480, y: 350, area: "west", size: "E", hasLRSplit: false },
  { id: "W126", gateNumber: "126", x: 460, y: 350, area: "west", size: "C", hasLRSplit: false },
];

// ============================================================================
// SATELLITE CONCOURSE STANDS (North end via Sky Bridge)
// ============================================================================

/**
 * Satellite Concourse - Contact Stands (R13-R21)
 * Connected via 200m Sky Bridge, Code C aircraft only
 */
const SATELLITE_STANDS: StandInfo[] = [
  { id: "R13", gateNumber: "13", x: 1040, y: 60, area: "satellite", size: "C", hasLRSplit: false },
  { id: "R14", gateNumber: "14", x: 1060, y: 60, area: "satellite", size: "C", hasLRSplit: false },
  { id: "R15", gateNumber: "15", x: 1080, y: 60, area: "satellite", size: "C", hasLRSplit: false },
  { id: "R16", gateNumber: "16", x: 1100, y: 60, area: "satellite", size: "C", hasLRSplit: false },
  { id: "R17", gateNumber: "17", x: 1120, y: 60, area: "satellite", size: "C", hasLRSplit: false },
  { id: "R18", gateNumber: "18", x: 1140, y: 60, area: "satellite", size: "C", hasLRSplit: false },
  { id: "R19", gateNumber: "19", x: 1160, y: 60, area: "satellite", size: "C", hasLRSplit: false },
  { id: "R20", gateNumber: "20", x: 1140, y: 90, area: "satellite", size: "C", hasLRSplit: false },
  { id: "R21", gateNumber: "21", x: 1120, y: 90, area: "satellite", size: "C", hasLRSplit: false },
];

// ============================================================================
// MIDFIELD CONCOURSE STANDS (West side via APM)
// ============================================================================

/**
 * Midfield Concourse - Frontal Contact Stands (D201-D219)
 * Connected via APM train, includes Code F stands
 */
const MIDFIELD_FRONTAL_STANDS: StandInfo[] = [
  { id: "D201", gateNumber: "201", x: 200, y: 250, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D202", gateNumber: "202", x: 220, y: 250, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D203", gateNumber: "203", x: 240, y: 250, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D204", gateNumber: "204", x: 260, y: 250, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D205", gateNumber: "205", x: 280, y: 250, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D206", gateNumber: "206", x: 300, y: 250, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D207", gateNumber: "207", x: 320, y: 250, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D208", gateNumber: "208", x: 340, y: 250, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D209", gateNumber: "209", x: 360, y: 250, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D210", gateNumber: "210", x: 380, y: 250, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D211", gateNumber: "211", x: 200, y: 450, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D212", gateNumber: "212", x: 220, y: 450, area: "midfield", size: "F", hasLRSplit: false },
  { id: "D213", gateNumber: "213", x: 240, y: 450, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D214", gateNumber: "214", x: 260, y: 450, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D215", gateNumber: "215", x: 280, y: 450, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D216", gateNumber: "216", x: 300, y: 450, area: "midfield", size: "F", hasLRSplit: false },
  { id: "D217", gateNumber: "217", x: 320, y: 450, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D218", gateNumber: "218", x: 340, y: 450, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D219", gateNumber: "219", x: 360, y: 450, area: "midfield", size: "E", hasLRSplit: false },
];

/**
 * Midfield Concourse - Remote Stands (D301-D319)
 * Overnight parking only, Code F capable at select stands
 */
const MIDFIELD_REMOTE_STANDS: StandInfo[] = [
  { id: "D301", gateNumber: "301", x: 100, y: 250, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D302", gateNumber: "302", x: 120, y: 250, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D303", gateNumber: "303", x: 140, y: 250, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D304", gateNumber: "304", x: 160, y: 250, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D305", gateNumber: "305", x: 180, y: 250, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D306", gateNumber: "306", x: 100, y: 350, area: "midfield", size: "F", hasLRSplit: false },
  { id: "D307", gateNumber: "307", x: 120, y: 350, area: "midfield", size: "F", hasLRSplit: false },
  { id: "D308", gateNumber: "308", x: 140, y: 350, area: "midfield", size: "F", hasLRSplit: false },
  { id: "D309", gateNumber: "309", x: 160, y: 350, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D310", gateNumber: "310", x: 180, y: 350, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D311", gateNumber: "311", x: 100, y: 450, area: "midfield", size: "F", hasLRSplit: false },
  { id: "D312", gateNumber: "312", x: 120, y: 450, area: "midfield", size: "F", hasLRSplit: false },
  { id: "D313", gateNumber: "313", x: 140, y: 450, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D314", gateNumber: "314", x: 160, y: 450, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D315", gateNumber: "315", x: 180, y: 450, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D316", gateNumber: "316", x: 100, y: 550, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D317", gateNumber: "317", x: 120, y: 550, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D318", gateNumber: "318", x: 140, y: 550, area: "midfield", size: "E", hasLRSplit: false },
  { id: "D319", gateNumber: "319", x: 160, y: 550, area: "midfield", size: "E", hasLRSplit: false },
];

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All gate coordinates by area
 */
export const GATE_COORDINATES = {
  north: [...NORTH_CONTACT_STANDS, ...NORTH_REMOTE_STANDS],
  south: [...SOUTH_CONTACT_STANDS, ...SOUTH_REMOTE_STANDS],
  west: [...WEST_CONTACT_STANDS, ...WEST_REMOTE_STANDS],
  satellite: SATELLITE_STANDS,
  midfield: [...MIDFIELD_FRONTAL_STANDS, ...MIDFIELD_REMOTE_STANDS],
} as const;

/**
 * All stands flattened for quick lookup
 */
export const ALL_STANDS: StandInfo[] = [
  ...GATE_COORDINATES.north,
  ...GATE_COORDINATES.south,
  ...GATE_COORDINATES.west,
  ...GATE_COORDINATES.satellite,
  ...GATE_COORDINATES.midfield,
];

/**
 * Stand lookup by ID
 */
export const STAND_BY_ID = new Map<string, StandInfo>(
  ALL_STANDS.map((stand) => [stand.id, stand])
);

/**
 * Area bounding boxes for navigation
 */
export const AREA_BOUNDS: AreaBounds[] = [
  {
    area: "north",
    name: "North Apron",
    minX: 700,
    maxX: 1160,
    minY: 100,
    maxY: 220,
    centerX: 930,
    centerY: 160,
  },
  {
    area: "south",
    name: "South Apron",
    minX: 700,
    maxX: 1120,
    minY: 480,
    maxY: 620,
    centerX: 910,
    centerY: 550,
  },
  {
    area: "west",
    name: "West Apron",
    minX: 440,
    maxX: 860,
    minY: 320,
    maxY: 380,
    centerX: 650,
    centerY: 350,
  },
  {
    area: "satellite",
    name: "Satellite Concourse",
    minX: 1020,
    maxX: 1180,
    minY: 40,
    maxY: 110,
    centerX: 1100,
    centerY: 75,
  },
  {
    area: "midfield",
    name: "Midfield Concourse",
    minX: 80,
    maxX: 400,
    minY: 230,
    maxY: 570,
    centerX: 240,
    centerY: 400,
  },
];

/**
 * Find stand by gate number from API
 * The API returns gate numbers like "5", "23", "201" etc.
 */
export function findStandByGateNumber(gateNumber: string): StandInfo | undefined {
  // Direct match on gateNumber field
  return ALL_STANDS.find((stand) => stand.gateNumber === gateNumber);
}

/**
 * Find all stands in an area
 */
export function getStandsByArea(area: ApronArea): readonly StandInfo[] {
  return GATE_COORDINATES[area];
}

/**
 * Get Code F capable stands only
 */
export function getCodeFStands(): StandInfo[] {
  return ALL_STANDS.filter((stand) => stand.size === "F");
}

/**
 * Get stand statistics
 */
export function getStandStats() {
  return {
    total: ALL_STANDS.length,
    byArea: {
      north: GATE_COORDINATES.north.length,
      south: GATE_COORDINATES.south.length,
      west: GATE_COORDINATES.west.length,
      satellite: GATE_COORDINATES.satellite.length,
      midfield: GATE_COORDINATES.midfield.length,
    },
    bySize: {
      F: ALL_STANDS.filter((s) => s.size === "F").length,
      E: ALL_STANDS.filter((s) => s.size === "E").length,
      C: ALL_STANDS.filter((s) => s.size === "C").length,
    },
  };
}
