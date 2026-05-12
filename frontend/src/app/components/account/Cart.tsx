import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
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
  Minus,
  Plus,
  ShoppingCart,
  ReceiptText,
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

type SubscriptionPlanPriceResponse = {
  id: number;
  planName: string;
  durationDays: number;
  price: number;
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
  const [planOptions, setPlanOptions] = useState<SubscriptionPlanPriceResponse[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmBooking, setConfirmBooking] = useState<BookingHistoryItemResponse | null>(null);
  const [cancelBookingTarget, setCancelBookingTarget] = useState<BookingHistoryItemResponse | null>(null);
  const [payingBookingId, setPayingBookingId] = useState<number | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [originalQuantity, setOriginalQuantity] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [reviewReceipt, setReviewReceipt] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isTopUpSubmitting, setIsTopUpSubmitting] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const focusedBookingId = useMemo(() => {
    const bookingId = searchParams.get("bookingId");
    if (!bookingId) return null;
    const focusId = Number(bookingId);
    return Number.isFinite(focusId) ? focusId : null;
  }, [searchParams]);

  const focusedBooking = useMemo(() => {
    if (items.length === 0) return null;
    const fromQuery = focusedBookingId === null ? null : items.find((item) => item.bookingId === focusedBookingId) ?? null;
    return fromQuery ?? items[0] ?? null;
  }, [focusedBookingId, items]);

  const selectedPlan = useMemo(
    () => planOptions.find((plan) => plan.id === selectedPlanId) ?? planOptions[0] ?? null,
    [planOptions, selectedPlanId],
  );

  const previewQuantity = Math.max(1, Math.floor(quantity || 1));
  const previewDays = selectedPlan ? selectedPlan.durationDays * previewQuantity : 0;
  const previewTotal = selectedPlan ? Number(selectedPlan.price ?? 0) * previewQuantity : Number(focusedBooking?.totalPrice ?? 0);

  useEffect(() => {
    if (!focusedBooking?.specId) {
      setPlanOptions([]);
      setSelectedPlanId(null);
      setQuantity(1);
      setOriginalQuantity(1);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const plans = await apiGet<SubscriptionPlanPriceResponse[]>(
          `/pcs/specs/${focusedBooking.specId}/plans`,
        );
        if (cancelled) return;
        setPlanOptions(plans);

        const matchedPlan = plans.find((plan) => {
          const unitPrice = Number(plan.price ?? 0);
          if (!unitPrice) return false;
          const inferred = Number(focusedBooking.totalPrice ?? 0) / unitPrice;
          return Number.isFinite(inferred) && Math.abs(inferred - Math.round(inferred)) < 0.01;
        }) ?? plans[0] ?? null;

        setSelectedPlanId(matchedPlan?.id ?? null);
        const inferredQuantity = matchedPlan
          ? Math.max(1, Math.round(Number(focusedBooking.totalPrice ?? 0) / Number(matchedPlan.price ?? 1)))
          : 1;
        setOriginalQuantity(inferredQuantity);
        setQuantity(inferredQuantity);
      } catch {
        if (!cancelled) {
          setPlanOptions([]);
          setSelectedPlanId(null);
          setOriginalQuantity(1);
          setQuantity(1);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [focusedBooking?.bookingId, focusedBooking?.specId, focusedBooking?.totalPrice]);

  useEffect(() => {
    if (focusedBookingId === null) return;
    const target = items.find((item) => item.bookingId === focusedBookingId);
    if (target) {
      setConfirmBooking(target);
    }
  }, [focusedBookingId, items]);

  const handleConfirmPay = async () => {
    if (!confirmBooking || payingBookingId !== null) return;
    const isFocusedOrder = focusedBooking?.bookingId === confirmBooking.bookingId;
    const price = isFocusedOrder && selectedPlan ? Number(selectedPlan.price ?? 0) * previewQuantity : Number(confirmBooking.totalPrice ?? 0);
    if (walletBalance !== null && price > walletBalance) {
      toast.error("Not enough wallet balance");
      setShowTopUp(true);
      return;
    }

    let id = confirmBooking.bookingId;
    setCheckoutBusy(true);
    try {
      if (isFocusedOrder && focusedBooking?.specId && selectedPlan && previewQuantity !== originalQuantity) {
        const created = await apiPost<BookingResponseDto, { specId: number; planId: number; quantity: number }>(
          "/bookings/subscription",
          {
            specId: focusedBooking.specId,
            planId: selectedPlan.id,
            quantity: previewQuantity,
          },
        );
        id = created.bookingId;
        await apiPost<BookingResponseDto>(`/bookings/${confirmBooking.bookingId}/cancel`).catch(() => null);
        await loadData();
      }

      setPayingBookingId(id);
      const res = await apiPost<BookingPaymentResponse>(`/bookings/${id}/pay-wallet`);
      setWalletBalance(Number(res.walletBalance));
      toast.success(res.message || "Payment completed from your wallet");
      setConfirmBooking(null);
      await loadData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPayingBookingId(null);
      setCheckoutBusy(false);
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

  const canShowFocusedSummary = !!focusedBooking && !!selectedPlan;

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
          {canShowFocusedSummary ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
              <div className="space-y-4">
                <Card className="p-5 border-border bg-card/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Coupon usage</p>
                      <p className="text-xl font-bold">No coupon applied</p>
                    </div>
                    <Button type="button" variant="link" className="px-0 justify-start sm:justify-end text-primary">
                      Change
                    </Button>
                  </div>
                </Card>

                <Card className="p-5 border-border bg-card/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment methods</p>
                      <p className="text-xl font-bold">Wallet balance</p>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 justify-start sm:justify-end text-primary"
                      onClick={() => setShowTopUp(true)}
                    >
                      Change
                    </Button>
                  </div>
                </Card>

                <Card className="p-0 border-border overflow-hidden">
                  <div className="border-b border-border px-5 py-4 bg-muted/20">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Product information</p>
                        <h3 className="text-2xl font-bold">{focusedBooking?.specName}</h3>
                      </div>
                      <Button type="button" variant="link" className="px-0 text-primary">
                        Change the product
                      </Button>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-border bg-background p-4">
                        <p className="text-sm text-muted-foreground mb-2">Quantity</p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                            className="border-border"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => {
                              const next = Number(e.target.value);
                              setQuantity(Number.isFinite(next) && next > 0 ? Math.floor(next) : 1);
                            }}
                            className="h-10 w-24 text-center text-lg font-semibold"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity((current) => current + 1)}
                            className="border-border"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-border bg-background p-4 space-y-2 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Days per unit</span>
                          <span className="font-semibold">{selectedPlan?.durationDays ?? "—"} days</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Total days</span>
                          <span className="font-semibold text-primary">{previewDays} days</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Plan</span>
                          <span className="font-semibold">{selectedPlan?.planName ?? "—"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <span className="font-semibold flex items-center gap-2">
                          <ReceiptText className="w-4 h-4" />
                          Review receipt
                        </span>
                        <Checkbox checked={reviewReceipt} onCheckedChange={(checked) => setReviewReceipt(checked === true)} />
                      </div>
                      {reviewReceipt && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Quantity</span>
                            <span className="font-medium">{previewQuantity}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Period</span>
                            <span className="font-medium capitalize">{selectedPlan?.planName ?? "Selected plan"}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-medium">{formatUsd(previewTotal)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-5 border-border bg-card/70 lg:sticky lg:top-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount of payment</p>
                    <p className="text-3xl font-bold text-rose-500">{formatUsd(previewTotal)}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Wallet balance</p>
                    <p className="font-semibold text-foreground">
                      {walletBalance === null ? "—" : formatUsd(walletBalance)}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 text-sm mb-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Points earned</span>
                    <span className="font-medium">0 pt</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Unit price</span>
                    <span className="font-medium">{selectedPlan ? formatUsd(Number(selectedPlan.price ?? 0)) : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Preview days</span>
                    <span className="font-medium">{previewDays} days</span>
                  </div>
                </div>

                {walletBalance !== null && previewTotal > walletBalance ? (
                  <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 mb-4 text-sm">
                    <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">The points are not enough</p>
                    <p className="text-muted-foreground">Top up your wallet before you finalize the purchase.</p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <Button
                    type="button"
                    onClick={() => setConfirmBooking(focusedBooking)}
                    disabled={!focusedBooking || checkoutBusy || payingBookingId !== null}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    {checkoutBusy || payingBookingId !== null ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      "Finalize the purchase"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTopUp(true)}
                    className="w-full border-border"
                  >
                    Top up wallet
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
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
          )}

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
                      {formatUsd(focusedBooking?.bookingId === confirmBooking?.bookingId ? previewTotal : Number(confirmBooking?.totalPrice ?? 0))}
                    </span>
                  </div>
                  {focusedBooking?.bookingId === confirmBooking?.bookingId && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-medium">{previewQuantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Days</span>
                        <span className="font-medium">{previewDays} days</span>
                      </div>
                    </>
                  )}
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
