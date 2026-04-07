import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Wallet, CreditCard, DollarSign, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../api/http";
import { toast } from "sonner";

const quickAmounts = [5, 10, 20, 50, 100, 200];

export function TopUp() {
  const [amount, setAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const wallet = await apiGet<{ walletId: number; balance: number }>("/wallet");
        if (!cancelled) setBalance(Number(wallet.balance));
      } catch {
        if (!cancelled) setBalance(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleQuickAmount = (value: number) => {
    setAmount(String(value));
  };

  const handleTopUp = async () => {
    if (!amount) return;
    if (isSubmitting) return;
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiPost<
        { paymentProvider: string; status: string; message: string; orderId: string | null; approvalUrl: string | null },
        { amount: number }
      >("/wallet/top-up", { amount: parsed });

      if (res.approvalUrl) {
        toast.message(res.message || "Complete payment in PayPal", {
          description: "Opening PayPal…",
        });
        window.open(res.approvalUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.success(res.message || "Top-up successful");
      }

      const wallet = await apiGet<{ walletId: number; balance: number }>("/wallet");
      setBalance(Number(wallet.balance));

      setShowSuccess(true);
      window.setTimeout(() => setShowSuccess(false), 2500);
      setAmount("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Top-up failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const amountInUSD = amount ? Number(amount).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">
          Top up
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {" "}
            wallet
          </span>
        </h2>
        <p className="text-muted-foreground">
          Add funds to pay subscription bookings from your balance
        </p>
      </div>

      {showSuccess && (
        <Card className="p-4 bg-accent/10 border-accent">
          <div className="flex items-center gap-3">
            <div className="bg-accent rounded-full p-2">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-accent">Top-up recorded</h4>
              <p className="text-sm text-muted-foreground">
                Your wallet balance has been refreshed
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        <Card className="p-6 border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/20 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Amount (USD)</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Enter amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="text-2xl font-bold bg-input-background border-border h-14"
              />
              <p className="text-sm text-muted-foreground">
                Checkout total: ${amountInUSD} USD
              </p>
            </div>

            <div>
              <Label className="mb-2 block">Quick picks</Label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((value) => (
                  <Button
                    key={value}
                    variant="outline"
                    type="button"
                    onClick={() => handleQuickAmount(value)}
                    className={`border-border hover:border-primary ${
                      amount === String(value) ? "border-primary bg-primary/10" : ""
                    }`}
                  >
                    ${value}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground">Current balance (display)</span>
          </div>
          <p className="text-3xl font-bold text-primary">
            {balance === null ? "—" : `$${balance.toLocaleString("en-US")}`}
          </p>
        </Card>

        <Button
          onClick={handleTopUp}
          disabled={!amount || isSubmitting}
          className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          {isSubmitting ? "Processing…" : "Pay with PayPal"}
        </Button>
      </div>

      <Card className="p-6 border-border bg-muted/30">
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <span className="bg-primary/20 p-1 rounded">
            <CreditCard className="w-4 h-4 text-primary" />
          </span>
          Top-up notes
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Settlement usually appears within 5–15 minutes after PayPal approves.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>PayPal fees follow PayPal&apos;s own rules.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Contact support if the balance does not update after 30 minutes.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
