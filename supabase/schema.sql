-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for authenticated users only)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
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
  date DATE NOT NULL, -- Date for which this todo is scheduled
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
  dark_mode TEXT NOT NULL DEFAULT 'light' CHECK (dark_mode IN ('light', 'dark', 'auto')),
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
CREATE INDEX IF NOT EXISTS idx_todos_date ON todos(date);
CREATE INDEX IF NOT EXISTS idx_todos_user_date ON todos(user_id, date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Row Level Security (RLS) policies
-- All operations require authentication via auth.uid()

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Users policies - authenticated users can manage their own record
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own record"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own record"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Goals policies - authenticated users can manage their own goals
CREATE POLICY "Users can view their own goals"
  ON goals FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own goals"
  ON goals FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own goals"
  ON goals FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own goals"
  ON goals FOR DELETE
  USING (user_id = auth.uid());

-- Actions policies - access controlled through goal ownership
CREATE POLICY "Users can view actions for their goals"
  ON actions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM goals WHERE goals.id = actions.goal_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert actions for their goals"
  ON actions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM goals WHERE goals.id = actions.goal_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can update actions for their goals"
  ON actions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM goals WHERE goals.id = actions.goal_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete actions for their goals"
  ON actions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM goals WHERE goals.id = actions.goal_id AND goals.user_id = auth.uid()
  ));

-- Action completions policies - access controlled through action/goal ownership
CREATE POLICY "Users can view their action completions"
  ON action_completions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM actions
    JOIN goals ON goals.id = actions.goal_id
    WHERE actions.id = action_completions.action_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their action completions"
  ON action_completions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM actions
    JOIN goals ON goals.id = actions.goal_id
    WHERE actions.id = action_completions.action_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their action completions"
  ON action_completions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM actions
    JOIN goals ON goals.id = actions.goal_id
    WHERE actions.id = action_completions.action_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their action completions"
  ON action_completions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM actions
    JOIN goals ON goals.id = actions.goal_id
    WHERE actions.id = action_completions.action_id AND goals.user_id = auth.uid()
  ));

-- Todos policies - authenticated users can manage their own todos
CREATE POLICY "Users can view their own todos"
  ON todos FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own todos"
  ON todos FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own todos"
  ON todos FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own todos"
  ON todos FOR DELETE
  USING (user_id = auth.uid());

-- Settings policies - authenticated users can manage their own settings
CREATE POLICY "Users can view their own settings"
  ON settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings"
  ON settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings"
  ON settings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own settings"
  ON settings FOR DELETE
  USING (user_id = auth.uid());
