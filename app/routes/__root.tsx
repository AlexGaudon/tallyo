import type { QueryClient } from "@tanstack/react-query";
import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Body, Head, Html, Meta, Scripts } from "@tanstack/start";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import Navbar from "~/components/NavBar";
import icon from "~/favicon.ico?url";
import { getAuth } from "~/server/functions";
import appCss from "~/styles/app.css?url";

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
  }
);

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <Head>
        <Meta />
      </Head>
      <Body>
        <Navbar />
        {children}
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
                      localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
                    )`,
          }}
        ></script>
      </Body>
    </Html>
  );
}
