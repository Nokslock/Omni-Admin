import { siteConfig, absoluteUrl } from "../lib/site";

/**
 * Structured data for the landing page. Three blobs, one <script> tag each,
 * so a crawler that fails to parse one still picks up the others.
 *
 * - Organization → who runs the site
 * - WebSite → site identity + sitelinks searchbox hint
 * - MobileApplication → the Kasala app (the real product)
 */
export function HomeJsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.legalName,
    url: siteConfig.url,
    logo: absoluteUrl("/logo.svg"),
    sameAs: [] as string[],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en-NG",
    publisher: {
      "@type": "Organization",
      name: siteConfig.legalName,
      url: siteConfig.url,
    },
  };

  const application = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    applicationCategory: "SafetyApplication",
    operatingSystem: "Android, iOS",
    url: siteConfig.url,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "NGN",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // The string is server-rendered and trusted — there's no user input here.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(application) }}
      />
    </>
  );
}
