import "@mantine/core/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/notifications/styles.css";

import { QueryClient, QueryClientProvider } from "react-query";
import { useState } from "react";

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import tailwindStyles from "./tailwind.css?url";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { mantineTheme } from "~/theme";

export const links: LinksFunction = () => [
  // Tailwind CSS - loaded via links() for proper SSR hydration
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Poppins:wght@300;400;500;600;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance for each request to avoid state leaking
  // Using useState with lazy initializer ensures it's created once per component instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <html lang="en" data-mantine-color-scheme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* Force light mode to prevent CSS issues in Cypress tests */}
        {/* Remove forceColorScheme if you want to support theme switching */}
        <ColorSchemeScript defaultColorScheme="light" forceColorScheme="light" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <MantineProvider theme={mantineTheme} defaultColorScheme="light" forceColorScheme="light">
            <Notifications />
            {children}
          </MantineProvider>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
