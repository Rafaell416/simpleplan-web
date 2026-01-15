-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for anonymous users and authenticated users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anonymous_id TEXT UNIQUE, -- For anonymous users before authentication
  email TEXT, -- Will be set when user authenticates with Google
  auth_provider TEXT, -- 'google', etc.
  auth_provider_id TEXT, -- Provider-specific user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(auth_provider, auth_provider_id) -- Ensure one account per provider
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Actions table
CREATE TABLE IF NOT EXISTS actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('daily', 'weekdays', 'weekly', 'custom')),
  recurrence_weekly_day INTEGER, -- 0-6 (0 = Sunday) for 'weekly' type
  recurrence_custom_days INTEGER[], -- Array of day numbers (0-6) for 'custom' type
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Action completions table (separate table for better querying)
CREATE TABLE IF NOT EXISTS action_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(action_id, date) -- One completion record per action per date
);

-- Todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  action_id UUID REFERENCES actions(id) ON DELETE SET NULL, -- Link to action if it's an action todo
  goal_title TEXT, -- Cache goal title for display
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'default' CHECK (theme IN ('default', 'nude-rose', 'nude-beige', 'sage-green', 'lavender', 'warm-sand', 'ocean-blue', 'soft-peach', 'charcoal', 'midnight')),
  font_size TEXT NOT NULL DEFAULT 'base' CHECK (font_size IN ('xs', 'sm', 'base', 'lg', 'xl', '2xl')),
  font_style TEXT NOT NULL DEFAULT 'system' CHECK (font_style IN ('system', 'sans-serif', 'geist-sans', 'inter', 'sf-pro', 'roboto', 'open-sans')),
  dark_mode TEXT NOT NULL DEFAULT 'auto' CHECK (dark_mode IN ('light', 'dark', 'auto')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- One settings record per user
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_actions_goal_id ON actions(goal_id);
CREATE INDEX IF NOT EXISTS idx_action_completions_action_id ON action_completions(action_id);
CREATE INDEX IF NOT EXISTS idx_action_completions_date ON action_completions(date);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_action_id ON todos(action_id);
CREATE INDEX IF NOT EXISTS idx_users_anonymous_id ON users(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider, auth_provider_id);

-- Row Level Security (RLS) policies
-- Note: Since we're using anonymous users, RLS is simplified
-- All queries filter by user_id on the client side
-- RLS provides an additional security layer for authenticated users

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Users policies - allow all operations for now (filtered by client-side user_id)
-- When authentication is added, these can be tightened
CREATE POLICY "Users can view user records"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can insert user records"
  ON users FOR INSERT
  WITH CHECK (true);

-- Goals policies - allow all operations (filtered by client-side user_id)
-- When authentication is added, these can use auth.uid()
CREATE POLICY "Users can view goals"
  ON goals FOR SELECT
  USING (true);

CREATE POLICY "Users can insert goals"
  ON goals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update goals"
  ON goals FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete goals"
  ON goals FOR DELETE
  USING (true);

-- Actions policies - allow all operations (filtered by client-side via goals.user_id)
CREATE POLICY "Users can view actions"
  ON actions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert actions"
  ON actions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update actions"
  ON actions FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete actions"
  ON actions FOR DELETE
  USING (true);

-- Action completions policies - allow all operations (filtered by client-side via actions/goals.user_id)
CREATE POLICY "Users can view action completions"
  ON action_completions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert action completions"
  ON action_completions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update action completions"
  ON action_completions FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete action completions"
  ON action_completions FOR DELETE
  USING (true);

-- Todos policies - allow all operations (filtered by client-side user_id)
CREATE POLICY "Users can view todos"
  ON todos FOR SELECT
  USING (true);

CREATE POLICY "Users can insert todos"
  ON todos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update todos"
  ON todos FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete todos"
  ON todos FOR DELETE
  USING (true);

-- Settings policies - allow all operations (filtered by client-side user_id)
CREATE POLICY "Users can view settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert settings"
  ON settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update settings"
  ON settings FOR UPDATE
  USING (true);
