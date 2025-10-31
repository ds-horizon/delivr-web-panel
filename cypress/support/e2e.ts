// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Import Cypress Testing Library
import '@testing-library/cypress/add-commands';

// Import file upload plugin
import 'cypress-file-upload';

// Import real events plugin
import 'cypress-real-events';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Prevent TypeScript errors
/// <reference types="cypress" />

// Global before hook
beforeEach(() => {
  // Clear cookies and local storage before each test
  cy.clearCookies();
  cy.clearLocalStorage();

  // Set viewport to match your app design
  cy.viewport(1440, 900);
  
  // Optionally preserve session if needed
  // Cypress.Cookies.preserveOnce('session_id', 'remember_token');
});


// ✅ Handle common uncaught exceptions gracefully
Cypress.on('uncaught:exception', (err) => {
  console.log('Suppressed exception:', err.message);

  const ignoredErrors = [
    'ResizeObserver',
    'Hydration failed',
    'hydration',
    'hydrating',
    'Minified React error',
    'Suspense boundary',
    'does not match what was rendered on the server',
    'Text content did not match',
    'Prop `className` did not match',
    'class names did not match',
    'Expected server HTML',
    'Mantine',
    'emotion',
    'google',
    'redirect'
  ];

  if (ignoredErrors.some(msg => err.message.includes(msg))) {
    return false; // prevent test failure
  }

  return true;
});

// ✅ Suppress hydration warnings in console (Cypress only)
Cypress.on('window:before:load', (win) => {
  const originalConsoleError = win.console.error;
  const originalConsoleWarn = win.console.warn;
  
  // Override console.error to suppress hydration warnings
  win.console.error = (...args) => {
    const message = args.join(' ');
    
    // Suppress hydration-related warnings
    if (message.includes('Hydration') ||
        message.includes('hydration') ||
        message.includes('Text content did not match') ||
        message.includes('Prop') && message.includes('did not match') ||
        message.includes('Warning: Expected server HTML') ||
        message.includes('class names did not match')) {
      return; // Don't log these warnings
    }
    
    // Log other errors normally
    originalConsoleError.apply(win.console, args);
  };
  
  // Override console.warn to suppress style warnings
  win.console.warn = (...args) => {
    const message = args.join(' ');
    
    if (message.includes('Mantine') || 
        message.includes('emotion') ||
        message.includes('style') && message.includes('did not match')) {
      return; // Don't log these warnings
    }
    
    originalConsoleWarn.apply(win.console, args);
  };
});

