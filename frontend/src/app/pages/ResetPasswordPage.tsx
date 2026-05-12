import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PasswordRequirements } from "../components/PasswordRequirements";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiPost } from "../api/http";
import { useNavigate, useSearchParams } from "react-router";

export function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const e = searchParams.get("email");
    if (e) setEmail(decodeURIComponent(e));
  }, [searchParams]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSubmitting) return;
    if (!email.trim() || !code.trim() || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    // Client-side password requirements validation
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast.error("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      toast.error("Password must contain at least one lowercase letter");
      return;
    }
    if (!/\d/.test(newPassword)) {
      toast.error("Password must contain at least one number");
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      toast.error("Password must contain at least one special character");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiPost<void>("/auth/reset-password", { email, code, newPassword, confirmPassword });
      toast.success("Password reset successfully. You can now sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
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
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Reset password</h2>
                <p className="text-sm text-muted-foreground">Enter the code sent to your email and choose a new password.</p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Reset code</Label>
                  <Input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
                </div>

                {newPassword && (
                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <PasswordRequirements password={newPassword} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Please wait…" : "Reset password"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
