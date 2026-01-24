'use client';

import { supabase } from './client';

/**
 * Gets the current user's database ID from Supabase auth
 * Throws an error if user is not authenticated
 */
export async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session || !session.user) {
    throw new Error('User not authenticated. Please sign in to continue.');
  }

  return session.user.id;
}
