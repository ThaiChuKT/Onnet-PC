import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Wallet, CreditCard, QrCode, DollarSign, Check } from "lucide-react";
import { useState } from "react";

const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

export function TopUp() {
  const [amount, setAmount] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<"email" | "qr" | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleQuickAmount = (value: number) => {
    setAmount(String(value));
  };

  const handleTopUp = () => {
    if (!amount || !selectedMethod) return;
    
    // Mock payment processing
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setAmount("");
      setPaypalEmail("");
      setSelectedMethod(null);
    }, 3000);
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Amount Input */}
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
            <p className="text-3xl font-bold text-primary">2,500,000đ</p>
          </Card>
        </div>

        {/* Right Column - Payment Method */}
        <div className="space-y-6">
          {/* PayPal Email */}
          <Card className="p-6 border-border">
            <button
              onClick={() => setSelectedMethod("email")}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/20 p-2 rounded-lg">
                    <CreditCard className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">PayPal Email</h3>
                    <p className="text-sm text-muted-foreground">
                      Thanh toán qua email PayPal
                    </p>
                  </div>
                </div>
                {selectedMethod === "email" && (
                  <Badge className="bg-primary/20 text-primary border-primary/50">
                    Đã chọn
                  </Badge>
                )}
              </div>
            </button>

            {selectedMethod === "email" && (
              <div className="space-y-4 mt-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="paypal-email">Email PayPal</Label>
                  <Input
                    id="paypal-email"
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="your-email@paypal.com"
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Gửi đến:</strong> payments@rentpc.com
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Số tiền:</strong> ${amountInUSD} USD
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Ghi chú:</strong> Nạp tiền - [Email của bạn]
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* PayPal QR Code */}
          <Card className="p-6 border-border">
            <button
              onClick={() => setSelectedMethod("qr")}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/20 p-2 rounded-lg">
                    <QrCode className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Quét Mã QR</h3>
                    <p className="text-sm text-muted-foreground">
                      Quét mã QR để thanh toán
                    </p>
                  </div>
                </div>
                {selectedMethod === "qr" && (
                  <Badge className="bg-primary/20 text-primary border-primary/50">
                    Đã chọn
                  </Badge>
                )}
              </div>
            </button>

            {selectedMethod === "qr" && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="bg-white p-6 rounded-lg flex items-center justify-center">
                  {/* Mock QR Code */}
                  <div className="w-48 h-48 bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center rounded-lg">
                    <QrCode className="w-32 h-32 text-white" />
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground mt-4">
                  Quét mã QR bằng ứng dụng PayPal để thanh toán
                </p>
                <div className="p-3 bg-muted rounded-lg mt-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Số tiền: <strong>${amountInUSD} USD</strong>
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Action Button */}
          <Button
            onClick={handleTopUp}
            disabled={!amount || !selectedMethod || (selectedMethod === "email" && !paypalEmail)}
            className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Xác Nhận Nạp Tiền
          </Button>
        </div>
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
            <span>Vui lòng ghi đúng thông tin email trong phần ghi chú khi chuyển khoản</span>
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
