import type { TermsConfig } from '../types/termsTypes';

// Empty function reference to prevent recreation
export const NOOP = () => {};

// Default configuration for terms checking
export const DEFAULT_TERMS_CONFIG: Required<TermsConfig> = Object.freeze({
  checkOn: 'mount',
  triggerConditions: Object.freeze({
    requireOwner: true,
    requireAcceptance: true,
    requireCurrentVersion: true,
  }),
  modalConfig: Object.freeze({
    closeable: false,
    blockingMode: true,
  }),
  onTermsRequired: NOOP,
  onTermsAccepted: NOOP,
  onTermsSkipped: NOOP,
});

// Query keys for React Query
export const TERMS_QUERY_KEYS = {
  OWNER_STATUS: ['owner-terms-status'],
} as const;

// Cache settings
export const TERMS_CACHE_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  RETRY_COUNT: 1,
} as const;
