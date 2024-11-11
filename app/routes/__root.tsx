import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Body, Head, Html, Meta, Scripts } from "@tanstack/start";
import React from "react";

import Navbar from "@/components/NavBar";
import { ThemeProvider } from "@/components/theme-provider";
import icon from "@/favicon.ico?url";
import { getAuth } from "@/server/functions";
import appCss from "@/styles/app.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    beforeLoad: async () => {
      const auth = await getAuth();
      return { auth };
    },
    component: RootComponent,
    meta: () => [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Tallyo | Financial Insights",
      },
    ],
    links: () => [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        type: "image/x-icon",
        // href: "/images/favicon.ico",
        href: icon,
      },
    ],
  },
);

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      );

const TanStackQueryDevTools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/react-query-devtools").then((res) => ({
          default: res.ReactQueryDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      );

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <Head>
        <Meta />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <Body>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Navbar />
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
        {/* eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml */}
        <script
          id="theme"
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.toggle(
                      'dark',
                      localStorage['vite-ui-theme'] === 'dark' || (!('vite-ui-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
                    )`,
          }}
        ></script>
      </Body>
    </Html>
  );
}
