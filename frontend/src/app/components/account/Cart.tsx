import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Card } from "../ui/card";
// Badge removed: not used in this component
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
  planId: number | null;
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

type BookingDraftState = {
  planOptions: SubscriptionPlanPriceResponse[];
  selectedPlanId: number | null;
  quantity: number;
  originalQuantity: number;
};

const normalizeBookingStatus = (value?: string | null) => {
  const normalized = (value ?? "").toLowerCase();
  return normalized === "completed" ? "expired" : normalized;
};

export function Cart() {
  const [items, setItems] = useState<BookingHistoryItemResponse[]>([]);
  const [bookingDrafts, setBookingDrafts] = useState<Record<number, BookingDraftState>>({});
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmBooking, setConfirmBooking] = useState<BookingHistoryItemResponse | null>(null);
  const [cancelBookingTarget, setCancelBookingTarget] = useState<BookingHistoryItemResponse | null>(null);
  const [payingBookingId, setPayingBookingId] = useState<number | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [receiveEmail, setReceiveEmail] = useState(true);
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

  useEffect(() => {
    let cancelled = false;

    const buildDrafts = async () => {
      const entries = await Promise.all(
        items.map(async (item) => {
          if (!item.specId) {
            return [item.bookingId, { planOptions: [], selectedPlanId: null, quantity: 1, originalQuantity: 1 }] as const;
          }

          try {
            const plans = await apiGet<SubscriptionPlanPriceResponse[]>(`/pcs/specs/${item.specId}/plans`);
            
            // Priority: Use planId from backend if available (new behavior)
            let matchedPlan = item.planId 
              ? plans.find(p => p.id === item.planId)
              : null;
            
            // Fallback: Infer from price if planId not available (legacy behavior)
            if (!matchedPlan) {
              let bestScore = Infinity;
              
              for (const plan of plans) {
                const unitPrice = Number(plan.price ?? 0);
                if (!unitPrice) continue;
                const inferred = Number(item.totalPrice ?? 0) / unitPrice;
                if (!Number.isFinite(inferred)) continue;
                const roundedQty = Math.max(1, Math.round(inferred));
                const distanceFromWhole = Math.abs(inferred - roundedQty);
                const distanceFromOne = Math.abs(roundedQty - 1);
                // Heavily penalize non-1 quantities, then prefer clean divisions
                const score = distanceFromOne * 100 + distanceFromWhole * 10;
                
                if (score < bestScore) {
                  bestScore = score;
                  matchedPlan = plan;
                }
              }
            }
            
            matchedPlan = matchedPlan ?? plans[0] ?? null;
            
            const inferredQuantity = matchedPlan
              ? Math.max(1, Math.round(Number(item.totalPrice ?? 0) / Number(matchedPlan.price ?? 1)))
              : 1;
            return [item.bookingId, {
              planOptions: plans,
              selectedPlanId: matchedPlan?.id ?? null,
              quantity: inferredQuantity,
              originalQuantity: inferredQuantity,
            }] as const;
          } catch {
            return [item.bookingId, { planOptions: [], selectedPlanId: null, quantity: 1, originalQuantity: 1 }] as const;
          }
        }),
      );

      if (!cancelled) {
        setBookingDrafts(Object.fromEntries(entries));
      }
    };

    void buildDrafts();

    return () => {
      cancelled = true;
    };
  }, [items]);

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

  const focusedDraft = focusedBooking ? bookingDrafts[focusedBooking.bookingId] ?? null : null;
  const focusedPlan = useMemo(
    () => focusedDraft?.planOptions.find((plan) => plan.id === focusedDraft.selectedPlanId) ?? focusedDraft?.planOptions[0] ?? null,
    [focusedDraft],
  );
  const previewQuantity = Math.max(1, Math.floor(focusedDraft?.quantity || 1));
  const previewDays = focusedPlan ? focusedPlan.durationDays * previewQuantity : 0;
  const previewTotal = focusedPlan ? Number(focusedPlan.price ?? 0) * previewQuantity : Number(focusedBooking?.totalPrice ?? 0);

  const handleConfirmPay = async () => {
    if (!confirmBooking || payingBookingId !== null) return;
    const isFocusedOrder = focusedBooking?.bookingId === confirmBooking.bookingId;
    const price = isFocusedOrder && focusedPlan ? Number(focusedPlan.price ?? 0) * previewQuantity : Number(confirmBooking.totalPrice ?? 0);
    if (walletBalance !== null && price > walletBalance) {
      toast.error("Not enough wallet balance");
      setShowTopUp(true);
      return;
    }

    let id = confirmBooking.bookingId;
    setCheckoutBusy(true);
    try {
      if (isFocusedOrder && focusedBooking?.specId && focusedPlan && previewQuantity !== (focusedDraft?.originalQuantity ?? previewQuantity)) {
        const created = await apiPost<BookingResponseDto, { specId: number; planId: number; quantity: number }>(
          "/bookings/subscription",
          {
            specId: focusedBooking.specId,
            planId: focusedPlan.id,
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

  const canShowFocusedSummary = !!focusedBooking && !!focusedPlan;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
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
          <Button
            asChild
            variant="outline"
            className="border-border"
          >
            <Link to="/packages">Return to plans</Link>
          </Button>
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
            <Link to="/packages">Browse packages</Link>
          </Button>
        </Card>
      )}

      {!isLoading && !loadError && items.length > 0 && (
        <div className="space-y-4">
          {canShowFocusedSummary ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
              <div className="space-y-6">
                {items.map((item) => {
                  const draft = bookingDrafts[item.bookingId];
                  const itemPlan = draft?.planOptions.find((plan) => plan.id === draft.selectedPlanId) ?? draft?.planOptions[0] ?? null;
                  const itemQuantity = Math.max(1, Math.floor(draft?.quantity || 1));
                  const itemPreviewDays = itemPlan ? itemPlan.durationDays * itemQuantity : 0;
                  const itemTotal = itemPlan ? Number(itemPlan.price ?? 0) * itemQuantity : Number(item.totalPrice ?? 0);
                  return (
                    <Card key={item.bookingId} className="p-0 border-border overflow-hidden">
                      <div className="border-b border-border px-5 py-4 bg-muted/20">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Product information</p>
                            <h3 className="text-2xl font-bold">{item.specName}</h3>
                          </div>
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

                      <div className="p-5 space-y-5">
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="rounded-lg border border-border bg-background p-4">
                            <p className="text-sm text-muted-foreground mb-2">Quantity</p>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  setBookingDrafts((current) => ({
                                    ...current,
                                    [item.bookingId]: {
                                      ...(current[item.bookingId] ?? {
                                        planOptions: draft?.planOptions ?? [],
                                        selectedPlanId: itemPlan?.id ?? null,
                                        quantity: 1,
                                        originalQuantity: 1,
                                      }),
                                      quantity: Math.max(1, itemQuantity - 1),
                                    },
                                  }))
                                }
                                className="border-border"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <Input
                                type="number"
                                min={1}
                                value={itemQuantity}
                                onChange={(e) => {
                                  const next = Number(e.target.value);
                                  setBookingDrafts((current) => ({
                                    ...current,
                                    [item.bookingId]: {
                                      ...(current[item.bookingId] ?? {
                                        planOptions: draft?.planOptions ?? [],
                                        selectedPlanId: itemPlan?.id ?? null,
                                        quantity: 1,
                                        originalQuantity: 1,
                                      }),
                                      quantity: Number.isFinite(next) && next > 0 ? Math.floor(next) : 1,
                                    },
                                  }));
                                }}
                                className="h-10 w-24 px-0 text-center text-lg font-semibold leading-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  setBookingDrafts((current) => ({
                                    ...current,
                                    [item.bookingId]: {
                                      ...(current[item.bookingId] ?? {
                                        planOptions: draft?.planOptions ?? [],
                                        selectedPlanId: itemPlan?.id ?? null,
                                        quantity: 1,
                                        originalQuantity: 1,
                                      }),
                                      quantity: itemQuantity + 1,
                                    },
                                  }))
                                }
                                className="border-border"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="rounded-lg border border-border bg-background p-4 space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-muted-foreground">Days per unit</span>
                              <span className="font-semibold">{itemPlan?.durationDays ?? "—"} days</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-muted-foreground">Total days</span>
                              <span className="font-semibold text-primary">{itemPreviewDays} days</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-muted-foreground">Amount</span>
                              <span className="font-semibold text-money">{formatUsd(itemTotal)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-muted-foreground">Plan</span>
                              <span className="font-semibold">{itemPlan?.planName ?? "—"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Card className="p-5 border-border bg-card/70 lg:sticky lg:top-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount of payment</p>
                    <p className="text-3xl font-bold text-money">{formatUsd(previewTotal)}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Wallet balance</p>
                    <p className="font-semibold text-money">
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
                    <span className="font-medium text-money">{focusedPlan ? formatUsd(Number(focusedPlan.price ?? 0)) : "—"}</span>
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

                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
                    <Checkbox checked={receiveEmail} onCheckedChange={(checked) => setReceiveEmail(checked === true)} />
                    <span>Receive email receipt</span>
                  </div>
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
                  <p className="text-2xl font-bold text-money">
                    {formatUsd(totalDue)}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm text-muted-foreground">Wallet balance</p>
                  <p className="text-2xl font-bold text-money">
                    {walletBalance === null ? "—" : formatUsd(walletBalance)}
                  </p>
                </div>
              </div>
            </Card>
          )}


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
                    <span className="font-bold text-money">
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
                    <span className="font-medium text-money">
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
              className="text-white hover:opacity-90"
              style={{
                background:
                  "radial-gradient(circle farthest-corner at 10% 20%, rgba(0,51,102,1) 0%, rgba(0,102,204,1) 49.5%, rgba(0,191,255,1) 90%)",
              }}
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
              className="h-11 text-money font-semibold"
            />
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  onClick={() => setTopUpAmount(String(value))}
                  className="border-border text-money"
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
