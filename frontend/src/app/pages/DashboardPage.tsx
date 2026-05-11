import { Outlet, Link, useLocation } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Activity,
  Monitor,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

const navGroups = [
  {
    label: "Machines and Sessions",
    items: [
      { path: "/dashboard/computers", label: "Machines", icon: Monitor },
      { path: "/dashboard/sessions", label: "Sessions", icon: Activity },
    ],
  },
  {
    label: "Revenue, Orders and Invoices",
    items: [
      { path: "/dashboard/revenue", label: "Revenue", icon: TrendingUp },
      { path: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
      { path: "/dashboard/invoices", label: "Invoices", icon: ReceiptText },
    ],
  },
  {
    label: "Account",
    items: [
      { path: "/dashboard/accounts", label: "Accounts", icon: Users },
    ],
  },
];

export function DashboardPage() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("adminSidebarCollapsed");
      return raw === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("adminSidebarCollapsed", sidebarCollapsed ? "1" : "0");
    } catch {
      // ignore
    }
  }, [sidebarCollapsed]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Dashboard Header */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
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

          </div>

          <div className={`grid ${sidebarCollapsed ? "lg:grid-cols-[88px_1fr]" : "lg:grid-cols-[280px_1fr]"} gap-8`}>
            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={sidebarCollapsed ? "sr-only" : ""}>
                    <h2 className="text-lg font-bold px-2">Navigation</h2>
                    <p className="text-xs text-muted-foreground px-2">Admin control center</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm hover:bg-muted"
                    aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
                    title={sidebarCollapsed ? "Expand Navigation" : "Collapse Navigation"}
                  >
                    {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    <span className={sidebarCollapsed ? "sr-only" : ""}>{sidebarCollapsed ? "Expand Navigation" : "Collapse Navigation"}</span>
                  </button>
                </div>

                <nav className="space-y-4">
                  {navGroups.map((group) => (
                    <div key={group.label} className="space-y-2">
                      <div className={sidebarCollapsed ? "sr-only" : "px-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"}>
                        {group.label}
                      </div>
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const active = isActive(item.path);
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              title={item.label}
                              className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                                active
                                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                                  : "text-foreground hover:bg-muted"
                              } ${sidebarCollapsed ? "justify-center" : ""}`}
                            >
                              <item.icon className="h-5 w-5 shrink-0" />
                              <span className={sidebarCollapsed ? "sr-only" : ""}>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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