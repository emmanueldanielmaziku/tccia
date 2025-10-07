import { cookies } from "next/headers";

/**
 * Checks if an API response indicates an authentication error
 * and clears invalid tokens if needed
 * 
 * @param response - The fetch Response object
 * @param data - The parsed JSON data from the response
 * @returns true if this is an authentication error, false otherwise
 */
export async function handleAuthenticationError(
  response: Response,
  data: any
): Promise<boolean> {
  // Check for various authentication error patterns
  const isAuthError =
    response.status === 401 ||
    response.status === 403 ||
    (data.error?.code === "AUTHENTICATION_FAILED") ||
    (data.code === "AUTHENTICATION_FAILED") ||
    (data.error?.error_details &&
      typeof data.error.error_details === "string" &&
      data.error.error_details.toLowerCase().includes("token")) ||
    (data.error?.message &&
      typeof data.error.message === "string" &&
      (data.error.message.toLowerCase().includes("token") ||
        data.error.message.toLowerCase().includes("unauthorized"))) ||
    (typeof data.error === "string" &&
      (data.error.toLowerCase().includes("token") ||
        data.error.toLowerCase().includes("unauthorized")));

  if (isAuthError) {
    console.log(
      "🔴 Authentication error detected, clearing cookies:",
      response.url
    );

    // Clear invalid cookies
    const cookieStore = await cookies();
    cookieStore.delete("token");
    cookieStore.delete("uid");

    return true;
  }

  return false;
}

/**
 * Creates a standardized authentication error response
 */
export function createAuthErrorResponse() {
  return {
    status: "error",
    error: {
      code: "AUTHENTICATION_FAILED",
      message: "Unauthorized",
      error_details: "Invalid or expired authentication token",
    },
    message: "Authentication failed. Please log in again.",
  };
}

