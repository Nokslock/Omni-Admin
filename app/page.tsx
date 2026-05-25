import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Stats } from "./components/Stats";
import { Features } from "./components/Features";
import { AppShowcase } from "./components/AppShowcase";
import { Lifecycle } from "./components/Lifecycle";
import { Coverage } from "./components/Coverage";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Features />
        <AppShowcase />
        <Lifecycle />
        <Coverage />
      </main>
      <Footer />
    </>
  );
}
