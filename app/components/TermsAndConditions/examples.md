# Terms and Conditions - Usage Examples

## 1. Dashboard (Current Implementation)
```tsx
// Auto-check on mount, blocking modal for owners only
<TermsGuard
  config={{
    checkOn: 'mount',
    triggerConditions: {
      requireOwner: true,
      requireAcceptance: true,
      requireCurrentVersion: true,
    },
    modalConfig: {
      closeable: false,
      blockingMode: true,
    },
  }}
>
  <Outlet />
</TermsGuard>
```

## 2. App Creation Page
```tsx
// Check before allowing app creation
function CreateAppPage() {
  const { checkTerms, termsStatus } = useTermsCheck({
    checkOn: 'manual',
    triggerConditions: {
      requireOwner: true,
      requireCurrentVersion: true,
    },
  });

  const handleCreateApp = async () => {
    await checkTerms();
    if (termsStatus?.termsAccepted && termsStatus?.isCurrentVersion) {
      // Proceed with app creation
    }
  };

  return <CreateAppForm onSubmit={handleCreateApp} />;
}
```

## 3. Settings Page with Custom Content
```tsx
<TermsGuard
  config={{
    checkOn: 'mount',
    modalConfig: {
      closeable: true,
      customContent: (
        <div>
          <h2>Updated Privacy Policy</h2>
          <p>We've updated our privacy policy. Please review and accept.</p>
          {/* Custom content here */}
        </div>
      ),
    },
    onTermsAccepted: () => {
      showNotification('Privacy policy accepted!');
    },
  }}
>
  <SettingsContent />
</TermsGuard>
```

## 4. Deployment Page - Custom Conditions
```tsx
<TermsGuard
  config={{
    checkOn: 'route-change',
    triggerConditions: {
      customCondition: (status) => {
        // Only show for users with more than 5 apps
        return status.isOwner && status.ownerAppCount > 5 && !status.termsAccepted;
      },
    },
    modalConfig: {
      closeable: true,
    },
  }}
>
  <DeploymentContent />
</TermsGuard>
```

## 5. Standalone Hook Usage
```tsx
function CustomComponent() {
  const {
    termsStatus,
    showModal,
    acceptTerms,
    dismissModal,
    checkTerms,
  } = useTermsCheck({
    checkOn: 'manual',
    triggerConditions: {
      requireOwner: true,
    },
    onTermsRequired: (status) => {
      console.log('Terms required for user:', status.accountId);
    },
  });

  return (
    <div>
      <Button onClick={checkTerms}>Check Terms Status</Button>
      {showModal && (
        <TermsModal
          isOpen={showModal}
          termsStatus={termsStatus}
          onAccept={acceptTerms}
          onClose={dismissModal}
        />
      )}
    </div>
  );
}
```

## 6. Different Trigger Scenarios

### A. Only for New Users
```tsx
const config = {
  triggerConditions: {
    customCondition: (status) => {
      const accountAge = Date.now() - new Date(status.accountId).getTime();
      const isNewUser = accountAge < 30 * 24 * 60 * 60 * 1000; // 30 days
      return isNewUser && !status.termsAccepted;
    },
  },
};
```

### B. Version-Specific Terms
```tsx
const config = {
  triggerConditions: {
    customCondition: (status) => {
      const requiredVersions = ['v2.0', 'v2.1'];
      return status.isOwner && requiredVersions.includes(status.currentRequiredVersion) && !status.isCurrentVersion;
    },
  },
};
```

### C. Feature-Specific Terms
```tsx
const config = {
  triggerConditions: {
    customCondition: (status) => {
      // Check if user is accessing premium features
      const hasPremiumAccess = checkPremiumAccess(status.accountId);
      return hasPremiumAccess && !status.termsAccepted;
    },
  },
  modalConfig: {
    customContent: <PremiumTermsContent />,
  },
};
```

## Benefits of This Architecture:

1. **Reusable**: Use anywhere in the app with different configurations
2. **Configurable**: Customize behavior, triggers, and UI per use case
3. **Separation of Concerns**: Business logic separate from UI components
4. **Type Safe**: Full TypeScript support with proper interfaces
5. **Testable**: Each part can be tested independently
6. **Maintainable**: Changes to terms logic don't affect multiple components
