import { WhyChooseUs } from "./components/WhyChooseUs";
import Footer from "./components/Footer";
import HeroPage from "./components/HeroPage";
import MakeAnImpact from "./components/MakeAnImpact";
import FeaturedProjects from "./components/FeaturedProjects";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f0f4fa] flex flex-col">
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
