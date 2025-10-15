/**
 * Centralized Color System for the Application
 * 
 * RULES:
 * 1. All colors used in the app should be defined here
 * 2. Categories: backgrounds, text, borders, brand
 * 3. Use these constants throughout the app for consistency
 */

/**
 * BRAND COLORS
 * Primary brand colors used across the application
 */
export const brand = {
  primary: "#6366f1",       // Primary brand color (indigo) - used in CTAs, selections, icons
  secondary: "#8b5cf6",     // Secondary brand color (purple) - used in gradients
  primaryDark: "#4f46e5",   // Darker brand color - used in text, hover states
  light: "#eef2ff",         // Light brand color - used in active/selected backgrounds
  gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", // Used in headers, selections, buttons
} as const;

export const theme = {
  /**
   * BACKGROUNDS
   * Used for: page backgrounds, card backgrounds, sidebar, hover states, etc.
   */
  backgrounds: {
    primary: "#ffffff",       // Card backgrounds - App cards, Org cards (white)
    secondary: "#f8f9fa",     // Page/container backgrounds (subtle light gray)
    tertiary: "#fafafa",      // Sidebar/panel backgrounds (very light gray)
    hover: "#f3f4f6",         // Hover state backgrounds
    active: "#eef2ff",        // Active state backgrounds (light indigo) - same as brand.light
    subtle: "#f9fafb",        // Subtle backgrounds for card sections
  },

  /**
   * TEXT
   * Used for: all text content, labels, icons, etc.
   */
  text: {
    primary: "#1f2937",       // Main text (dark gray)
    secondary: "#374151",     // Secondary text (medium dark gray)
    tertiary: "#6b7280",      // Tertiary text, labels (medium gray)
    disabled: "#9ca3af",      // Disabled text (light gray)
    brand: "#6366f1",         // Brand color text (indigo) - same as brand.primary
    brandDark: "#4f46e5",     // Darker brand color (darker indigo) - same as brand.primaryDark
    white: "#ffffff",         // White text for dark backgrounds
  },

  /**
   * BORDERS
   * Used for: card borders, dividers, input borders, etc.
   */
  borders: {
    primary: "#e5e7eb",       // Main border color (light gray)
    secondary: "#e9ecef",     // Secondary border (very light gray)
    light: "#f3f4f6",         // Lighter border
    dark: "#d1d5db",          // Darker border
    brand: "#6366f1",         // Brand color border (indigo) - same as brand.primary
    brandLight: "#c7d2fe",    // Light brand border
  },
} as const;

/**
 * BUTTON GRADIENTS
 * Gradients should ONLY be used for buttons
 * @deprecated Use brand.gradient instead
 */
export const buttonGradients = {
  primary: brand.gradient,
  // Add more button-specific gradients here if needed
} as const;

/**
 * SHADOWS
 * Pre-defined shadow styles for consistency
 */
export const shadows = {
  sm: "0 2px 8px rgba(0, 0, 0, 0.08)",
  md: "0 4px 16px rgba(99, 102, 241, 0.12)",
  lg: "0 8px 24px rgba(99, 102, 241, 0.15)",
  hover: "0 4px 16px rgba(99, 102, 241, 0.2)",
} as const;

// Export for convenience
export const { backgrounds, text, borders } = theme;

