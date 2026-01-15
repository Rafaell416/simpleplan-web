'use client';

const USER_ID_KEY = 'simpleplan-user-id';

/**
 * Gets or creates an anonymous user ID stored in localStorage
 * This ID will be used to identify users before they authenticate
 */
export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') {
    // Server-side: return a temporary ID (shouldn't happen in client components)
    return 'temp-' + Date.now();
  }

  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    // Generate a unique anonymous ID
    userId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}

/**
 * Gets the current user ID without creating one
 */
export function getUserId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(USER_ID_KEY);
}

/**
 * Sets the user ID (useful when linking with authenticated user)
 */
export function setUserId(userId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(USER_ID_KEY, userId);
}
