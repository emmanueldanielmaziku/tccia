let originalFetch: typeof fetch;
let sessionExpiredHandler: (() => void) | null = null;


if (typeof window !== 'undefined') {
  originalFetch = window.fetch;
}

export function setupFetchInterceptor(handler: () => void) {
  sessionExpiredHandler = handler;
  
  if (typeof window !== 'undefined') {

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      try {
        const response = await originalFetch(input, init);
       
        if (response.status === 401 || response.status === 403) {
          console.log("🔴 Fetch interceptor: Session expired detected, status:", response.status, "URL:", input);
          if (sessionExpiredHandler) {
            console.log("🔴 Calling session expired handler");
            sessionExpiredHandler();
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
