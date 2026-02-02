-- Add completed and completed_at columns to goals table
ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
