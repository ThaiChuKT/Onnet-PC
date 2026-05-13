import { Monitor, Menu, User, Wallet, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthProvider";
import { apiGet } from "../api/http";
import { formatUsd } from "../lib/formatUsd";

const WALLET_POLL_MS = 15_000;

export function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);

  const refreshWallet = useCallback(async () => {
    if (!isAuthenticated) {
      setBalance(null);
      return;
    }
    try {
      const wallet = await apiGet<{ walletId: number; balance: number }>(
        "/wallet",
      );
      setBalance(Number(wallet.balance));
    } catch {
      setBalance(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshWallet();
  }, [refreshWallet]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const id = window.setInterval(() => {
      void refreshWallet();
    }, WALLET_POLL_MS);
    return () => window.clearInterval(id);
  }, [isAuthenticated, refreshWallet]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="container mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-4 py-3">
        <Link
          to={isAdmin ? "/dashboard" : "/"}
          className="justify-self-start flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold leading-none bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            RentPC Pro
          </span>
        </Link>

        <nav className="hidden md:flex items-center justify-center gap-10 justify-self-center">
          {isAdmin ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors"
              >
                Dashboard Home
              </Link>
              <Link
                to="/computers"
                className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors"
              >
                PC catalog
              </Link>
              <Link
                to="/faq-admin"
                className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors"
              >
                FAQ Management
              </Link>

            </>
          ) : (
            <>
              <a
                href="/#home"
                className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors"
              >
                Home
              </a>
              <Link
                to="/packages"
                className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors"
              >
                Plans
              </Link>
              {/* <a
                href="/#features"
                className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors"
              >
                Features
              </a> */}
              <a
                href="/faq"
                className="text-foreground hover:text-primary transition-colors"
              >
                FAQ
              </a>
            </>
          )}
        </nav>

        <div className="justify-self-end flex items-center gap-3 lg:translate-x-4">
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <>
                  <div 
                    onClick={() => navigate("/account/top-up")}
                    className="hidden h-14 min-w-40 md:flex items-center gap-3 rounded-xl border border-border bg-card/80 px-4 cursor-pointer hover:bg-card transition-colors"
                    title="View wallet"
                  >
                    <Wallet className="w-5 h-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Balance
                      </span>
                      <span className="text-sm font-bold leading-tight text-money">
                        {balance === null ? "—" : formatUsd(balance)}
                      </span>
                    </div>
                  </div>
                  
                </>
              )}

              <div
                onClick={() => navigate("/account")}
                className="flex h-14 min-w-40 items-center gap-3 rounded-xl border border-primary/50 bg-gradient-to-r from-primary/20 to-accent/20 px-4 cursor-pointer hover:from-primary/30 hover:to-accent/30 transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden min-w-0 md:flex flex-col">
                  <span className="max-w-24 truncate text-sm font-bold leading-tight">
                    {user?.email?.split("@")[0] ?? "User"}
                  </span>
                  <span className="text-xs text-muted-foreground">Account</span>
                </div>
              </div>

              <Button
                onClick={handleLogout}
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-lg border-destructive text-destructive hover:bg-destructive/10"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              className="hidden md:inline-flex bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              Sign in
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
