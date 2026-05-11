import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertTriangle,
  CreditCard,
  Loader2,
  ShoppingCart,
  Wallet,
  XCircle,
} from "lucide-react";
import { apiGet, apiPost } from "../../api/http";
import { toast } from "sonner";
import { formatUsd } from "../../lib/formatUsd";

const quickAmounts = [5, 10, 20, 50, 100];

type BookingHistoryItemResponse = {
  bookingId: number;
  specId: number | null;
  pcId: number | null;
  specName: string;
  queued: boolean;
  queuePosition: number | null;
  totalHours: number | null;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  remainingMinutes: number | null;
  pendingExpiresAt: string | null;
  createdAt: string;
};

type BookingPaymentResponse = {
  bookingId: number;
  status: string;
  walletBalance: number;
  message?: string;
  mergedIntoBookingId?: number | null;
};

type BookingResponseDto = {
  bookingId: number;
  status: string;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type TopUpResponse = {
  paymentProvider: string;
  status: string;
  message: string;
  orderId: string | null;
  approvalUrl: string | null;
};

const normalizeBookingStatus = (value?: string | null) => {
  const normalized = (value ?? "").toLowerCase();
  return normalized === "completed" ? "expired" : normalized;
};

export function Cart() {
  const [items, setItems] = useState<BookingHistoryItemResponse[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmBooking, setConfirmBooking] = useState<BookingHistoryItemResponse | null>(null);
  const [cancelBookingTarget, setCancelBookingTarget] = useState<BookingHistoryItemResponse | null>(null);
  const [payingBookingId, setPayingBookingId] = useState<number | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isTopUpSubmitting, setIsTopUpSubmitting] = useState(false);
  const [searchParams] = useSearchParams();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [page, wallet] = await Promise.all([
        apiGet<PageResponse<BookingHistoryItemResponse>>("/bookings/my", { page: 0, size: 50 }),
        apiGet<{ walletId: number; balance: number }>("/wallet").catch(() => null),
      ]);
      const pending = (page.content ?? []).filter(
        (item) => normalizeBookingStatus(item.status) === "pending",
      );
      setItems(pending);
      if (wallet) setWalletBalance(Number(wallet.balance));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load cart";
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    if (!bookingId) return;
    const focusId = Number(bookingId);
    if (!Number.isFinite(focusId)) return;
    const target = items.find((item) => item.bookingId === focusId);
    if (target) {
      setConfirmBooking(target);
    }
  }, [items, searchParams]);

  const handleConfirmPay = async () => {
    if (!confirmBooking || payingBookingId !== null) return;
    const price = Number(confirmBooking.totalPrice ?? 0);
    if (walletBalance !== null && price > walletBalance) {
      toast.error("Not enough wallet balance");
      setShowTopUp(true);
      return;
    }

    const id = confirmBooking.bookingId;
    setPayingBookingId(id);
    try {
      const res = await apiPost<BookingPaymentResponse>(`/bookings/${id}/pay-wallet`);
      setWalletBalance(Number(res.walletBalance));
      toast.success(res.message || "Payment completed from your wallet");
      setConfirmBooking(null);
      await loadData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPayingBookingId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelBookingTarget || cancellingBookingId !== null) return;
    const id = cancelBookingTarget.bookingId;
    setCancellingBookingId(id);
    try {
      await apiPost<BookingResponseDto>(`/bookings/${id}/cancel`);
      toast.success("Order cancelled");
      setCancelBookingTarget(null);
      await loadData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not cancel order");
    } finally {
      setCancellingBookingId(null);
    }
  };

  const handleTopUp = async () => {
    if (!topUpAmount || isTopUpSubmitting) return;
    const parsed = Number(topUpAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setIsTopUpSubmitting(true);
    try {
      const res = await apiPost<TopUpResponse, { amount: number; redirectTo?: string }>(
        "/wallet/top-up",
        {
          amount: parsed,
          redirectTo: "/account/cart",
        },
      );
      if (res.approvalUrl) {
        toast.message(res.message || "Complete payment in PayPal", {
          description: "Opening PayPal…",
        });
        window.open(res.approvalUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.success(res.message || "Top-up successful");
      }
      setTopUpAmount("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Top-up failed");
    } finally {
      setIsTopUpSubmitting(false);
    }
  };

  const pendingCount = items.length;
  const totalDue = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.totalPrice ?? 0), 0),
    [items],
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          My
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {" "}
            cart
          </span>
        </h1>
        <p className="text-muted-foreground">
          Review pending orders and pay directly from your wallet balance.
        </p>
      </div>

      {isLoading && (
        <Card className="p-10 border-border text-center">
          <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading cart…</p>
        </Card>
      )}

      {!isLoading && loadError && (
        <Card className="p-10 border-border text-center">
          <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">{loadError}</p>
        </Card>
      )}

      {!isLoading && !loadError && items.length === 0 && (
        <Card className="p-12 border-border text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-4">
            Choose a subscription tier to get started.
          </p>
          <Button asChild className="bg-gradient-to-r from-primary to-accent">
            <Link to="/#packages">Browse packages</Link>
          </Button>
        </Card>
      )}

      {!isLoading && !loadError && items.length > 0 && (
        <div className="space-y-4">
          <Card className="p-5 border-border bg-card/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Pending orders</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-sm text-muted-foreground">Total due</p>
                <p className="text-2xl font-bold text-emerald-500">
                  {formatUsd(totalDue)}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-sm text-muted-foreground">Wallet balance</p>
                <p className="text-2xl font-bold text-emerald-500">
                  {walletBalance === null ? "—" : formatUsd(walletBalance)}
                </p>
              </div>
            </div>
          </Card>

          {items.map((item) => {
            const total = Number(item.totalPrice ?? 0);
            return (
              <Card key={item.bookingId} className="p-6 border-border">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">{item.specName}</h3>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                        Pending payment
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Order #{item.bookingId}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-2xl font-bold text-emerald-500">
                        {formatUsd(total)}
                      </p>
                    </div>
                    <Button
                      onClick={() => setConfirmBooking(item)}
                      disabled={payingBookingId !== null}
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    >
                      {payingBookingId === item.bookingId ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing…
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4 mr-2" />
                          Pay with wallet
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCancelBookingTarget(item)}
                      disabled={cancellingBookingId !== null}
                      className="border-border"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={!!confirmBooking}
        onOpenChange={(open) => !open && setConfirmBooking(null)}
      >
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Confirm wallet payment
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left">
                <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    Ensure your wallet has enough funds before continuing.
                  </div>
                </div>
                <p>
                  You are paying order <strong>#{confirmBooking?.bookingId}</strong>
                  {" "}for <strong>{confirmBooking?.specName}</strong>.
                </p>
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-emerald-500">
                      {formatUsd(Number(confirmBooking?.totalPrice ?? 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current balance</span>
                    <span className="font-medium">
                      {walletBalance === null ? "—" : formatUsd(walletBalance)}
                    </span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <Button
              onClick={handleConfirmPay}
              disabled={payingBookingId !== null}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {payingBookingId !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing…
                </>
              ) : (
                "Pay now"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!cancelBookingTarget}
        onOpenChange={(open) => !open && setCancelBookingTarget(null)}
      >
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Cancel this order?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The order will be cancelled and no wallet funds will be charged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="border-border">Keep order</AlertDialogCancel>
            <Button
              onClick={handleConfirmCancel}
              disabled={cancellingBookingId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancellingBookingId !== null ? "Cancelling…" : "Cancel order"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showTopUp} onOpenChange={setShowTopUp}>
        <DialogContent className="max-w-sm border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Top up wallet
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="number"
              min={1}
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="Amount in USD"
              className="h-11"
            />
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  onClick={() => setTopUpAmount(String(value))}
                  className="border-border"
                >
                  ${value}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={handleTopUp}
              disabled={isTopUpSubmitting}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 w-full"
            >
              {isTopUpSubmitting ? "Processing…" : "Pay with PayPal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
