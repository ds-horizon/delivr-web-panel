import { useCallback, useState } from 'react';
import type { OwnerTermsStatusResponse } from '~/.server/services/Codepush/types';
import type { TermsConfig } from '../types/termsTypes';
import { handleTermsError } from '../utils/termsUtils';

/**
 * Hook for managing terms modal state and interactions
 */
export const useTermsModal = (config: Required<TermsConfig>) => {
  const [showModal, setShowModal] = useState(false);

  const openModal = useCallback((status: OwnerTermsStatusResponse) => {
    try {
      setShowModal(true);
      config.onTermsRequired?.(status);
    } catch (error) {
      handleTermsError(error, 'openModal');
    }
  }, [config]);

  const closeModal = useCallback(() => {
    try {
      if (config.modalConfig.closeable) {
        setShowModal(false);
        config.onTermsSkipped?.();
      }
    } catch (error) {
      handleTermsError(error, 'closeModal');
    }
  }, [config]);

  const forceCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return {
    showModal,
    openModal,
    closeModal,
    forceCloseModal,
  };
};
