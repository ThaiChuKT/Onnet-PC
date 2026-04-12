import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Mail, Lock, User, Eye, EyeOff, Phone } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { toast } from "sonner";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (isLogin) {
      if (!formData.email.trim()) {
        toast.error("Please enter your email address.");
        return;
      }
      if (!isValidEmail(formData.email)) {
        toast.error("Please enter a valid email address.");
        return;
      }
      if (!formData.password) {
        toast.error("Please enter your password.");
        return;
      }
    } else {
      if (!formData.fullName.trim()) {
        toast.error("Please enter your full name.");
        return;
      }
      if (!formData.phone.trim()) {
        toast.error("Please enter your phone number.");
        return;
      }
      if (!formData.email.trim()) {
        toast.error("Please enter your email address.");
        return;
      }
      if (!isValidEmail(formData.email)) {
        toast.error("Please enter a valid email address.");
        return;
      }
      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        try {
          const profile = await login({ email: formData.email.trim(), password: formData.password });
          const state = location.state as { from?: string } | null;
          const isAdminAccount = (profile.role ?? "").toUpperCase().includes("ADMIN");
          const redirectTo = state?.from ?? (isAdminAccount ? "/dashboard" : "/");
          toast.success("Signed in successfully");
          navigate(redirectTo, { replace: true });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Something went wrong";
          if (message.toLowerCase().includes("not verified")) {
            toast.error("Your email is not verified yet.");
            navigate(`/verify-email?email=${encodeURIComponent(formData.email.trim())}`);
            return;
          }
          throw err;
        }
      } else {
        const registerRes = await register({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        });
        toast.success(registerRes.message || "Verification code sent to your email.");
        navigate(`/verify-email?email=${encodeURIComponent(registerRes.email)}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-12 bg-gradient-to-br from-black via-background to-black">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card className="p-8 border-border bg-card/80 backdrop-blur">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  {isLogin ? "Sign in" : "Create account"}
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    {" "}
                    RentPC Pro
                  </span>
                </h1>
                <p className="text-muted-foreground">
                  {isLogin ? "Welcome back." : "Start renting gaming PCs in minutes."}
                </p>
              </div>

              <form noValidate onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="Your name"
                        className="pl-10 bg-input-background border-border"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Phone number"
                        className="pl-10 bg-input-background border-border"
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="you@example.com"
                      className="pl-10 bg-input-background border-border"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-input-background border-border"
                      autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                        className="pl-10 bg-input-background border-border"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  {isSubmitting ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {isLogin ? (
                    <>
                      No account yet?{" "}
                      <span className="text-primary font-medium">Register</span>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <span className="text-primary font-medium">Sign in</span>
                    </>
                  )}
                </button>
              </div>

              {!isLogin && (
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">With an account you can:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      <span>Manage bookings and wallet</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      <span>Subscribe to Basic / Pro / Ultra tiers</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      <span>Use AI chat for hardware advice</span>
                    </li>
                  </ul>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
