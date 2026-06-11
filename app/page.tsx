import type { Metadata } from "next";
import { siteConfig, absoluteUrl } from "./lib/site";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Stats } from "./components/Stats";
import { Features } from "./components/Features";
import { AppShowcase } from "./components/AppShowcase";
import { IncidentTypes } from "./components/IncidentTypes";
import { Lifecycle } from "./components/Lifecycle";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";
import { HomeJsonLd } from "./components/JsonLd";

export const metadata: Metadata = {
  // Override the layout template — landing page uses its full title verbatim.
  title: {
    absolute: `${siteConfig.name} — ${siteConfig.tagline}`,
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    url: absoluteUrl("/"),
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Features />
        <AppShowcase />
        <IncidentTypes />
        <Lifecycle />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
