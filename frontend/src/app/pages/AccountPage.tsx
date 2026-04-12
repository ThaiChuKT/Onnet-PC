import { Outlet, Link, useLocation } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { User, Lock, History, Wallet, ReceiptText } from "lucide-react";

const menuItems = [
  {
    path: "/account",
    label: "Profile",
    icon: User,
  },
  {
    path: "/account/change-password",
    label: "Password",
    icon: Lock,
  },
  {
    path: "/account/top-up",
    label: "Top up",
    icon: Wallet,
  },
  {
    path: "/account/top-up-bills",
    label: "Top-up bills",
    icon: ReceiptText,
  },
  {
    path: "/account/rental-history",
    label: "My bookings",
    icon: History,
  },
];

export function AccountPage() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="bg-card border border-border rounded-lg p-4">
                <h2 className="text-lg font-bold mb-4 px-2">Account</h2>
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-primary to-accent text-white"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <div className="min-h-[600px]">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
