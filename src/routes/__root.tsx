import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { CursorGlow } from "@/components/CursorGlow";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";

import appCss from "../styles.css?url";

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230a0f1a'/%3E%3Ctext x='16' y='22' text-anchor='middle' font-family='Georgia, serif' font-size='14' font-weight='700' fill='%2300e5ff'%3EZG%3C/text%3E%3C/svg%3E";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-cyan">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Looks like this skill gap doesn't exist yet.
        </p>
        <a href="/" className="inline-flex items-center justify-center rounded-md gradient-cyan px-4 py-2 mt-6 text-sm font-medium text-primary-foreground">
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0a0f1a" },
      { title: "ZeroGap AI — Stop Getting Ghosted by Recruiters" },
      { name: "description", content: "AI-powered resume analysis for Indian students. Check your ATS score, find skill gaps, and get market-ready in 48 hours. Free for college emails." },
      { name: "keywords", content: "ATS score checker India, resume analyzer for students, internship help India, college placement preparation" },
      { name: "author", content: "ZeroGap AI" },
      { property: "og:title", content: "ZeroGap AI — Stop Getting Ghosted by Recruiters" },
      { property: "og:description", content: "AI-powered resume analysis for Indian students. Check your ATS score, find skill gaps, and get market-ready in 48 hours. Free for college emails." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ZeroGap AI" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ZeroGap AI — Stop Getting Ghosted by Recruiters" },
      { name: "twitter:description", content: "AI-powered resume analysis for Indian students. Check your ATS score, find skill gaps, and get market-ready in 48 hours. Free for college emails." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fd8e5ec5-4ab4-4d6b-8ed8-aafe67ce9088/id-preview-18132755--ffbf86f8-5303-4599-91ba-58bbcafe6844.lovable.app-1777030513491.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fd8e5ec5-4ab4-4d6b-8ed8-aafe67ce9088/id-preview-18132755--ffbf86f8-5303-4599-91ba-58bbcafe6844.lovable.app-1777030513491.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: FAVICON },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: () => (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  ),
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <CursorGlow />
        {children}
        <ScrollToTop />
        <Toaster theme="dark" richColors position="top-right" />
        <Scripts />
      </body>
    </html>
  );
}
