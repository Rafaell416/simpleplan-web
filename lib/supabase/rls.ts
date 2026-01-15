'use client';

import { ensureUserExists } from './migrations';

/**
 * Gets or creates the current user's database ID
 * This ensures the user exists in the database before any operations
 */
export async function getUserId(): Promise<string> {
  return ensureUserExists();
}
