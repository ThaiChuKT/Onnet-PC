import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useAuth } from "../auth/AuthProvider";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidCode(code: string): boolean {
  return /^[0-9]{6}$/.test(code);
}

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const initialEmail = useMemo(() => searchParams.get("email")?.trim() ?? "", [searchParams]);

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!isValidCode(code)) {
      toast.error("Verification code must be 6 digits.");
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyEmail({ email: email.trim(), code: code.trim() });
      toast.success("Email verified successfully. You can now sign in.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not verify email.");
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
                <div className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <MailCheck className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  Verify your
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    {" "}
                    email
                  </span>
                </h1>
                <p className="text-muted-foreground">
                  Enter the 6-digit code sent to your inbox to complete registration.
                </p>
              </div>

              <form noValidate onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-input-background border-border"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Verification code</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="bg-input-background border-border tracking-[0.3em] text-center"
                    autoComplete="one-time-code"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  {isSubmitting ? "Verifying..." : "Verify email"}
                </Button>
              </form>

              <p className="mt-6 text-sm text-muted-foreground text-center">
                Already verified?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Go to sign in
                </Link>
              </p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
