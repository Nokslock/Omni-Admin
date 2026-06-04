import type { MetadataRoute } from "next";
import { siteConfig } from "./lib/site";

/**
 * Web App Manifest — makes the landing site installable on mobile and gives
 * the right brand colours when added to a homescreen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: siteConfig.themeColorDark,
    theme_color: siteConfig.themeColorDark,
    categories: ["safety", "news", "social", "utilities"],
    lang: "en",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
