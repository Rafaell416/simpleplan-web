-- Add missing columns to settings table
-- Run this in your Supabase SQL Editor if you already created the settings table

-- Add font_size column
ALTER TABLE settings 
  ADD COLUMN IF NOT EXISTS font_size TEXT NOT NULL DEFAULT 'base' 
  CHECK (font_size IN ('xs', 'sm', 'base', 'lg', 'xl', '2xl'));

-- Add font_style column
ALTER TABLE settings 
  ADD COLUMN IF NOT EXISTS font_style TEXT NOT NULL DEFAULT 'system' 
  CHECK (font_style IN ('system', 'sans-serif', 'geist-sans', 'inter', 'sf-pro', 'roboto', 'open-sans'));

-- Add dark_mode column
ALTER TABLE settings 
  ADD COLUMN IF NOT EXISTS dark_mode TEXT NOT NULL DEFAULT 'auto' 
  CHECK (dark_mode IN ('light', 'dark', 'auto'));
