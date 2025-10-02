import { useEffect } from 'react';
import type { OwnerTermsStatusResponse } from '~/.server/services/Codepush/types';
import type { TermsConfig } from '../types/termsTypes';
import { handleTermsError, shouldShowTermsModal } from '../utils/termsUtils';

/**
 * Hook for automatic terms checking based on configuration
 */
export const useTermsAutoCheck = (
  config: Required<TermsConfig>,
  termsStatus: OwnerTermsStatusResponse | null,
  isLoading: boolean,
  showModal: boolean,
  onTermsRequired: (status: OwnerTermsStatusResponse) => void
) => {
  useEffect(() => {
    try {
      // Only auto-check on mount
      if (config.checkOn !== 'mount') {
        return;
      }

      // Wait for data to load and ensure modal isn't already shown
      if (!termsStatus || isLoading || showModal) {
        return;
      }

      // Check if terms should be shown
      if (shouldShowTermsModal(termsStatus, config.triggerConditions)) {
        onTermsRequired(termsStatus);
      }
    } catch (error) {
      handleTermsError(error, 'autoCheck');
    }
  }, [config, termsStatus, isLoading, showModal, onTermsRequired]);
};
