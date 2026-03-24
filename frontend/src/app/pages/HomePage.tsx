import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Packages } from "../components/Packages";
import { Features } from "../components/Features";
import { Footer } from "../components/Footer";

export function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Packages />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
