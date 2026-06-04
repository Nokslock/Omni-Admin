import type { MetadataRoute } from "next";
import { siteConfig } from "./lib/site";

/**
 * Crawler policy. The admin dashboard and API endpoints contain authenticated
 * data and dynamic surfaces with no SEO value — keep them out of the index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/_next/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
