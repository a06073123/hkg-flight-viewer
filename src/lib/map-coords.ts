/**
 * HKIA Gate Coordinate Mapping
 *
 * SVG coordinates for all passenger terminal stands.
 * Based on official HKIA terminal layout and actual gate positions.
 *
 * SVG viewBox: 0 0 1400 900
 * Coordinate system: Origin at top-left
 *
 * Layout Overview (matching airport map):
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │                                                                          │
 * │  ┌─────────┐  ┌─────────┐                    ┌──────────────────────┐   │
 * │  │D319-D311│  │D310-D301│                    │ Satellite R13-R21    │   │
 * │  │ Remote  │  │ Remote  │                    └──────────────────────┘   │
 * │  └─────────┘  └─────────┘                              ▲                │
 * │       │            │                                   │                │
 * │  ┌────┴────────────┴────┐      ┌───────────┐   ┌───────┴───────┐       │
 * │  │  Midfield Concourse  │      │   West    │   │  North Apron  │       │
 * │  │  D218-D202 / D219-D201│     │   Apron   │   │  N5-N70       │       │
 * │  └──────────────────────┘      │  W40-W71  │   │  N141-N145    │       │
 * │                                └─────┬─────┘   └───────┬───────┘       │
 * │                                      │                 │                │
 * │                              ┌───────┴─────────────────┴───────┐       │
 * │                              │     PASSENGER TERMINAL (Y-shape) │       │
 * │                              └───────┬─────────────────┬───────┘       │
 * │                                      │                 │                │
 * │                                ┌─────┴─────┐   ┌───────┴───────┐       │
 * │                                │   South   │   │ Remote Stands │       │
 * │                                │   Apron   │   │  S101-S111    │       │
 * │                                │  S1-S49   │   └───────────────┘       │
 * │                                └───────────┘                           │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

import type { AircraftSizeCode, ApronArea, AreaBounds } from "../types/map";

/**
 * Stand metadata definition
 */
export interface StandInfo {
	/** Stand ID (e.g., "N5", "S23", "D201") */
	id: string;
	/** Gate number for display (matches API gate field) */
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
	/** Has jet bridge (contact stand) vs remote (bus boarding) */
	hasJetBridge: boolean;
}

// ============================================================================
// T1 MIDFIELD CONCOURSE (Left side of airport - via APM)
// ============================================================================

/**
 * Midfield Remote Stands - Row 1 (D311-D319)
 * No jet bridges, bus boarding only
 * From top to bottom: D319, D318, D317, D316, D315, D314, D313, D312, D311
 * Then building gap, then D310-D301
 */
const MIDFIELD_REMOTE_ROW1_LEFT: StandInfo[] = [
	// D319-D311: Left section (top to bottom in image)
	{ id: "D319", gateNumber: "319", x: 50, y: 480, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "D318", gateNumber: "318", x: 50, y: 450, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "D317", gateNumber: "317", x: 50, y: 420, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "D316", gateNumber: "316", x: 50, y: 390, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "D315", gateNumber: "315", x: 50, y: 360, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "D314", gateNumber: "314", x: 50, y: 330, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "D313", gateNumber: "313", x: 50, y: 300, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "D312", gateNumber: "312", x: 50, y: 270, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "D311", gateNumber: "311", x: 50, y: 240, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
];

const MIDFIELD_REMOTE_ROW1_RIGHT: StandInfo[] = [
	// D310-D301: Right section after building (top to bottom)
	{ id: "D310", gateNumber: "310", x: 100, y: 480, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "D309", gateNumber: "309", x: 100, y: 450, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "D308", gateNumber: "308", x: 100, y: 420, area: "midfield", size: "F", hasLRSplit: false, hasJetBridge: false },
	{ id: "D307", gateNumber: "307", x: 100, y: 390, area: "midfield", size: "F", hasLRSplit: false, hasJetBridge: false },
	{ id: "D306", gateNumber: "306", x: 100, y: 360, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "D305", gateNumber: "305", x: 100, y: 330, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "D304", gateNumber: "304", x: 100, y: 300, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "D303", gateNumber: "303", x: 100, y: 270, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "D302", gateNumber: "302", x: 100, y: 240, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "D301", gateNumber: "301", x: 100, y: 210, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: false },
];

/**
 * Midfield Contact Stands - Row 2 (D201-D219)
 * Has jet bridges, connected to Midfield Concourse building
 * Even numbers: D218, D216, D214, D212, D210, D208, D206, D204, D202 (left side)
 * Odd numbers: D219, D217, D215, D213, D211, D209, D207, D205, D203, D201 (right side)
 */
const MIDFIELD_CONTACT_EVEN: StandInfo[] = [
	// Even numbers (left side of building) - top to bottom
	{ id: "D218", gateNumber: "218", x: 150, y: 480, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "D216", gateNumber: "216", x: 150, y: 445, area: "midfield", size: "F", hasLRSplit: false, hasJetBridge: true },
	{ id: "D214", gateNumber: "214", x: 150, y: 410, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "D212", gateNumber: "212", x: 150, y: 375, area: "midfield", size: "F", hasLRSplit: false, hasJetBridge: true },
	{ id: "D210", gateNumber: "210", x: 150, y: 340, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "D208", gateNumber: "208", x: 150, y: 305, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "D206", gateNumber: "206", x: 150, y: 270, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "D204", gateNumber: "204", x: 150, y: 235, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "D202", gateNumber: "202", x: 150, y: 200, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
];

const MIDFIELD_CONTACT_ODD: StandInfo[] = [
	// Odd numbers (right side of building) - top to bottom
	{ id: "D219", gateNumber: "219", x: 200, y: 480, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "D217", gateNumber: "217", x: 200, y: 445, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "D215", gateNumber: "215", x: 200, y: 410, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "D213", gateNumber: "213", x: 200, y: 375, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "D211", gateNumber: "211", x: 200, y: 340, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "D209", gateNumber: "209", x: 200, y: 305, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "D207", gateNumber: "207", x: 200, y: 270, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "D205", gateNumber: "205", x: 200, y: 235, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "D203", gateNumber: "203", x: 200, y: 200, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "D201", gateNumber: "201", x: 200, y: 165, area: "midfield", size: "E", hasLRSplit: false, hasJetBridge: true },
];

// ============================================================================
// T1 MAIN TERMINAL - WEST APRON (Y-shape left branch)
// ============================================================================

/**
 * West Apron Contact Stands
 * Y-shape left upper branch
 * Left side: W40, W42, W44, W46, W48, W50 (even)
 * Right side: S41, S43, S45, S47, S49 (odd - these are actually S stands facing the pier)
 *
 * Y-shape right upper branch
 * Left side: W61, W63, W65, W67, W69, W71 (odd)
 * Right side: N60, N62, N64, N66, N68, N70 (even - these are N stands)
 */

// West Apron - Left pier (W40-W50 even on left, S41-S49 odd on right)
const WEST_LEFT_PIER_EVEN: StandInfo[] = [
	{ id: "W40", gateNumber: "40", x: 560, y: 450, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "W42", gateNumber: "42", x: 575, y: 430, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "W44", gateNumber: "44", x: 590, y: 410, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "W46", gateNumber: "46", x: 605, y: 390, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "W48", gateNumber: "48", x: 620, y: 370, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "W50", gateNumber: "50", x: 635, y: 350, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
];

const WEST_LEFT_PIER_ODD: StandInfo[] = [
	// S41-S49 on the right side of the left pier
	{ id: "S41", gateNumber: "41", x: 600, y: 460, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "S43", gateNumber: "43", x: 615, y: 440, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "S45", gateNumber: "45", x: 630, y: 420, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "S47", gateNumber: "47", x: 645, y: 400, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "S49", gateNumber: "49", x: 660, y: 380, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
];

// West Apron - Right pier (W61-W71 odd on left, N60-N70 even on right)
const WEST_RIGHT_PIER_ODD: StandInfo[] = [
	{ id: "W61", gateNumber: "61", x: 670, y: 340, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "W63", gateNumber: "63", x: 685, y: 320, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "W65", gateNumber: "65", x: 700, y: 300, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "W67", gateNumber: "67", x: 715, y: 280, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "W69", gateNumber: "69", x: 730, y: 260, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "W71", gateNumber: "71", x: 745, y: 240, area: "west", size: "E", hasLRSplit: false, hasJetBridge: true },
];

// West Apron Remote Stands (W121-W126) - further west
const WEST_REMOTE_STANDS: StandInfo[] = [
	{ id: "W121", gateNumber: "121", x: 480, y: 380, area: "west", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "W122", gateNumber: "122", x: 465, y: 365, area: "west", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "W123", gateNumber: "123", x: 450, y: 350, area: "west", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "W124", gateNumber: "124", x: 435, y: 335, area: "west", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "W125", gateNumber: "125", x: 420, y: 320, area: "west", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "W126", gateNumber: "126", x: 405, y: 305, area: "west", size: "C", hasLRSplit: false, hasJetBridge: false },
];

// ============================================================================
// T1 MAIN TERMINAL - SOUTH APRON (Y-shape lower section)
// ============================================================================

/**
 * South Apron Contact Stands - Main section
 * Y-shape lower middle section
 * Left side (facing terminal): S23, S25, S27, S29, S31, S33, S35 (odd)
 * Right side (facing terminal): N24, N26, N28, N30, N32, N34 (even)
 */
const SOUTH_MAIN_ODD: StandInfo[] = [
	{ id: "S23", gateNumber: "23", x: 900, y: 410, area: "south", size: "F", hasLRSplit: false, hasJetBridge: true },
	{ id: "S25", gateNumber: "25", x: 880, y: 425, area: "south", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "S27", gateNumber: "27", x: 860, y: 440, area: "south", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "S29", gateNumber: "29", x: 840, y: 455, area: "south", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "S31", gateNumber: "31", x: 820, y: 470, area: "south", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "S33", gateNumber: "33", x: 800, y: 485, area: "south", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "S35", gateNumber: "35", x: 780, y: 500, area: "south", size: "E", hasLRSplit: false, hasJetBridge: true },
];

// South Apron - S1-S4 (near terminal building entrance)
const SOUTH_ENTRANCE: StandInfo[] = [
	{ id: "S1", gateNumber: "1", x: 1080, y: 500, area: "south", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "S2", gateNumber: "2", x: 1060, y: 515, area: "south", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "S3", gateNumber: "3", x: 1040, y: 530, area: "south", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "S4", gateNumber: "4", x: 1020, y: 545, area: "south", size: "E", hasLRSplit: false, hasJetBridge: true },
];

// South Apron Remote Stands - S101-S111
const SOUTH_REMOTE_STANDS: StandInfo[] = [
	{ id: "S101", gateNumber: "101", x: 1000, y: 590, area: "south", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "S102", gateNumber: "102", x: 980, y: 590, area: "south", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "S103", gateNumber: "103", x: 1060, y: 560, area: "south", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "S104", gateNumber: "104", x: 1040, y: 560, area: "south", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "S105", gateNumber: "105", x: 960, y: 620, area: "south", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "S106", gateNumber: "106", x: 940, y: 620, area: "south", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "S107", gateNumber: "107", x: 900, y: 590, area: "south", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "S108", gateNumber: "108", x: 880, y: 560, area: "south", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "S109", gateNumber: "109", x: 860, y: 560, area: "south", size: "C", hasLRSplit: false, hasJetBridge: false },
	{ id: "S110", gateNumber: "110", x: 820, y: 560, area: "south", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "S111", gateNumber: "111", x: 780, y: 540, area: "south", size: "E", hasLRSplit: false, hasJetBridge: false },
];

// ============================================================================
// T1 MAIN TERMINAL - NORTH APRON (Y-shape right branch / upper right)
// ============================================================================

/**
 * North Apron Contact Stands - Main section
 * Right side (facing terminal): N24, N26, N28, N30, N32, N34 (even)
 * These are on the right side of the Y's lower stem
 */
const NORTH_MAIN_EVEN: StandInfo[] = [
	{ id: "N24", gateNumber: "24", x: 920, y: 395, area: "north", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "N26", gateNumber: "26", x: 940, y: 380, area: "north", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "N28", gateNumber: "28", x: 960, y: 365, area: "north", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "N30", gateNumber: "30", x: 980, y: 350, area: "north", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "N32", gateNumber: "32", x: 1000, y: 335, area: "north", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "N34", gateNumber: "34", x: 1020, y: 320, area: "north", size: "E", hasLRSplit: false, hasJetBridge: true },
];

// North Apron - N36 (transition to upper right pier)
const NORTH_TRANSITION: StandInfo[] = [
	{ id: "N36", gateNumber: "36", x: 760, y: 260, area: "north", size: "E", hasLRSplit: false, hasJetBridge: true },
];

// North Apron - N60-N70 (right side of right upper pier, facing W61-W71)
const NORTH_UPPER_PIER: StandInfo[] = [
	{ id: "N60", gateNumber: "60", x: 775, y: 245, area: "north", size: "F", hasLRSplit: false, hasJetBridge: true },
	{ id: "N62", gateNumber: "62", x: 790, y: 225, area: "north", size: "F", hasLRSplit: false, hasJetBridge: true },
	{ id: "N64", gateNumber: "64", x: 805, y: 205, area: "north", size: "F", hasLRSplit: false, hasJetBridge: true },
	{ id: "N66", gateNumber: "66", x: 820, y: 185, area: "north", size: "F", hasLRSplit: false, hasJetBridge: true },
	{ id: "N68", gateNumber: "68", x: 835, y: 165, area: "north", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "N70", gateNumber: "70", x: 850, y: 145, area: "north", size: "E", hasLRSplit: false, hasJetBridge: true },
];

// North Apron - N5-N12 (near terminal building entrance, parallel to S1-S4)
const NORTH_ENTRANCE: StandInfo[] = [
	{ id: "N5", gateNumber: "5", x: 1040, y: 305, area: "north", size: "F", hasLRSplit: false, hasJetBridge: true },
	{ id: "N6", gateNumber: "6", x: 1055, y: 290, area: "north", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "N7", gateNumber: "7", x: 1070, y: 275, area: "north", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "N8", gateNumber: "8", x: 1085, y: 260, area: "north", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "N9", gateNumber: "9", x: 1100, y: 245, area: "north", size: "E", hasLRSplit: false, hasJetBridge: true },
	{ id: "N10", gateNumber: "10", x: 1070, y: 230, area: "north", size: "C", hasLRSplit: false, hasJetBridge: true },
	{ id: "N12", gateNumber: "12", x: 1085, y: 215, area: "north", size: "C", hasLRSplit: false, hasJetBridge: true },
];

// North Apron Remote Stands - N141-N145
const NORTH_REMOTE_STANDS: StandInfo[] = [
	{ id: "N141", gateNumber: "141", x: 880, y: 200, area: "north", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "N142", gateNumber: "142", x: 900, y: 185, area: "north", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "N143", gateNumber: "143", x: 920, y: 170, area: "north", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "N144", gateNumber: "144", x: 940, y: 155, area: "north", size: "E", hasLRSplit: false, hasJetBridge: false },
	{ id: "N145", gateNumber: "145", x: 960, y: 140, area: "north", size: "C", hasLRSplit: false, hasJetBridge: false },
];

// ============================================================================
// SATELLITE CONCOURSE (Far top right - via Sky Bridge)
// ============================================================================

/**
 * Satellite Concourse - R13-R21
 * Connected via 200m Sky Bridge from North Apron
 * Code C aircraft only (regional jets)
 */
const SATELLITE_STANDS: StandInfo[] = [
	// Bottom row (closer to Sky Bridge)
	{ id: "R13", gateNumber: "13", x: 1130, y: 160, area: "satellite", size: "C", hasLRSplit: false, hasJetBridge: true },
	{ id: "R14", gateNumber: "14", x: 1150, y: 160, area: "satellite", size: "C", hasLRSplit: false, hasJetBridge: true },
	{ id: "R15", gateNumber: "15", x: 1170, y: 160, area: "satellite", size: "C", hasLRSplit: false, hasJetBridge: true },
	{ id: "R16", gateNumber: "16", x: 1190, y: 160, area: "satellite", size: "C", hasLRSplit: false, hasJetBridge: true },
	{ id: "R17", gateNumber: "17", x: 1210, y: 160, area: "satellite", size: "C", hasLRSplit: false, hasJetBridge: true },
	// Top row
	{ id: "R18", gateNumber: "18", x: 1230, y: 130, area: "satellite", size: "C", hasLRSplit: false, hasJetBridge: true },
	{ id: "R19", gateNumber: "19", x: 1210, y: 130, area: "satellite", size: "C", hasLRSplit: false, hasJetBridge: true },
	{ id: "R20", gateNumber: "20", x: 1190, y: 130, area: "satellite", size: "C", hasLRSplit: false, hasJetBridge: true },
	{ id: "R21", gateNumber: "21", x: 1170, y: 130, area: "satellite", size: "C", hasLRSplit: false, hasJetBridge: true },
];

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All gate coordinates by area
 */
export const GATE_COORDINATES = {
	north: [
		...NORTH_ENTRANCE,
		...NORTH_MAIN_EVEN,
		...NORTH_TRANSITION,
		...NORTH_UPPER_PIER,
		...NORTH_REMOTE_STANDS,
	],
	south: [
		...SOUTH_ENTRANCE,
		...SOUTH_MAIN_ODD,
		...SOUTH_REMOTE_STANDS,
	],
	west: [
		...WEST_LEFT_PIER_EVEN,
		...WEST_LEFT_PIER_ODD,
		...WEST_RIGHT_PIER_ODD,
		...WEST_REMOTE_STANDS,
	],
	satellite: SATELLITE_STANDS,
	midfield: [
		...MIDFIELD_REMOTE_ROW1_LEFT,
		...MIDFIELD_REMOTE_ROW1_RIGHT,
		...MIDFIELD_CONTACT_EVEN,
		...MIDFIELD_CONTACT_ODD,
	],
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
	ALL_STANDS.map((stand) => [stand.id, stand]),
);

/**
 * Stand lookup by gate number
 */
export const STAND_BY_GATE = new Map<string, StandInfo>(
	ALL_STANDS.map((stand) => [stand.gateNumber, stand]),
);

/**
 * Area bounding boxes for navigation
 */
export const AREA_BOUNDS: AreaBounds[] = [
	{
		area: "north",
		name: "North Apron",
		minX: 750,
		maxX: 1120,
		minY: 130,
		maxY: 320,
		centerX: 935,
		centerY: 225,
	},
	{
		area: "south",
		name: "South Apron",
		minX: 750,
		maxX: 1100,
		minY: 400,
		maxY: 650,
		centerX: 925,
		centerY: 525,
	},
	{
		area: "west",
		name: "West Apron",
		minX: 390,
		maxX: 770,
		minY: 230,
		maxY: 480,
		centerX: 580,
		centerY: 355,
	},
	{
		area: "satellite",
		name: "Satellite Concourse",
		minX: 1110,
		maxX: 1250,
		minY: 110,
		maxY: 180,
		centerX: 1180,
		centerY: 145,
	},
	{
		area: "midfield",
		name: "Midfield Concourse",
		minX: 30,
		maxX: 220,
		minY: 150,
		maxY: 500,
		centerX: 125,
		centerY: 325,
	},
];

/**
 * Find stand by gate number from API
 * The API returns gate numbers like "5", "23", "201" etc.
 */
export function findStandByGateNumber(
	gateNumber: string,
): StandInfo | undefined {
	return STAND_BY_GATE.get(gateNumber);
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
 * Get contact stands (with jet bridges)
 */
export function getContactStands(): StandInfo[] {
	return ALL_STANDS.filter((stand) => stand.hasJetBridge);
}

/**
 * Get remote stands (bus boarding)
 */
export function getRemoteStands(): StandInfo[] {
	return ALL_STANDS.filter((stand) => !stand.hasJetBridge);
}

/**
 * Get stand statistics
 */
export function getStandStats() {
	return {
		total: ALL_STANDS.length,
		contact: getContactStands().length,
		remote: getRemoteStands().length,
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
