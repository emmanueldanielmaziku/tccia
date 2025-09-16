/**
 * Utility function to handle session expired errors consistently
 * This prevents console errors and provides a clean way to handle session expiration
 */
export function handleSessionError(error: unknown): boolean {
  if (error instanceof Error && error.message === "SESSION_EXPIRED") {
    // Session expired is handled by the popup, no need to log or throw
    return true; // Indicates this was a session expired error
  }
  return false; // Indicates this was not a session expired error
}

/**
 * Wrapper for API calls that handles session expired errors gracefully
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  onError?: (error: unknown) => void
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    if (handleSessionError(error)) {
      // Session expired is handled by popup, return null
      return null;
    }
    
    // Handle other errors
    if (onError) {
      onError(error);
    }
    throw error;
  }
}
