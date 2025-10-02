import type { ReactNode } from 'react';
import { useTermsCheck } from './hooks/useTermsCheck';
import { TermsModal } from './TermsModal';
import type { TermsConfig } from './types/termsTypes';

interface TermsGuardProps {
  children: ReactNode;
  config?: TermsConfig;
}

/**
 * TermsGuard - A wrapper component that automatically handles terms checking and modal display
 * 
 * Usage:
 * <TermsGuard config={{ checkOn: 'mount', triggerConditions: { requireOwner: true } }}>
 *   <YourComponent />
 * </TermsGuard>
 */
export function TermsGuard({ children, config }: TermsGuardProps) {
  const {
    termsStatus,
    isAccepting,
    showModal,
    config: resolvedConfig,
    acceptTerms,
    dismissModal,
  } = useTermsCheck(config);

  return (
    <>
      {children}
      <TermsModal
        isOpen={showModal}
        termsStatus={termsStatus}
        config={resolvedConfig}
        isAccepting={isAccepting}
        onAccept={acceptTerms}
        onClose={dismissModal}
      />
    </>
  );
}
