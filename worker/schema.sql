-- HKG Flight Viewer D1 Schema
-- Version: 1.0.0
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
    raw_data TEXT,                         -- Full JSON for additional fields
    archived_at TEXT NOT NULL,             -- When this record was archived
    
    UNIQUE(date, time, flight_no, is_arrival)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_flights_date ON flights(date);
CREATE INDEX IF NOT EXISTS idx_flights_flight_no ON flights(flight_no);
CREATE INDEX IF NOT EXISTS idx_flights_airline ON flights(airline);
CREATE INDEX IF NOT EXISTS idx_flights_gate ON flights(gate_baggage) WHERE is_arrival = 0;
CREATE INDEX IF NOT EXISTS idx_flights_date_time ON flights(date, time);

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
