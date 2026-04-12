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
      const wallet = await apiGet<{ walletId: number; balance: number }>("/wallet");
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            RentPC Pro
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href="/#home"
            className="text-foreground hover:text-primary transition-colors"
          >
            Home
          </a>
          {isAdmin && (
            <Link
              to="/computers"
              className="text-foreground hover:text-primary transition-colors"
            >
              PC catalog
            </Link>
          )}
          <a
            href="/#packages"
            className="text-foreground hover:text-primary transition-colors"
          >
            Plans
          </a>
          <a
            href="/#features"
            className="text-foreground hover:text-primary transition-colors"
          >
            Features
          </a>
          {isAdmin && (
            <Link
              to="/dashboard"
              className="text-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
          )}
          <a
            href="/#contact"
            className="text-foreground hover:text-primary transition-colors"
          >
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
                <Wallet className="w-5 h-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Balance</span>
                  <span className="text-sm font-bold text-primary">
                    {balance === null ? "—" : formatUsd(balance)}
                  </span>
                </div>
              </div>

              <div
                onClick={() => navigate("/account")}
                className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/50 rounded-lg px-4 py-2 cursor-pointer hover:from-primary/30 hover:to-accent/30 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-bold">
                    {user?.email?.split("@")[0] ?? "User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Account
                  </span>
                </div>
              </div>

              <Button
                onClick={handleLogout}
                variant="outline"
                size="icon"
                className="border-destructive text-destructive hover:bg-destructive/10"
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
