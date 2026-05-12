import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Features } from "../components/Features";
import { Footer } from "../components/Footer";
import { Packages } from "../components/Packages";
import { Button } from "../components/ui/button";
import { Link } from "react-router";

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
