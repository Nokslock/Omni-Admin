/**
 * Single source of truth for site-wide URLs, brand strings, and SEO defaults.
 * Keep this small — pages import only what they need to keep tree-shake clean.
 */

const FALLBACK_URL = "https://kasalaalert.com";

export const siteConfig = {
  name: "Kasala",
  shortName: "Kasala",
  legalName: "Kasala",
  tagline: "Immediate community safety alerts",
  description:
    "Spot, report, and monitor critical incidents in your area in real time. Powering a safer community together.",
  // NEXT_PUBLIC_SITE_URL lets staging/preview deployments override the canonical
  // origin without changing code (e.g. https://staging.kasalaalert.com).
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || FALLBACK_URL,
  ogImage: "/opengraph-image",
  twitter: "@kasala_ng",
  themeColorDark: "#0f1115",
  themeColorLight: "#ffffff",
  locale: "en_NG",
  keywords: [
    "community safety alerts",
    "emergency notifications",
    "incident reporting",
    "Nigeria safety app",
    "neighborhood watch",
    "real-time alerts",
    "Kasala",
  ],
} as const;

export type SiteConfig = typeof siteConfig;

/** Build an absolute URL for a path on this site, normalising slashes. */
export function absoluteUrl(path: string = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${clean}`;
}
