-- Add paused column to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS paused BOOLEAN NOT NULL DEFAULT false;
