import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Check,
  CreditCard,
  Loader2,
  Wallet,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { apiPost } from "../api/http";
import { toast } from "sonner";

type PaypalCaptureResponse = {
  orderId: string;
  status: string;
  message: string;
  balance: number;
};

type ViewState =
  | { kind: "capturing" }
  | { kind: "success"; data: PaypalCaptureResponse }
  | { kind: "cancelled" }
  | { kind: "error"; message: string }
  | { kind: "idle" };

function initialView(searchParams: URLSearchParams): ViewState {
  const paypalStatus = searchParams.get("paypalStatus");
  const orderId = searchParams.get("token");
  if (!paypalStatus && !orderId) return { kind: "idle" };
  if (paypalStatus === "cancel") return { kind: "cancelled" };
  if (paypalStatus === "success") {
    if (!orderId?.trim()) {
      return {
        kind: "error",
        message:
          "Không tìm thấy mã đơn hàng PayPal. Vui lòng thử lại từ trang nạp tiền hoặc liên hệ hỗ trợ.",
      };
    }
    return { kind: "capturing" };
  }
  return { kind: "error", message: "Tham số thanh toán không hợp lệ." };
}

export function WalletCheckoutPage() {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<ViewState>(() => initialView(searchParams));

  const paypalStatus = searchParams.get("paypalStatus");
  const orderId = searchParams.get("token");

  useEffect(() => {
    if (paypalStatus !== "success" || !orderId?.trim()) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await apiPost<PaypalCaptureResponse>(
          `/paypal/orders/${encodeURIComponent(orderId.trim())}/capture`,
        );
        if (!cancelled) {
          setView({ kind: "success", data });
          toast.success(data.message || "Thanh toán đã được xác nhận");
        }
      } catch (e) {
        if (!cancelled) {
          const msg =
            e instanceof Error
              ? e.message
              : "Không thể xác nhận thanh toán. Vui lòng thử lại sau.";
          setView({ kind: "error", message: msg });
          toast.error(msg);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paypalStatus, orderId]);

  const title = (
    <h1 className="text-3xl font-bold mb-2">
      Hoàn tất
      <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        {" "}
        thanh toán
      </span>
    </h1>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {view.kind === "capturing" && (
            <Card className="p-10 border-border text-center">
              <div className="inline-flex rounded-full bg-primary/15 p-4 mb-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              {title}
              <p className="text-muted-foreground">
                Đang xác nhận giao dịch với PayPal và cập nhật số dư ví...
              </p>
            </Card>
          )}

          {view.kind === "success" && (
            <Card className="p-8 border-border overflow-hidden">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="bg-accent rounded-full p-3 mb-4">
                  <Check className="w-10 h-10 text-white" />
                </div>
                {title}
                <p className="text-muted-foreground">
                  {view.data.message || "Nạp tiền vào ví thành công."}
                </p>
              </div>

              <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-border mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Số dư ví hiện tại</span>
                </div>
                <p className="text-3xl font-bold text-primary">
                  {Number(view.data.balance).toLocaleString("vi-VN")}đ
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Mã đơn: {view.data.orderId}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="flex-1 h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <Link to="/account/top-up">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Nạp thêm
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 h-12 border-border">
                  <Link to="/account">
                    Tài khoản
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {view.kind === "cancelled" && (
            <Card className="p-8 border-border text-center">
              <div className="inline-flex rounded-full bg-muted p-3 mb-6">
                <XCircle className="w-10 h-10 text-muted-foreground" />
              </div>
              {title}
              <p className="text-muted-foreground mb-8">
                Bạn đã hủy thanh toán PayPal. Chưa có khoản tiền nào được trừ. Bạn có thể
                thử lại bất cứ lúc nào từ trang nạp tiền.
              </p>
              <Button
                asChild
                className="h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Link to="/account/top-up">Quay lại nạp tiền</Link>
              </Button>
            </Card>
          )}

          {view.kind === "error" && (
            <Card className="p-8 border-border">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="inline-flex rounded-full bg-destructive/15 p-3 mb-4">
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
                {title}
                <p className="text-muted-foreground">{view.message}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline" className="border-border">
                  <Link to="/account/top-up">Thử lại nạp tiền</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                  <Link to="/account">Về tài khoản</Link>
                </Button>
              </div>
            </Card>
          )}

          {view.kind === "idle" && (
            <Card className="p-8 border-border">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-primary/20 p-3 rounded-lg shrink-0">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  {title}
                  <p className="text-muted-foreground">
                    Đây là trang xử lý sau khi bạn thanh toán PayPal khi nạp tiền. Nếu bạn vừa
                    hoàn tất trên PayPal, hãy đảm bảo bạn mở đúng liên kết trả về từ PayPal
                    (có chứa tham số trạng thái).
                  </p>
                </div>
              </div>
              <Button
                asChild
                className="w-full sm:w-auto h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Link to="/account/top-up">
                  <Wallet className="w-4 h-4 mr-2" />
                  Đi tới nạp tiền
                </Link>
              </Button>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
