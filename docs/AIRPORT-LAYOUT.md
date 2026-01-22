# HKIA Airport Layout Reference

> Reference documentation for Hong Kong International Airport (VHHH) terminal and gate layout.
> Used for M5: Virtual Map & Spatial Visualization feature development.
> 
> **Sources:** [HKAIS eAIP](https://www.ais.gov.hk/eaip), [Infinite Flight Community Guide](https://community.infiniteflight.com/t/998274)

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

| Category          | Color Code | Usage                                    |
| ----------------- | ---------- | ---------------------------------------- |
| Passenger Apron   | 🔴 Red     | Commercial passenger flights             |
| Cargo Apron       | 🔵 Blue    | Scheduled/charter cargo flights          |
| Business Aviation | 🟡 Yellow  | General aviation / Business jets         |
| Maintenance       | 🩷 Pink    | Maintenance and long-term parking        |

## Terminal Structure

### Terminal 1 Layout

```
                    ┌─────────────────────────────────────┐
                    │          NORTH RUNWAY 07L/25R       │
                    └─────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                    CONSTRUCTION SITE                       │
        │                  (Future T2 Concourse)                     │
        └─────────────────────────────┼─────────────────────────────┘
                                      │
                    ┌─────────────────────────────────────┐
                    │         CENTRE RUNWAY 07C/25C       │
                    └─────────────────────────────────────┘
                                      │
   ┌──────────┐    ┌──────────┐    ┌──────────────────────────────────┐
   │ MIDFIELD │    │   WEST   │    │         PASSENGER TERMINAL       │
   │ CONCOURSE│◄───│  APRON   │◄───│    ┌────────────────────────┐   │
   │ D201-219 │ APM│ W40-W71  │    │    │   SATELLITE CONCOURSE  │   │
   │ D301-319 │    │ W121-126 │    │    │       R13-R21          │   │
   └──────────┘    └──────────┘    │    └────────────────────────┘   │
                                   │              ↑ Sky Bridge        │
                                   │    ┌────────────────────────┐   │
                                   │    │    NORTH APRON         │   │
                                   │    │  N5-N70, N141-N145     │   │
                                   │    └────────────────────────┘   │
                                   │    ┌────────────────────────┐   │
                                   │    │    T1 MAIN BUILDING    │   │
                                   │    │  Check-in / Immigration │   │
                                   │    └────────────────────────┘   │
                                   │    ┌────────────────────────┐   │
                                   │    │    SOUTH APRON         │   │
                                   │    │  S1-S47, S101-S111     │   │
                                   └────┴────────────────────────┴───┘
                                      │
                    ┌─────────────────────────────────────┐
                    │          SOUTH RUNWAY 07R/25L       │
                    └─────────────────────────────────────┘
```

### Connections

| Connection          | Method                           | Notes                                |
| ------------------- | -------------------------------- | ------------------------------------ |
| Main ↔ Satellite    | Sky Bridge (200m long, 28m high) | Opened Nov 2022, A380 can pass under |
| Main ↔ Midfield     | APM (Automated People Mover)     | Underground train system             |

---

## Passenger Stands Detail

### T1 Main Building (71 stands)

The main terminal building with three apron areas.

#### North Apron

| Stand Type    | Stand Numbers                                                          | Notes                           |
| ------------- | ---------------------------------------------------------------------- | ------------------------------- |
| Frontal       | N5, N6, N7, N8, N9, N10, N12, N24, N26, N28, N30, N32, N34, N36        |                                 |
| Frontal       | N60, N62, N64, N66, N68, N70                                           |                                 |
| Remote        | N141, N142, N143, N144, N145                                           |                                 |
| L/R Suffix    | N6, N7, N24, N26, N28, N30, N32, N34, N60, N62, N64, N66, N68, N70     | Split stands for smaller a/c    |
| Code F (A380) | N5, N60, N62, N64, N66                                                 | Wide-body capable               |
| Code C only   | N10, N12, N145                                                         | A321 or smaller                 |

#### South Apron

| Stand Type    | Stand Numbers                                                          | Notes                           |
| ------------- | ---------------------------------------------------------------------- | ------------------------------- |
| Frontal       | S1, S2, S3, S4, S11, S23, S25, S27, S29, S31, S33, S35                 |                                 |
| Frontal       | S41, S43, S45, S47                                                     |                                 |
| Remote        | S101, S102, S103, S104, S105, S106, S107, S108, S109, S110, S111       |                                 |
| L/R Suffix    | S1, S2, S3, S25, S27, S29, S31, S33, S35, S41, S43, S45, S47, S49      | Split stands                    |
| Code F (A380) | S23                                                                    | Wide-body capable               |
| Code C only   | S109                                                                   | A321 or smaller                 |

#### West Apron

| Stand Type    | Stand Numbers                                                          | Notes                           |
| ------------- | ---------------------------------------------------------------------- | ------------------------------- |
| Frontal       | W40, W42, W44, W46, W48, W50, W61, W63, W65, W67, W69, W71             |                                 |
| Remote        | W121, W122, W123, W124, W125, W126                                     |                                 |
| L/R Suffix    | W40, W42, W44, W46, W48, W61, W63, W65, W67, W69, W71                  | Split stands                    |
| Code C only   | W126                                                                   | A321 or smaller                 |

### T1 Satellite Concourse (9 stands)

Connected to main building via Sky Bridge (200m, 28m height - A380 can pass underneath).

| Stand Type    | Stand Numbers        | Notes                           |
| ------------- | -------------------- | ------------------------------- |
| Frontal       | R13, R14, R15, R16, R17, R18, R19, R20, R21 |                  |
| All stands    | R13-R21              | Code C only (A321 or smaller)   |

### T1 Midfield Concourse (38 stands)

Connected to main building via APM (Automated People Mover).

| Stand Type    | Stand Numbers                                                          | Notes                           |
| ------------- | ---------------------------------------------------------------------- | ------------------------------- |
| Frontal       | D201, D202, D203, D204, D205, D206, D207, D208, D209, D210            |                                 |
| Frontal       | D211, D212, D213, D214, D215, D216, D217, D218, D219                  |                                 |
| Remote        | D301, D302, D303, D304, D305, D306, D307, D308, D309, D310            | Overnight parking only          |
| Remote        | D311, D312, D313, D314, D315, D316, D317, D318, D319                  | Overnight parking only          |
| L/R Suffix    | D301, D302, D304-D312, D314-D317, D319                                | Split for Code C aircraft       |
| Code F (A380) | D212, D216, D306, D307, D308, D311, D312                              | Wide-body capable               |

---

## Stand Numbering Convention

The HKIA API returns gate/stand information in the `aisle` field. The mapping:

| API `aisle` Value | Area                | Examples              |
| ----------------- | ------------------- | --------------------- |
| `1-12`            | T1 North/South      | Gates near main hall  |
| `23-71`           | T1 Main Building    | N/S/W prefix stands   |
| `201-219`         | Midfield Frontal    | D201, D215, etc.      |
| `301-319`         | Midfield Remote     | D301, D310, etc.      |
| `13-21` (R prefix)| Satellite           | R13, R18, etc.        |
| `101-145`         | Remote stands       | N141, S107, etc.      |
| `121-126`         | West Remote         | W123, etc.            |
| Empty `""`        | No gate assigned    | Cargo/bus operations  |

### Stand Prefix Meaning

| Prefix | Location          | Full Name               |
| ------ | ----------------- | ----------------------- |
| N      | North Apron       | North of main building  |
| S      | South Apron       | South of main building  |
| W      | West Apron        | West of main building   |
| R      | Satellite         | Satellite concourse     |
| D      | Midfield          | Midfield concourse      |

---

## Airlines by Terminal Area

### T1 Main Building Airlines

Major international carriers operate from the main building:

- **Oneworld:** Cathay Pacific, British Airways, Finnair, Japan Airlines, Malaysia Airlines, Qantas, Qatar Airways
- **Star Alliance:** Air Canada, Air China, ANA, Asiana, EVA Air, Lufthansa, Singapore Airlines, Swiss, Thai Airways, Turkish Airlines, United
- **SkyTeam:** Air France, China Airlines, China Eastern, China Southern, KLM, Korean Air, Vietnam Airlines
- **LCC/Others:** Cebu Pacific, IndiGo, Jeju Air, Jin Air, Peach, Scoot, T'way Air, Vietjet

### T1 Satellite Concourse Airlines

Regional carriers and some mainline flights:
- Air China, Cathay Pacific, China Eastern, China Southern, Hainan Airlines, Malaysian Airlines, Philippine Airlines, Shanghai Airlines, Shenzhen Airlines, Thai Airways, Xiamen Airlines

### T1 Midfield Concourse Airlines

Primarily LCCs and regional carriers:
- **AirAsia Group:** AirAsia, Philippines AirAsia, Indonesia AirAsia, Thai AirAsia
- **Hong Kong carriers:** Greater Bay Airlines, HK Express, Hong Kong Airlines

---

## SVG Map Implementation

### Coordinate System

The SVG map uses a normalized coordinate system:

```svg
<svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
  <!-- Airport layout -->
</svg>
```

### Gate Marker Interface

```typescript
// src/types/map.ts
export interface GateMarker {
  id: string;           // "N5", "S23", "D201", "R15"
  label: string;        // "Gate 5", "Gate 23"
  x: number;            // SVG X coordinate
  y: number;            // SVG Y coordinate
  area: "north" | "south" | "west" | "satellite" | "midfield";
  terminal: "T1";
  size: "F" | "E" | "C";  // Aircraft code size
  hasLRSplit: boolean;    // Has L/R suffix variants
  currentFlight?: string;
  status: "boarding" | "scheduled" | "idle";
}
```

### Area Bounding Boxes

For pan/zoom navigation:

| Area       | X Range   | Y Range   | Center        |
| ---------- | --------- | --------- | ------------- |
| North      | 850-1150  | 200-350   | (1000, 275)   |
| South      | 850-1150  | 450-650   | (1000, 550)   |
| West       | 550-750   | 300-500   | (650, 400)    |
| Satellite  | 950-1100  | 150-250   | (1025, 200)   |
| Midfield   | 150-350   | 250-550   | (250, 400)    |

---

## Construction Notes (2024-2026)

- **New T2 Concourse**: Under construction between North and Centre runways
- **Location**: North of current passenger terminal complex
- **Expected completion**: Phased opening 2025-2027
- **Impact**: Some temporary gates (4, 5, 6, 7, 8, 10, 11, 12) in use

## Data Sources

| Source                         | URL                                              |
| ------------------------------ | ------------------------------------------------ |
| HKAIS eAIP                     | https://www.ais.gov.hk/eaip                      |
| HK Airport Official            | https://www.hongkongairport.com                  |
| HKIA Operations Manual         | https://opsportal.hongkongairport.com            |
| Infinite Flight Community      | https://community.infiniteflight.com/t/998274    |
