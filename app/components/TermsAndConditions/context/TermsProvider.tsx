import { createContext, useContext } from 'react';
import type { TermsCheckResult } from '../types/termsTypes';

export interface TermsContextValue extends TermsCheckResult {}

const TermsContext = createContext<TermsContextValue | null>(null);

export const useTerms = () => {
  const context = useContext(TermsContext);
  if (!context) {
    throw new Error('useTerms must be used within a TermsProvider');
  }
  return context;
};

export { TermsContext };
