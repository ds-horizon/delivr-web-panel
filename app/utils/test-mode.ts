/**
 * Test mode detection utility
 * 
 * Simple approach: Automation/Test mode is detected by checking if DELIVR_BACKEND_URL
 * points to the mock server (http://localhost:3001).
 * 
 * This avoids hydration issues that occur when NODE_ENV=test is used.
 */

/**
 * Checks if we're running in test/automation mode
 * 
 * Test mode is detected when DELIVR_BACKEND_URL points to mock server.
 * 
 * @returns true if in test mode, false otherwise
 */
export function isTestMode(): boolean {
  return process.env.DELIVR_BACKEND_URL === "http://localhost:3001";
}

/**
 * Gets the backend URL for the current environment
 * 
 * In test mode, returns the mock server URL.
 * Otherwise, returns the configured DELIVR_BACKEND_URL or default.
 * 
 * @returns The backend URL to use
 */
export function getBackendUrl(): string {
  if (isTestMode()) {
    return process.env.DELIVR_BACKEND_URL || "http://localhost:3001";
  }
  return process.env.DELIVR_BACKEND_URL || "http://localhost:3010";
}

