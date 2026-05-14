import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Features } from "../components/Features";
import { Footer } from "../components/Footer";
import { HowToStart } from "../components/HowToStart";
import { Packages } from "../components/Packages";

export function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <Packages />
        <HowToStart />
      </main>
      <Footer />
    </div>
  );
}
