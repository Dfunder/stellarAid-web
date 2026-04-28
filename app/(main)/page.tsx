import { Metadata } from 'next';
import { WhyChooseUs } from "./components/WhyChooseUs";
import Footer from "./components/Footer";
import HeroPage from "./components/HeroPage";
import MakeAnImpact from "./components/MakeAnImpact";
import FeaturedProjects from "./components/FeaturedProjects";

export const metadata: Metadata = {
  title: "Home",
  description: "Discover and support verified aid projects worldwide. Join our transparent blockchain-based platform for charitable giving that makes a real difference.",
  openGraph: {
    title: "Home | StellarAid",
    description: "Discover and support verified aid projects worldwide. Join our transparent blockchain-based platform for charitable giving that makes a real difference.",
    url: "/",
  },
  twitter: {
    title: "Home | StellarAid",
    description: "Discover and support verified aid projects worldwide. Join our transparent blockchain-based platform for charitable giving that makes a real difference.",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <HeroPage />
      <FeaturedProjects />
      <section>
        <WhyChooseUs />
      </section>
      {/* ── Make an Impact ───────────────────────────────────────────── */}
      <MakeAnImpact />
      <Footer />
    </div>
  );
}
