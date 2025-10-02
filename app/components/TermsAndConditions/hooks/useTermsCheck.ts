import { useCallback, useMemo } from 'react';
import type { TermsCheckResult, TermsConfig } from '../types/termsTypes';
import { handleTermsError, mergeTermsConfig, shouldShowTermsModal, validateTermsConfig } from '../utils/termsUtils';
import { useGetOwnerTermsStatus } from './useGetOwnerTermsStatus';
import { useTermsAcceptance } from './useTermsAcceptance';
import { useTermsAutoCheck } from './useTermsAutoCheck';
import { useTermsModal } from './useTermsModal';

/**
 * Main hook for terms checking and management
 * 
 * @param config - Terms configuration options
 * @returns Terms state and actions
 */
export const useTermsCheck = (config: TermsConfig = {}): TermsCheckResult => {
  // Validate and merge configuration
  const mergedConfig = useMemo(() => {
    // Only validate in development for performance
    if (process.env.NODE_ENV === 'development' && !validateTermsConfig(config)) {
      console.warn('Invalid terms configuration provided, using defaults');
    }
    return mergeTermsConfig(config);
  }, [config]);

  // Get terms status from API
  const { 
    data: termsStatus, 
    isLoading, 
    refetch: refetchTermsStatus 
  } = useGetOwnerTermsStatus();

  // Modal state management
  const { showModal, openModal, closeModal, forceCloseModal } = useTermsModal(mergedConfig);

  // Terms acceptance logic
  const { acceptTerms, isAccepting } = useTermsAcceptance(
    mergedConfig,
    termsStatus ?? null,
    forceCloseModal
  );

  // Auto-check terms on mount (if configured)
  useTermsAutoCheck(mergedConfig, termsStatus ?? null, isLoading, showModal, openModal);

  // Manual check function
  const manualCheck = useCallback(() => {
    try {
      if (!termsStatus) {
        console.warn('Cannot check terms: no status available');
        return;
      }

      if (shouldShowTermsModal(termsStatus, mergedConfig.triggerConditions)) {
        openModal(termsStatus);
      }
    } catch (error) {
      handleTermsError(error, 'manualCheck');
    }
  }, [termsStatus, mergedConfig.triggerConditions, openModal]);

  // Determine which check function to use
  const checkTerms = mergedConfig.checkOn === 'manual' ? manualCheck : refetchTermsStatus;

  return {
    // State
    termsStatus: termsStatus ?? null,
    isLoading,
    isAccepting,
    showModal,
    config: mergedConfig,
    
    // Actions
    checkTerms,
    acceptTerms,
    dismissModal: closeModal,
  };
};
