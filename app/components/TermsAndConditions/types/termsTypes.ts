import type { ReactNode } from 'react';
import type { OwnerTermsStatusResponse } from '~/.server/services/Codepush/types';

// Configuration types
export type TermsCheckTrigger = 'mount' | 'manual' | 'route-change';

export interface TermsTriggerConditions {
  requireOwner?: boolean;
  requireAcceptance?: boolean;
  requireCurrentVersion?: boolean;
  customCondition?: (status: OwnerTermsStatusResponse) => boolean;
}

export interface TermsModalConfig {
  closeable?: boolean;
  blockingMode?: boolean;
  customContent?: ReactNode;
}

export interface TermsConfig {
  checkOn?: TermsCheckTrigger;
  triggerConditions?: TermsTriggerConditions;
  modalConfig?: TermsModalConfig;
  onTermsRequired?: (status: OwnerTermsStatusResponse) => void;
  onTermsAccepted?: (status: OwnerTermsStatusResponse) => void;
  onTermsSkipped?: () => void;
}

// Hook return types
export interface TermsCheckState {
  termsStatus: OwnerTermsStatusResponse | null;
  isLoading: boolean;
  isAccepting: boolean;
  showModal: boolean;
  config: Required<TermsConfig>;
}

export interface TermsCheckActions {
  checkTerms: () => void;
  acceptTerms: (version: string) => Promise<void>;
  dismissModal: () => void;
}

export type TermsCheckResult = TermsCheckState & TermsCheckActions;

// Utility types
export type TermsConditionChecker = (
  status: OwnerTermsStatusResponse,
  conditions: TermsTriggerConditions
) => boolean;

export type TermsEventHandler = (status: OwnerTermsStatusResponse) => void;

// Error types
export interface TermsError extends Error {
  code?: string;
  details?: unknown;
}
