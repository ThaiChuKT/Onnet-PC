import { Outlet, Link, useLocation } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Monitor, Users, TrendingUp, ShoppingCart, ReceiptText, Activity } from "lucide-react";

const menuItems = [
  {
    path: "/dashboard/computers",
    label: "Machines",
    icon: Monitor,
  },
  {
    path: "/dashboard/orders",
    label: "Orders",
    icon: ShoppingCart,
  },
  {
    path: "/dashboard/invoices",
    label: "Invoices",
    icon: ReceiptText,
  },
  {
    path: "/dashboard/accounts",
    label: "Accounts",
    icon: Users,
  },
  {
    path: "/dashboard/revenue",
    label: "Revenue",
    icon: TrendingUp,
  },
  {
    path: "/dashboard/sessions",
    label: "Sessions",
    icon: Activity,
  },
];

export function DashboardPage() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Admin
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {" "}dashboard
              </span>
            </h1>
            <p className="text-muted-foreground">
              Manage machines, bookings, users, and revenue
            </p>
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="bg-card border border-border rounded-lg p-4">
                <h2 className="text-lg font-bold mb-4 px-2">Menu</h2>
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive =
                      location.pathname === item.path ||
                      (location.pathname === "/dashboard" && item.path === "/dashboard/revenue");
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

            {/* Main Content */}
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