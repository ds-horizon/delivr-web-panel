/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from "@remix-run/react";
import { startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

// Wait for the browser to be idle before hydrating
// This prevents hydration mismatches and ensures CSS is loaded
if (typeof window.requestIdleCallback === 'function') {
  window.requestIdleCallback(() => {
    startTransition(() => {
      hydrateRoot(document, <RemixBrowser />);
    });
  });
} else {
  // Fallback for browsers that don't support requestIdleCallback
  setTimeout(() => {
    startTransition(() => {
      hydrateRoot(document, <RemixBrowser />);
    });
  }, 1);
}
