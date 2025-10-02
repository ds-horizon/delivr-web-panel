import { useCallback } from 'react';
import type { OwnerTermsStatusResponse } from '~/.server/services/Codepush/types';
import type { TermsConfig } from '../types/termsTypes';
import { createUpdatedTermsStatus, handleTermsError } from '../utils/termsUtils';
import { useAcceptTerms } from './useAcceptTerms';

/**
 * Hook for handling terms acceptance logic
 */
export const useTermsAcceptance = (
  config: Required<TermsConfig>,
  termsStatus: OwnerTermsStatusResponse | null,
  onSuccess: () => void
) => {
  const { mutate: acceptTermsMutation, isLoading: isAccepting } = useAcceptTerms();

  const acceptTerms = useCallback(async (version: string): Promise<void> => {
    // Validate input
    if (!version || typeof version !== 'string') {
      const error = new Error('Terms version is required and must be a string');
      handleTermsError(error, 'acceptTerms.validation');
      throw error;
    }

    return new Promise<void>((resolve, reject) => {
      acceptTermsMutation(
        { termsVersion: version },
        {
          onSuccess: (data) => {
            try {
              onSuccess();
              
              // Create updated status and call callback
              if (termsStatus) {
                const updatedStatus = createUpdatedTermsStatus(
                  termsStatus,
                  version,
                  data.termsAcceptance.acceptedTime
                );
                config.onTermsAccepted?.(updatedStatus);
              } else {
                console.warn('No terms status available for callback');
              }
              
              resolve();
            } catch (error) {
              handleTermsError(error, 'acceptTerms.onSuccess');
              reject(error);
            }
          },
          onError: (error) => {
            handleTermsError(error, 'acceptTerms.mutation');
            reject(error);
          },
        }
      );
    });
  }, [acceptTermsMutation, termsStatus, config, onSuccess]);

  return {
    acceptTerms,
    isAccepting,
  };
};
