'use client';

import { supabase } from './client';
import { getOrCreateUserId } from './userId';

/**
 * Ensures the user exists in the database
 * This is called when the app first loads to create the user record if needed
 */
export async function ensureUserExists(): Promise<string> {
  const anonymousId = getOrCreateUserId();
  
  // Check if user exists
  let { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('anonymous_id', anonymousId)
    .maybeSingle(); // Use maybeSingle() to handle no rows gracefully

  if (!user || (userError && userError.code === 'PGRST116')) {
    // User doesn't exist, create it
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({ anonymous_id: anonymousId })
      .select('id')
      .single();

    if (createError || !newUser) {
      throw new Error(`Failed to create user: ${createError?.message || 'Unknown error'}`);
    }
    return newUser.id;
  } else if (userError) {
    throw new Error(`Failed to get user: ${userError.message}`);
  }

  return user.id;
}
