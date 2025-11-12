import { AxiosError } from "axios";

/**
 * Extracts a user-friendly error message from an API error.
 * 
 * This function replaces the nested ternary logic:
 *   typeof error.response?.data?.message === 'string' 
 *     ? error.response.data.message 
 *     : typeof error.response?.data === 'string'
 *     ? error.response.data
 *     : error.message || fallback
 * 
 * Checks multiple sources in order of priority:
 * 1. error.response.data.message (if string) - with type safety check
 * 2. error.response.data (if string)
 * 3. error.message (if truthy, otherwise fallback)
 * 4. fallback string
 * 
 * @param error - The error object (typically an AxiosError)
 * @param fallback - The fallback message to use if no error message is found
 * @returns A string error message
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: unknown } | string>;
  
  // Priority 1: Check if response.data.message is a string
  if (
    axiosError.response?.data &&
    typeof axiosError.response.data === 'object' &&
    'message' in axiosError.response.data &&
    typeof axiosError.response.data.message === 'string'
  ) {
    return axiosError.response.data.message;
  }
  
  // Priority 2: Check if response.data itself is a string
  if (typeof axiosError.response?.data === 'string') {
    return axiosError.response.data;
  }
  
  // Priority 3: Check error.message from the error object itself
  if (axiosError.message) {
    return axiosError.message;
  }
  
  // Priority 4: Use fallback
  return fallback;
}

