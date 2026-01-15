# Supabase Setup Guide

This project uses Supabase as the database backend. Users are identified by anonymous IDs initially, and can later link their Google authentication.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Setup Steps

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Create Environment Variables

Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings:
- Go to your Supabase project dashboard
- Navigate to Settings → API
- Copy the "Project URL" and "anon public" key

### 3. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL script to create all tables, indexes, and RLS policies

### 4. Verify Setup

Once you've set up the environment variables and run the schema, the app will:
- Automatically create anonymous user IDs for new users
- Migrate existing localStorage data to Supabase on first load
- Use Supabase for all data storage (goals, actions, todos, settings)

If Supabase is not configured, the app will fall back to localStorage.

## How It Works

### Anonymous Users

- Each user gets a unique anonymous ID stored in localStorage
- This ID is used to identify users before they authenticate
- The anonymous ID is linked to a user record in the database

### Future Authentication

When you're ready to add Google authentication:
1. The anonymous user ID will be linked to the authenticated user
2. All existing data will be preserved
3. Users can then sign in with Google across devices

## Database Schema

The database includes the following tables:
- `users` - User accounts (anonymous and authenticated)
- `goals` - User goals
- `actions` - Actions/habits for goals
- `action_completions` - Completion records for actions
- `todos` - Regular todos (separate from goal actions)
- `settings` - User preferences

All tables use Row Level Security (RLS) to ensure users can only access their own data.
