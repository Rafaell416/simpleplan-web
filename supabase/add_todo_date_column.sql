-- Migration script to add date column to todos table
-- Run this in your Supabase SQL Editor if you have an existing database

-- Add date column (defaults to today for existing todos)
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;

-- Update existing todos to use their created_at date
UPDATE todos 
SET date = DATE(created_at) 
WHERE date IS NULL;

-- Make date NOT NULL after setting defaults
ALTER TABLE todos 
ALTER COLUMN date SET NOT NULL;

-- Remove the default now that all rows have dates
ALTER TABLE todos 
ALTER COLUMN date DROP DEFAULT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_date ON todos(date);
CREATE INDEX IF NOT EXISTS idx_todos_user_date ON todos(user_id, date);
