import { Monitor, Menu, User, Wallet, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userBalance = 2500000;
  const [userEmail, setUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check login status from localStorage
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const email = localStorage.getItem("userEmail") || "";
    const admin = email === "admin@rentpc.com"; // Mock admin check

    setIsLoggedIn(loggedIn);
    setUserEmail(email);
    setIsAdmin(admin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserEmail("");
    setIsAdmin(false);
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
            Trang Chủ
          </a>
          <Link
            to="/computers"
            className="text-foreground hover:text-primary transition-colors"
          >
            Máy Cho Thuê
          </Link>
          <a
            href="/#packages"
            className="text-foreground hover:text-primary transition-colors"
          >
            Gói Cho Thuê
          </a>
          <a
            href="/#features"
            className="text-foreground hover:text-primary transition-colors"
          >
            Tính Năng
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
            Liên Hệ
          </a>
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {/* Wallet */}
              <div className="hidden md:flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
                <Wallet className="w-5 h-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Số dư</span>
                  <span className="text-sm font-bold text-primary">
                    {userBalance.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              {/* User Account */}
              <div
                onClick={() => navigate("/account")}
                className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/50 rounded-lg px-4 py-2 cursor-pointer hover:from-primary/30 hover:to-accent/30 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-bold">
                    {userEmail.split("@")[0]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Tài khoản
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="icon"
                className="border-destructive text-destructive hover:bg-destructive/10"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              className="hidden md:inline-flex bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              Đăng Nhập
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
