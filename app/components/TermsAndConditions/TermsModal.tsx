import { Button, Modal, ScrollArea, Stack, Text } from '@mantine/core';
import { useCallback } from 'react';
import type { OwnerTermsStatusResponse } from '~/.server/services/Codepush/types';
import type { TermsConfig } from './types/termsTypes';

interface TermsModalProps {
  isOpen: boolean;
  termsStatus: OwnerTermsStatusResponse | null;
  config: TermsConfig;
  isAccepting: boolean;
  onAccept: (version: string) => Promise<void>;
  onClose: () => void;
}

export function TermsModal({ 
  isOpen, 
  termsStatus, 
  config, 
  isAccepting,
  onAccept, 
  onClose 
}: TermsModalProps) {
  const handleAccept = useCallback(async () => {
    if (!termsStatus?.currentRequiredVersion) {
      console.error('Cannot accept terms: no version available');
      return;
    }

    try {
      await onAccept(termsStatus.currentRequiredVersion);
    } catch (error) {
      console.error('Failed to accept terms:', error);
      // Could show a notification here in the future
      // For now, we don't close the modal on error to allow retry
    }
  }, [onAccept, termsStatus]);

  if (!termsStatus) return null;

  return (
    <Modal
      opened={isOpen}
      onClose={config.modalConfig?.closeable ? onClose : () => {}}
      title="Terms and Conditions"
      size="lg"
      closeOnClickOutside={config.modalConfig?.closeable ?? false}
      closeOnEscape={config.modalConfig?.closeable ?? false}
      withCloseButton={config.modalConfig?.closeable ?? false}
    >
      <Stack>
        {config.modalConfig?.customContent || (
          <ScrollArea h={400} type="scroll">
            <Text size="sm">
              <h2>Terms and Conditions</h2>
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              
              <h3>1. Acceptance of Terms</h3>
              <p>By accessing and using the CodePush service, you agree to be bound by these Terms and Conditions.</p>
              
              <h3>2. Use of Service</h3>
              <p>The CodePush service is provided for managing and deploying mobile application updates. You agree to use the service only for its intended purpose and in compliance with all applicable laws and regulations.</p>
              
              <h3>3. User Responsibilities</h3>
              <p>As a user of the CodePush service, you are responsible for:</p>
              <ul>
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring your use of the service does not violate any third-party rights</li>
              </ul>
              
              <h3>4. Service Availability</h3>
              <p>While we strive to maintain high availability, we do not guarantee uninterrupted access to the service. We reserve the right to modify, suspend, or discontinue the service at any time.</p>
              
              <h3>5. Data Privacy</h3>
              <p>We collect and process user data in accordance with our Privacy Policy. By using the service, you consent to such processing and warrant that all data provided by you is accurate.</p>
              
              <h3>6. Intellectual Property</h3>
              <p>All intellectual property rights in the service and its content remain with us or our licensors. You may not use our intellectual property without our prior written consent.</p>
              
              <h3>7. Limitation of Liability</h3>
              <p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
              
              <h3>8. Changes to Terms</h3>
              <p>We reserve the right to modify these terms at any time. Continued use of the service after such modifications constitutes acceptance of the new terms.</p>
              
              <h3>9. Governing Law</h3>
              <p>These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate.</p>
              
              <h3>10. Contact Information</h3>
              <p>For any questions about these terms, please contact our support team.</p>
            </Text>
          </ScrollArea>
        )}
        
        <Button
          fullWidth
          onClick={handleAccept}
          loading={isAccepting}
        >
          Accept Terms and Conditions (v{termsStatus.currentRequiredVersion})
        </Button>
      </Stack>
    </Modal>
  );
}
