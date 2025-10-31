import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    // Stable viewport for consistent rendering and hydration
    viewportWidth: 1440,
    viewportHeight: 900,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    env: {
      apiUrl: "http://localhost:3001/api/v1",
      codepushServer: "http://localhost:3001",
    },
    
    setupNodeEvents(on, config) {
      // Implement node event listeners here
      
      // Task for clearing database (optional)
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });

      return config;
    },
    
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    fixturesFolder: "cypress/fixtures",
  },
  
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    specPattern: "**/*.cy.{js,jsx,ts,tsx}",
  },
});





