import { Button, Flex, Modal, ScrollArea, Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import { useSimpleTerms } from './hooks/useSimpleTerms';

interface SimpleTermsGuardProps {
  children: ReactNode;
}

export function SimpleTermsGuard({ children }: SimpleTermsGuardProps) {
  const { 
    showModal, 
    termsStatus, 
    isAccepting, 
    acceptTerms 
  } = useSimpleTerms();

  return (
    <>
      {children}
      
      {/* <Modal
        opened={showModal}
        onClose={() => {}} // Can't close manually - must accept
        title="Terms and Conditions"
        size="lg"
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
      >
        <Stack>
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
          
          <Button
            fullWidth
            onClick={acceptTerms}
            loading={isAccepting}
          >
            Accept Terms and Conditions {termsStatus?.currentRequiredVersion && `(v${termsStatus.currentRequiredVersion})`}
          </Button>
        </Stack>
      </Modal> */}




      <Modal
      opened={showModal}
      onClose={() => {}}
      size="lg"
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
      padding={0}
    >
      <Stack gap={0}>
        {/* Custom Header */}
        <Flex 
          justify="space-between" 
          align="center" 
          w="100%" 
          p="md" 
        >
          <Text size="lg" fw={600}>Delivr Acceptable Use Policy</Text>
          <Text size="sm">Last updated: 04/10/2025</Text>
        </Flex>
        
        {/* Content */}
        <div style={{ padding: '0 var(--mantine-spacing-md) var(--mantine-spacing-md) var(--mantine-spacing-md)' }}>
          <ScrollArea h={400} type="scroll">
            <Text size="sm">
              
              <h3>1. General Provisions</h3>
              
              <h4>1.1 Purpose and Scope</h4>
              <p>This Acceptable Use Policy (AUP) outlines rules and restrictions governing your access to and use of the Platform and Services. This AUP is an addendum to, and incorporated by reference into, your primary agreement with us (the Terms of Service). Unless otherwise defined here, capitalized terms have the meanings set forth in the Terms of Service. In the event of any conflict between this AUP and the Terms of Service, the Terms of Service will govern.</p>
              
              <h4>1.2 Lawful Use and Compliance</h4>
              <p>You must use the Platform and Services only for purposes that are lawful and permitted under all applicable local, state, national, and international laws and regulations. You may not use the Platform or Services to engage in any activity that is fraudulent, illegal, or has an unlawful effect or purpose.</p>
              
              <h3>2. Prohibited Uses for Customers</h3>
              <p>The following actions are strictly prohibited in connection with your use of the Platform and Services.</p>
              
              <h4>2.1 Security and Integrity</h4>
              <p>You must not compromise the security or operation of the Platform or Services. Specifically, you may not:</p>
              <ul>
                <li>Interfere with, damage, or disrupt the Platform, Services, or any associated hardware, software, or networks.</li>
                <li>Attempt to gain <strong>unauthorized access</strong> to the Platform, Services, or related systems, or assist others in doing so.</li>
                <li>Bypass or attempt to bypass any security measures, authentication systems, or access controls.</li>
                <li>Conduct any form of security testing (e.g., penetration tests, vulnerability scans) on the Platform or Services without our explicit, prior written consent.</li>
                <li>Introduce or transmit any <strong>malicious code</strong>, including viruses, Trojan horses, worms, or other harmful or destructive elements.</li>
              </ul>
              
              <h4>2.2 Resource Misuse and Automation</h4>
              <p>You may not use the Platform or Services for activities that consume excessive, disproportionate, or unintended system resources. Prohibited activities include, but aren't limited to:</p>
              <ul>
                <li>Cryptocurrency mining or other computationally-intensive operations unrelated to the core function of the Services.</li>
                <li>Executing Denial-of-Service (DoS) or Distributed Denial-of-Service (DDoS) attacks.</li>
                <li>Accessing or searching the Platform or Services through automated means such as web scraping, crawling, or indexing, except through our officially supported interfaces.</li>
                <li>Using automated tools for brute-force login attempts or account manipulation.</li>
              </ul>
              
              <h4>2.3 Intellectual Property and System Manipulation</h4>
              <p>You may not violate our intellectual property rights or attempt to modify the underlying technology. Specifically, you may not:</p>
              <ul>
                <li>Copy, reproduce, modify, create derivative works from, or distribute any part of the Platform or Services, including the visual appearance, underlying code, or content, except as expressly permitted by the Terms of Service.</li>
                <li>Reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code, structure, or organization of the Platform or Services, unless and only to the extent such activity is expressly permitted by non-waivable applicable law.</li>
                <li>Remove, alter, or obscure any proprietary notices, branding, or attribution markings.</li>
              </ul>
              
              <h4>2.4 Competitive and Commercial Restrictions</h4>
              <p>You may not use the Platform or Services to harm our business interests. You may not:</p>
              <ul>
                <li>Access or use the Platform or Services for the purpose of developing, creating, or facilitating a competing product, service, or platform.</li>
                <li>Utilize the Platform or Services for any form of general commercial distribution or public use outside of internal business operations or approved testing (e.g., Quality Assurance), unless explicitly authorized by a separate agreement.</li>
              </ul>
              
              <h4>2.5 Unsolicited Communications</h4>
              <p>You are prohibited from using the Platform or Services to transmit spam, including unsolicited advertising, promotional materials, or any similar unauthorized solicitations.</p>
              
              <h3>3. Content and Conduct Standards</h3>
              
              <h4>3.1 Application of Standards</h4>
              <p>These standards apply to all information, data, materials, or contributions (Content) that you send, upload, download, or otherwise transmit through the Platform or Services. Your Content must comply with both the spirit and the letter of this AUP.</p>
              
              <h4>3.2 Prohibited Content and Use</h4>
              <p>You must not upload, share, or generate any Content, or use the Platform or Services in a way, that:</p>
              <ul>
                <li>Is defamatory, obscene, offensive, hateful, or inflammatory.</li>
                <li>Promotes sexually explicit material, violence, or discrimination against any group based on characteristics like race, sex, religion, nationality, disability, sexual orientation, or age.</li>
                <li>Infringes upon the intellectual property rights, privacy rights, or any other legal rights of others.</li>
                <li>Is designed to deceive or mislead, or involves impersonating another person or misrepresenting your affiliation with any person or entity.</li>
                <li>Breaches any legal duty, such as a duty of confidentiality.</li>
                <li>Promotes or facilitates any illegal activity.</li>
                <li>Involves harassment, threats, or the invasion of another person's privacy.</li>
                <li>Is intended to harm minors or any individual.</li>
                <li>Suggests our endorsement or affiliation when none exists.</li>
              </ul>
              
              <h4>3.3 Third-Party Compliance</h4>
              <p>If your use of the Services involves developing an application for a third-party application store (e.g., Apple App Store, Google Play Store), that application must adhere to all current submission guidelines and policies for the respective store.</p>
              
              <h4>3.4 Customer Responsibility</h4>
              <p>You are responsible for ensuring that any third party you authorize or enable to use the Platform or Services also complies with all provisions of this AUP.</p>
              
              <h3>4. Policy for Website Visitors</h3>
              <p>Any individual who accesses the Platform or Services without a formal Customer account (website visitors) is still obligated to comply with the relevant restrictions and prohibitions outlined in this AUP, particularly those in Sections 1, 2.1, 2.2, 2.3, and 3.</p>
              
              <h3>5. Revisions to this AUP</h3>
              <p>We reserve the right to modify or update this AUP at any time. We will post the revised AUP on this page, and we encourage Customers and website visitors to review this document periodically for changes. Your continued use of the Platform or Services after any changes are posted constitutes your acceptance of the new AUP.</p>
              
            </Text>
          </ScrollArea>
        
          <Button
            fullWidth
            onClick={acceptTerms}
            loading={isAccepting}
            mt="md"
          >
            Accept Acceptable Use Policy {termsStatus?.currentRequiredVersion && `(${termsStatus.currentRequiredVersion})`}
          </Button>
        </div>
      </Stack>
    </Modal>
    </>
  );
}
