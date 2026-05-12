-- V3: Add 'unit' column to service_types to distinguish KG vs PIECE pricing
ALTER TABLE service_types ADD COLUMN IF NOT EXISTS unit VARCHAR(10) NOT NULL DEFAULT 'KG';
