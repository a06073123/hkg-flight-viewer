# Data Sources & Credits

This document provides detailed information about the external data sources used by HKG Flight Viewer, including licensing terms and attribution requirements.

---

## 📊 Data Sources Overview

| Data Type               | Source                                 | License                                     | Update Frequency |
| ----------------------- | -------------------------------------- | ------------------------------------------- | ---------------- |
| **Flight Information**  | HKIA Official API                      | [DATA.GOV.HK Terms](#hkia-flight-data)      | Real-time        |
| **Airline Information** | HKIA Official JSON                     | [DATA.GOV.HK Terms](#hkia-airline-data)     | Runtime fetch    |
| **Airport Codes**       | OurAirports via datasets/airport-codes | [Public Domain (PDDL)](#airport-codes-data) | Nightly          |

---

## HKIA Flight Data

### Source

- **Provider**: Hong Kong International Airport (HKIA)
- **API Endpoint**: `https://www.hongkongairport.com/flightinfo-rest/rest/flights/past`
- **Documentation**: [HKIA Flight Information Data Specification (PDF)](https://www.hongkongairport.com/iwov-resources/misc/opendata/Flight_Information_DataSpec_en.pdf)

### Terms of Use

Flight data from HKIA is provided through the Hong Kong Government's Open Data platform and is subject to the [DATA.GOV.HK Terms and Conditions](https://data.gov.hk/en/terms-and-conditions):

> **Key Terms:**
>
> - ✅ Commercial and non-commercial use permitted
> - ✅ Free-of-charge basis
> - ⚠️ Must acknowledge the source and data ownership
> - ⚠️ Must comply with all terms of use
> - ⚠️ Data provided "AS IS" without warranty
> - ⚠️ Government reserves right to revise/suspend data provision

### Attribution

When using this project or its data, please include:

```
Flight data © Hong Kong International Airport Authority
Provided via DATA.GOV.HK Open Data platform
```

---

## HKIA Airline Data

### Source

- **Provider**: Hong Kong International Airport (HKIA)
- **JSON Endpoint**: `https://www.hongkongairport.com/iwov-resources/custom/json/airline_en.json`
- **Data Includes**: Airline names, ICAO/IATA codes, terminal assignments, check-in aisles, transfer desk locations, ground handling agents

### Terms of Use

Same as [HKIA Flight Data](#terms-of-use) - subject to DATA.GOV.HK Terms and Conditions.

### Attribution

```
Airline data © Hong Kong International Airport Authority
```

---

## Airport Codes Data

### Source

- **Provider**: [OurAirports](https://ourairports.com) via [datasets/airport-codes](https://github.com/datasets/airport-codes)
- **Original Data**: [https://ourairports.com/data/](https://ourairports.com/data/)
- **GitHub Repository**: [https://github.com/datasets/airport-codes](https://github.com/datasets/airport-codes)
- **Data Includes**: Airport names, IATA/ICAO codes, locations, coordinates, country, continent

### Terms of Use

From the [OurAirports About Page](https://ourairports.com/about.html):

> OurAirports data is **Public Domain** (no permission required).
>
> The data is compiled from multiple sources and maintained by community contributors.

From the [datasets/airport-codes repository](https://github.com/datasets/airport-codes):

> The source specifies that the data can be used as is without any warranty. Given size and factual nature of the data and its source from a US company would imagine this was public domain and as such have licensed the Data Package under the **Public Domain Dedication and License (PDDL)**.

### PDDL License Summary

The [Public Domain Dedication and License (PDDL)](https://opendatacommons.org/licenses/pddl/1-0/) allows:

- ✅ Copying, distributing and using the database
- ✅ Creating derivative works from the database
- ✅ Modifying, transforming and building upon the database
- ✅ Commercial and non-commercial use
- ✅ No attribution required (but appreciated)

### Attribution

While not legally required, we acknowledge:

```
Airport data from OurAirports (https://ourairports.com)
Distributed via datasets/airport-codes under PDDL
```

---

## Data Refresh Scripts

### Fetching Airport Data

```bash
# Download latest airport codes from GitHub
npm run fetch:airports
```

This script:

1. Downloads `airport-codes.csv` from [datasets/airport-codes](https://github.com/datasets/airport-codes)
2. Filters airports with valid IATA codes (~9,000 airports)
3. Saves to `public/data/airports/airports.json`

### Daily Flight Archiving

```bash
# Archive today's flights (runs daily via GitHub Actions)
npm run archive

# Archive specific date
npm run archive -- 2026-01-15
```

This script:

1. Fetches flight data from HKIA API (4 categories)
2. Saves daily snapshot to `public/data/daily/`
3. Updates per-flight and per-gate indexes

---

## Summary of Licenses

| Data              | License              | Commercial Use | Attribution Required |
| ----------------- | -------------------- | -------------- | -------------------- |
| HKIA Flight Data  | DATA.GOV.HK Terms    | ✅ Yes         | ✅ Yes               |
| HKIA Airline Data | DATA.GOV.HK Terms    | ✅ Yes         | ✅ Yes               |
| Airport Codes     | PDDL (Public Domain) | ✅ Yes         | ❌ No (appreciated)  |

---

## Disclaimer

This project is not affiliated with, endorsed by, or officially connected to:

- Hong Kong International Airport Authority (AAHK)
- Airport Authority Hong Kong
- Any government agency

All data is provided "AS IS" without warranty of any kind. The maintainers of this project are not responsible for any errors, omissions, or inaccuracies in the data.

---

## Contact

For questions about data usage or licensing, please:

- Open an issue on [GitHub](https://github.com/a06073123/hkg-flight-viewer/issues)
- Contact the original data providers directly for authoritative guidance
