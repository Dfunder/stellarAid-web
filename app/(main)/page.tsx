import { WhyChooseUs } from "./components/WhyChooseUs";
import Footer from "./components/Footer";
import HeroPage from "./components/HeroPage";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f0f4fa] flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <HeroPage />
      <section>
        <WhyChooseUs />
      </section>
      <Footer />
    </div>
  );
}
