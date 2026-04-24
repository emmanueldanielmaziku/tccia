let originalFetch: typeof fetch;
let sessionExpiredHandler: (() => void) | null = null;

const EXCLUDED_AUTH_CHECK_PATHS = [
  '/api/auth/user_token',
  '/api/request-password-reset',
  '/api/reset-password',
  '/api/location/ip',
];

if (typeof window !== 'undefined') {
  originalFetch = window.fetch;
}

export function setupFetchInterceptor(handler: () => void) {
  sessionExpiredHandler = handler;
  
  if (typeof window !== 'undefined') {

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      try {
        const response = await originalFetch(input, init);
        const requestUrl = input.toString();
        const shouldSkipAuthCheck = EXCLUDED_AUTH_CHECK_PATHS.some((path) =>
          requestUrl.includes(path)
        );
       
        // Only trigger session expired for authenticated endpoints, not login
        if ((response.status === 401 || response.status === 403) && 
            !shouldSkipAuthCheck) {
          
          // Check if response contains authentication error indicators
          const clonedResponse = response.clone();
          try {
            const responseData = await clonedResponse.json();
            
            // Check for various authentication error patterns
            const isAuthError = (
              // Standard jsonrpc error format
              (responseData.result?.error && responseData.result.error.toLowerCase().includes('token')) ||
              (responseData.result?.error && responseData.result.error.toLowerCase().includes('unauthorized')) ||
              (responseData.result?.error && responseData.result.error.toLowerCase().includes('authentication')) ||
              // Direct error format
              (responseData.error?.code === 'AUTHENTICATION_FAILED') ||
              (responseData.error?.message && responseData.error.message.toLowerCase().includes('token')) ||
              (responseData.error?.error_details && responseData.error.error_details.toLowerCase().includes('token')) ||
              // Simple status check for 401/403
              response.status === 401 || response.status === 403
            );
            
            if (isAuthError) {
              console.log("🔴 Fetch interceptor: Authentication error detected", {
                status: response.status,
                url: requestUrl,
                errorData: responseData
              });
              if (sessionExpiredHandler) {
                console.log("🔴 Calling session expired handler");
                sessionExpiredHandler();
              }
            }
          } catch (jsonError) {
            // If response is not JSON, fall back to status code check
            console.log("🔴 Fetch interceptor: Session expired detected (status-based), status:", response.status, "URL:", requestUrl);
            if (sessionExpiredHandler) {
              console.log("🔴 Calling session expired handler");
              sessionExpiredHandler();
            }
          }
        }
        
        return response;
      } catch (error) {
        throw error;
      }
    };
  }
}

export function removeFetchInterceptor() {
  if (typeof window !== 'undefined' && originalFetch) {
    window.fetch = originalFetch;
  }
  sessionExpiredHandler = null;
}
