-- Fix the theme constraint to allow all theme palette values
-- Run this in your Supabase SQL Editor if you already created the settings table

-- Drop the old constraint
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_theme_check;

-- Add the new constraint with all theme palette values
ALTER TABLE settings 
  ADD CONSTRAINT settings_theme_check 
  CHECK (theme IN ('default', 'nude-rose', 'nude-beige', 'sage-green', 'lavender', 'warm-sand', 'ocean-blue', 'soft-peach', 'charcoal', 'midnight'));

-- Update the default value
ALTER TABLE settings ALTER COLUMN theme SET DEFAULT 'default';
