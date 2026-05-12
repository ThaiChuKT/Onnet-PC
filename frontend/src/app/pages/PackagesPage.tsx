import { Header } from "../components/Header";
import { Packages } from "../components/Packages";
import { Footer } from "../components/Footer";

export function PackagesPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        <Packages />
      </main>
      <Footer />
    </div>
  );
}
