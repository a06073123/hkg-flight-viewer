-- HKG Flight Viewer D1 Schema
-- Version: 1.1.0
-- Created: 2026-01-22

-- Main flights table with denormalized structure for query performance
CREATE TABLE IF NOT EXISTS flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,                    -- YYYY-MM-DD
    time TEXT NOT NULL,                    -- HH:MM
    flight_no TEXT NOT NULL,               -- Primary flight number (e.g., "CX888")
    airline TEXT NOT NULL,                 -- Airline code (e.g., "CX")
    origin_dest TEXT,                      -- Airport code(s)
    status TEXT,                           -- Current status
    gate_baggage TEXT,                     -- Gate (departure) or Baggage (arrival)
    terminal TEXT,                         -- Terminal number
    is_arrival INTEGER NOT NULL,           -- 0 = departure, 1 = arrival
    is_cargo INTEGER NOT NULL,             -- 0 = passenger, 1 = cargo
    codeshares TEXT,                       -- JSON array of codeshare flight numbers
    archived_at TEXT NOT NULL,             -- When this record was archived
    
    UNIQUE(date, time, flight_no, is_arrival)
);

-- ICAO to IATA code mapping table (auto-populated from raw flight data)
-- Used for fuzzy flight number search (e.g., "ANA814" → "NH 814")
-- Source: flight.airline (ICAO) + flight.no prefix (IATA)
CREATE TABLE IF NOT EXISTS airlines (
    icao_code TEXT PRIMARY KEY,            -- ICAO 3-letter code (e.g., "UPS", "CPA", "ANA")
    iata_code TEXT NOT NULL,               -- IATA 2-letter code (e.g., "5X", "CX", "NH")
    sample_flight TEXT,                    -- Sample flight number for debugging
    updated_at TEXT                        -- Last update timestamp
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_flights_date ON flights(date);
CREATE INDEX IF NOT EXISTS idx_flights_flight_no ON flights(flight_no);
CREATE INDEX IF NOT EXISTS idx_flights_airline ON flights(airline);
CREATE INDEX IF NOT EXISTS idx_flights_gate ON flights(gate_baggage) WHERE is_arrival = 0;
CREATE INDEX IF NOT EXISTS idx_flights_date_time ON flights(date, time);
CREATE INDEX IF NOT EXISTS idx_airlines_iata ON airlines(iata_code);
CREATE INDEX IF NOT EXISTS idx_airlines_icao ON airlines(icao_code);

-- Gate usage view for analytics
CREATE VIEW IF NOT EXISTS gate_departures AS
SELECT 
    gate_baggage as gate,
    date,
    time,
    flight_no,
    airline,
    origin_dest,
    status
FROM flights 
WHERE is_arrival = 0 AND gate_baggage IS NOT NULL AND gate_baggage != '';

-- Flight history view
CREATE VIEW IF NOT EXISTS flight_history AS
SELECT 
    flight_no,
    date,
    time,
    origin_dest,
    status,
    gate_baggage,
    terminal,
    is_arrival,
    is_cargo
FROM flights
ORDER BY date DESC, time DESC;
