-- Migration script to update existing database for authenticated users only
-- Run this in your Supabase SQL Editor to update RLS policies

-- ============================================
-- STEP 1: Drop existing RLS policies
-- ============================================

DROP POLICY IF EXISTS "Users can view user records" ON users;
DROP POLICY IF EXISTS "Users can insert user records" ON users;
DROP POLICY IF EXISTS "Authenticated users can view their own user record" ON users;
DROP POLICY IF EXISTS "Authenticated users can update their own user record" ON users;
DROP POLICY IF EXISTS "Users can view their own record" ON users;
DROP POLICY IF EXISTS "Users can insert their own record" ON users;
DROP POLICY IF EXISTS "Users can update their own record" ON users;

DROP POLICY IF EXISTS "Users can view goals" ON goals;
DROP POLICY IF EXISTS "Users can insert goals" ON goals;
DROP POLICY IF EXISTS "Users can update goals" ON goals;
DROP POLICY IF EXISTS "Users can delete goals" ON goals;
DROP POLICY IF EXISTS "Users can view their own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON goals;

DROP POLICY IF EXISTS "Users can view actions" ON actions;
DROP POLICY IF EXISTS "Users can insert actions" ON actions;
DROP POLICY IF EXISTS "Users can update actions" ON actions;
DROP POLICY IF EXISTS "Users can delete actions" ON actions;
DROP POLICY IF EXISTS "Users can view actions for their goals" ON actions;
DROP POLICY IF EXISTS "Users can insert actions for their goals" ON actions;
DROP POLICY IF EXISTS "Users can update actions for their goals" ON actions;
DROP POLICY IF EXISTS "Users can delete actions for their goals" ON actions;

DROP POLICY IF EXISTS "Users can view action completions" ON action_completions;
DROP POLICY IF EXISTS "Users can insert action completions" ON action_completions;
DROP POLICY IF EXISTS "Users can update action completions" ON action_completions;
DROP POLICY IF EXISTS "Users can delete action completions" ON action_completions;
DROP POLICY IF EXISTS "Users can view action completions for their actions" ON action_completions;
DROP POLICY IF EXISTS "Users can insert action completions for their actions" ON action_completions;
DROP POLICY IF EXISTS "Users can update action completions for their actions" ON action_completions;
DROP POLICY IF EXISTS "Users can delete action completions for their actions" ON action_completions;
DROP POLICY IF EXISTS "Users can view their action completions" ON action_completions;
DROP POLICY IF EXISTS "Users can insert their action completions" ON action_completions;
DROP POLICY IF EXISTS "Users can update their action completions" ON action_completions;
DROP POLICY IF EXISTS "Users can delete their action completions" ON action_completions;

DROP POLICY IF EXISTS "Users can view todos" ON todos;
DROP POLICY IF EXISTS "Users can insert todos" ON todos;
DROP POLICY IF EXISTS "Users can update todos" ON todos;
DROP POLICY IF EXISTS "Users can delete todos" ON todos;
DROP POLICY IF EXISTS "Users can view their own todos" ON todos;
DROP POLICY IF EXISTS "Users can insert their own todos" ON todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON todos;

DROP POLICY IF EXISTS "Users can view settings" ON settings;
DROP POLICY IF EXISTS "Users can insert settings" ON settings;
DROP POLICY IF EXISTS "Users can update settings" ON settings;
DROP POLICY IF EXISTS "Users can delete settings" ON settings;
DROP POLICY IF EXISTS "Users can view their own settings" ON settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON settings;

-- ============================================
-- STEP 2: Remove anonymous_id column if exists
-- ============================================

ALTER TABLE users DROP COLUMN IF EXISTS anonymous_id;
DROP INDEX IF EXISTS idx_users_anonymous_id;

-- Remove auth_provider columns if not needed
ALTER TABLE users DROP COLUMN IF EXISTS auth_provider;
ALTER TABLE users DROP COLUMN IF EXISTS auth_provider_id;
DROP INDEX IF EXISTS idx_users_auth_provider;

-- ============================================
-- STEP 3: Create new RLS policies for authenticated users only
-- ============================================

-- Users policies
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own record"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own record"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Goals policies
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

-- Actions policies
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

-- Action completions policies
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

-- Todos policies
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

-- Settings policies
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

-- ============================================
-- STEP 4: Clean up any orphaned data (optional)
-- ============================================

-- Delete users without valid auth.users entry
-- DELETE FROM users WHERE id NOT IN (SELECT id FROM auth.users);

-- Add email index if not exists
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
