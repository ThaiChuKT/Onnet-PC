import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Wallet, CreditCard, DollarSign, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../api/http";
import { toast } from "sonner";

const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

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
      toast.error("Số tiền không hợp lệ");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await apiPost<
        { paymentProvider: string; status: string; message: string; orderId: string | null; approvalUrl: string | null },
        { amount: number }
      >("/wallet/top-up", { amount: parsed });

      if (res.approvalUrl) {
        toast.message(res.message || "Vui lòng hoàn tất thanh toán", {
          description: "Đang mở trang thanh toán...",
        });
        window.open(res.approvalUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.success(res.message || "Nạp tiền thành công");
      }

      const wallet = await apiGet<{ walletId: number; balance: number }>("/wallet");
      setBalance(Number(wallet.balance));

      setShowSuccess(true);
      window.setTimeout(() => setShowSuccess(false), 2500);
      setAmount("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể nạp tiền");
    } finally {
      setIsSubmitting(false);
    }
  };

  const exchangeRate = 25000; // 1 USD = 25,000 VND
  const amountInUSD = amount ? (parseInt(amount) / exchangeRate).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">
          Nạp Tiền
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {" "}Vào Ví
          </span>
        </h2>
        <p className="text-muted-foreground">
          Nạp tiền vào ví để thanh toán dịch vụ thuê máy
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Card className="p-4 bg-accent/10 border-accent">
          <div className="flex items-center gap-3">
            <div className="bg-accent rounded-full p-2">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-accent">Nạp tiền thành công!</h4>
              <p className="text-sm text-muted-foreground">
                Số dư ví của bạn đã được cập nhật
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {/* Amount Input */}
        <Card className="p-6 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/20 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Số Tiền Nạp</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Nhập số tiền (VNĐ)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="text-2xl font-bold bg-input-background border-border h-14"
                />
                <p className="text-sm text-muted-foreground">
                  ≈ ${amountInUSD} USD
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <Label className="mb-2 block">Chọn nhanh</Label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      onClick={() => handleQuickAmount(value)}
                      className={`border-border hover:border-primary ${
                        amount === String(value) ? "border-primary bg-primary/10" : ""
                      }`}
                    >
                      {(value / 1000).toFixed(0)}K
                    </Button>
                  ))}
                </div>
              </div>
            </div>

        </Card>

        {/* Current Balance */}
        <Card className="p-6 border-border bg-gradient-to-br from-primary/10 to-accent/10">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">Số dư hiện tại</span>
            </div>
            <p className="text-3xl font-bold text-primary">
              {balance === null ? "—" : `${balance.toLocaleString("vi-VN")}đ`}
            </p>

        </Card>
        
        {/* Action Button */}
        <Button
          onClick={handleTopUp}
          disabled={!amount || isSubmitting}
          className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          {isSubmitting ? "Đang xử lý..." : "Thanh Toán Qua PayPal"}
        </Button>
      </div>
      {/* Info Card */}
      <Card className="p-6 border-border bg-muted/30">
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <span className="bg-primary/20 p-1 rounded">
            <CreditCard className="w-4 h-4 text-primary" />
          </span>
          Lưu ý khi nạp tiền
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Thời gian xử lý: 5-15 phút sau khi thanh toán thành công</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Tỷ giá quy đổi: 1 USD = 25,000 VNĐ</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Phí giao dịch PayPal áp dụng theo chính sách của PayPal</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Vui lòng liên hệ support nếu có bất kỳ vấn đề gì</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Liên hệ support nếu không nhận được tiền sau 30 phút</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
