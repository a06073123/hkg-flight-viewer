# HKIA Airport Layout Reference

> Reference documentation for Hong Kong International Airport (VHHH) terminal and gate layout.
> Used for M5: Virtual Map & Spatial Visualization feature development.

## Overview

Hong Kong International Airport operates with a **Three Runway System (3RS)** since November 28, 2024. The airport consists of:

- **3 parallel runways** (North, Centre, South)
- **200+ parking bays** across multiple aprons
- **Terminal 1** with Main Building, Satellite Concourse, and Midfield Concourse

## Runway Configuration

| Runway   | Designation | Dimensions      | Primary Usage                     |
| -------- | ----------- | --------------- | --------------------------------- |
| North    | 07L/25R     | 3800m × 60m     | Mostly landing during daytime     |
| Centre   | 07C/25C     | 3800m × 60m     | Takeoff only during daytime       |
| South    | 07R/25L     | 3800m × 60m     | Takeoff & Landing (mixed use)     |

> Note: 3800m = 12,467 ft, 60m = 197 ft

## Apron Categories

The airport aprons are divided into four categories:

| Category          | Color Code | Usage                                    |
| ----------------- | ---------- | ---------------------------------------- |
| Passenger Apron   | 🔴 Red     | Commercial passenger flights             |
| Cargo Apron       | 🔵 Blue    | Scheduled/charter cargo flights          |
| Business Aviation | 🟡 Yellow  | General aviation / Business jets         |
| Maintenance       | 🩷 Pink    | Maintenance and long-term parking        |

## Terminal Structure

### Terminal 1 - Main Building

The main terminal building connects to multiple concourses:

```
┌─────────────────────────────────────────────────────────────────┐
│                    TERMINAL 1 MAIN BUILDING                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           Check-in Halls / Immigration / Customs        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│            ┌─────────────────┼─────────────────┐                │
│            │                 │                 │                 │
│            ▼                 ▼                 ▼                 │
│    ┌───────────┐     ┌───────────┐     ┌───────────┐           │
│    │   NORTH   │     │  CENTRAL  │     │   SOUTH   │           │
│    │   GATES   │     │   GATES   │     │   GATES   │           │
│    │   1-20    │     │   21-40   │     │   41-80   │           │
│    └───────────┘     └───────────┘     └───────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Terminal 1 - Satellite Concourse

Connected to main building via underground APM (Automated People Mover):

- Additional boarding gates for wide-body aircraft
- Premium lounges

### Terminal 1 - Midfield Concourse

Located between the runways, connected via APM:

- Gates 201-230 (approximate)
- Serves long-haul flights
- Modern design with skybridge views

## Gate Numbering System

### Passenger Gates

| Gate Range | Location              | Aircraft Size      |
| ---------- | --------------------- | ------------------ |
| 1-20       | T1 North              | Wide-body          |
| 21-40      | T1 Central            | Mixed              |
| 41-71      | T1 South              | Wide-body          |
| 201-230    | Midfield Concourse    | Wide-body          |
| 501-520    | Satellite Concourse   | Wide-body          |

### Cargo Stands

| Stand Range | Location           | Usage                          |
| ----------- | ------------------ | ------------------------------ |
| 601-680     | Cargo Apron        | Scheduled cargo                |
| 701-750     | West Cargo Apron   | Cargo + Test flights           |

### Remote Stands

| Stand Range | Location           | Usage                          |
| ----------- | ------------------ | ------------------------------ |
| 301-350     | North Apron        | Bus gate / Remote parking      |
| 401-450     | South Apron        | Bus gate / Remote parking      |

## Gate Coordinate Mapping (SVG)

For the virtual map implementation, gates need to be mapped to SVG coordinates.
The coordinate system uses a normalized scale where the airport fits within a viewBox.

### Suggested ViewBox

```svg
<svg viewBox="0 0 1000 600">
  <!-- Airport layout elements -->
</svg>
```

### Gate Coordinate Structure

```typescript
// src/types/map.ts
export interface GateMarker {
  id: string;         // "1", "41", "201"
  label: string;      // "Gate 1", "Gate 41"
  x: number;          // SVG X coordinate (0-1000)
  y: number;          // SVG Y coordinate (0-600)
  terminal: "T1" | "MFC" | "SAT";  // Terminal area
  size: "L" | "M" | "S";           // Gate size category
  currentFlight?: string;
  status: "boarding" | "scheduled" | "idle";
}
```

### Sample Gate Coordinates

```typescript
// src/lib/map-coords.ts
export const GATE_COORDINATES: Record<string, { x: number; y: number; terminal: string }> = {
  // T1 North Gates (1-20)
  "1": { x: 150, y: 200, terminal: "T1" },
  "2": { x: 170, y: 200, terminal: "T1" },
  "3": { x: 190, y: 200, terminal: "T1" },
  // ... continue for all gates
  
  // T1 Central Gates (21-40)
  "21": { x: 400, y: 250, terminal: "T1" },
  "22": { x: 420, y: 250, terminal: "T1" },
  // ...
  
  // T1 South Gates (41-71)
  "41": { x: 600, y: 200, terminal: "T1" },
  "42": { x: 620, y: 200, terminal: "T1" },
  // ...
  
  // Midfield Concourse (201-230)
  "201": { x: 300, y: 450, terminal: "MFC" },
  "202": { x: 320, y: 450, terminal: "MFC" },
  // ...
  
  // Satellite Concourse (501-520)
  "501": { x: 800, y: 350, terminal: "SAT" },
  "502": { x: 820, y: 350, terminal: "SAT" },
  // ...
};
```

## Taxiway System

Main taxiways connect all aprons to runways:

| Taxiway | Location                    | Notes                    |
| ------- | --------------------------- | ------------------------ |
| A       | Parallel to South runway    | Main east-west corridor  |
| B       | Between runways             | Connects to Midfield     |
| C       | Parallel to North runway    | Cargo area access        |
| E/F/G   | Cross taxiways              | Runway crossing points   |

### Code F Aircraft Restrictions

Large aircraft (A380, 747-8) have restricted taxiway access marked on aerodrome charts.

## Construction Notes (2024-2026)

- **New T2 Concourse**: Under construction between North and Centre runways
- **Expected completion**: Phased opening 2025-2027
- **Impact**: Some remote stands temporarily closed

## Data Sources

| Source                         | URL                                              |
| ------------------------------ | ------------------------------------------------ |
| HKAIS eAIP                     | https://www.ais.gov.hk/eaip                      |
| HK Airport Official            | https://www.hongkongairport.com                  |
| HKIA Operations Manual         | https://opsportal.hongkongairport.com            |
| Infinite Flight Community Guide| https://community.infiniteflight.com/t/998274    |

## Implementation Notes

### SVG Map Requirements

1. **Simplified Layout**: Focus on gate positions, not architectural details
2. **Responsive**: Must scale for mobile devices (pan & zoom)
3. **Performance**: Use SVG groups for efficient rendering
4. **Accessibility**: Include ARIA labels for gate markers

### Status Color Scheme

```css
/* Gate status colors */
.gate-scheduled { fill: #3b82f6; }      /* Blue */
.gate-boarding  { fill: #eab308; animation: pulse 1s infinite; }  /* Yellow, blinking */
.gate-idle      { fill: #6b7280; }      /* Gray */
```

### Integration with Flight Data

Gates from the HKIA API `aisle` field map to gate numbers:
- `aisle: "41"` → Gate 41
- `aisle: "501"` → Gate 501 (Satellite)
- `aisle: "201"` → Gate 201 (Midfield)

Some flights may show `aisle: ""` (empty) for:
- Cargo flights without passenger gates
- Bus gate operations
- Remote parking
