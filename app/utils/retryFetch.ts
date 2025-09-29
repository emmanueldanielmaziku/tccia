import { useState } from 'react';

/**
 * Utility function for making fetch requests with automatic retry on timeout
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param retryConfig - Retry configuration
 * @returns Promise<Response>
 */
export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  onRetry?: (retryCount: number, maxRetries: number) => void;
  onTimeout?: () => void;
}

export async function retryFetch(
  url: string,
  options: RequestInit = {},
  retryConfig: RetryConfig = {}
): Promise<Response> {
  const {
    maxRetries = 2,
    retryDelay = 2000,
    timeout = 10000,
    onRetry,
    onTimeout,
  } = retryConfig;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a timeout error and we haven't exceeded max retries
      if (error instanceof Error && error.name === 'AbortError' && attempt < maxRetries) {
        console.log(`Timeout occurred. Retrying... (${attempt + 1}/${maxRetries})`);
        onRetry?.(attempt + 1, maxRetries);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else if (error instanceof Error && error.name === 'AbortError') {
        onTimeout?.();
        throw new Error("Request timed out after multiple attempts. Please check your connection and try again.");
      } else {
        throw error;
      }
    }
  }

  throw lastError!;
}

/**
 * Hook for handling retry logic in React components
 * @param fetchFunction - The function to retry
 * @param retryConfig - Retry configuration
 * @returns Object with retry state and functions
 */
export function useRetryFetch(retryConfig: RetryConfig = {}) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const executeWithRetry = async <T>(
    fetchFunction: () => Promise<T>
  ): Promise<T> => {
    const { maxRetries = 2, retryDelay = 2000, onRetry } = retryConfig;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setIsRetrying(false);
        setRetryCount(0);
        return await fetchFunction();
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError' && attempt < maxRetries) {
          setIsRetrying(true);
          setRetryCount(attempt + 1);
          onRetry?.(attempt + 1, maxRetries);
          
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          setIsRetrying(false);
          setRetryCount(0);
          throw error;
        }
      }
    }
    
    throw new Error("Max retries exceeded");
  };

  return {
    isRetrying,
    retryCount,
    executeWithRetry,
  };
}

