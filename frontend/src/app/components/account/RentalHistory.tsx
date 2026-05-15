import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
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
  Calendar,
  Clock,
  Loader2,
  Wallet,
  CreditCard,
  AlertTriangle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiGet, apiPost } from "../../api/http";
import { toast } from "sonner";
import { formatUsd } from "../../lib/formatUsd";

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

type SubscriptionPlanPriceResponse = {
  id: number;
  planName: string;
  durationDays: number;
  price: number;
};

type BookingPaymentResponse = {
  bookingId: number;
  status: string;
  walletBalance: number;
  message?: string;
  mergedIntoBookingId?: number | null;
};

type ActiveSessionResponse = {
  sessionId: number;
  bookingId: number;
  pcId: number;
  pcLocation: string;
  startedAt: string;
  expectedEndTime: string;
  remainingSeconds: number;
  warning15Minutes: boolean;
  status: string;
  message: string;
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

const statusConfig = {
  pending: {
    label: "Awaiting payment",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/50",
  },
  active: {
    label: "Active",
    className: "bg-accent/20 text-accent border-accent/50",
  },
  paid: {
    label: "Paid",
    className: "bg-blue-500/20 text-blue-500 border-blue-500/50",
  },
  waiting: {
    label: "Waiting for machine",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  },
  expired: {
    label: "Expired",
    className: "bg-secondary/20 text-secondary border-secondary/50",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const normalizeBookingStatus = (value?: string | null) => {
  const normalized = (value ?? "").toLowerCase();
  return normalized === "completed" ? "expired" : normalized;
};

const POLL_MS = 15_000;

export function RentalHistory() {
  const navigate = useNavigate();
  const [items, setItems] = useState<BookingHistoryItemResponse[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [statusFilter, setStatusFilter] = useState<
    "all" | "paid" | "active" | "expired" | "cancelled"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [payingBookingId, setPayingBookingId] = useState<number | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [confirmBooking, setConfirmBooking] =
    useState<BookingHistoryItemResponse | null>(null);
  const [cancelBookingTarget, setCancelBookingTarget] =
    useState<BookingHistoryItemResponse | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(
    null,
  );

  const loadData = useCallback(async (mode: "full" | "silent" = "full") => {
    if (mode === "full") {
      setIsLoading(true);
      setLoadError(null);
    }
    try {
      const [page, wallet, activeSession] = await Promise.all([
        apiGet<PageResponse<BookingHistoryItemResponse>>("/bookings/my", {
          page: 0,
          size: 50,
        }),
        apiGet<{ walletId: number; balance: number }>("/wallet").catch(
          () => null,
        ),
        apiGet<ActiveSessionResponse>("/sessions/current").catch(() => null),
      ]);
      setItems(page.content ?? []);
      if (wallet) setWalletBalance(Number(wallet.balance));
      setActiveBookingId(activeSession?.bookingId ?? null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load bookings";
      if (mode === "full") {
        setLoadError(msg);
        toast.error(msg);
      }
    } finally {
      if (mode === "full") setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await loadData("full");
    })();
    return () => {
      cancelled = true;
    };
  }, [loadData]);

  useEffect(() => {
    const id = window.setInterval(() => {
      loadData("silent");
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [loadData]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") loadData("silent");
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loadData]);


  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const status = normalizeBookingStatus(item.status);
      if (status === "pending") return false;
      if (statusFilter === "all") return true;
      if (statusFilter === "active") {
        return status === "active" || activeBookingId === item.bookingId;
      }
      return status === statusFilter;
    });
  }, [items, statusFilter, activeBookingId]);

  const formatCountdown = (endIso: string | null) => {
    if (!endIso) return null;
    const remainingMs = new Date(endIso).getTime() - now;
    if (!Number.isFinite(remainingMs)) return null;
    const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
    }
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  };

  const handleConfirmPay = async () => {
    if (!confirmBooking || payingBookingId !== null) return;
    const id = confirmBooking.bookingId;
    setPayingBookingId(id);
    try {
      const res = await apiPost<BookingPaymentResponse>(
        `/bookings/${id}/pay-wallet`,
      );
      setWalletBalance(Number(res.walletBalance));
      setItems((prev) =>
        prev.map((b) =>
          b.bookingId === id ? { ...b, status: res.status ?? "paid" } : b,
        ),
      );
      toast.success(res.message || "Payment completed from your wallet");
      setConfirmBooking(null);
      await loadData("silent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPayingBookingId(null);
    }
  };

  const handleRenewBooking = async (booking: BookingHistoryItemResponse) => {
    if (!booking.specId) {
      toast.error("Missing machine group for renew");
      return;
    }

    try {
      const planId = booking.planId ?? null;
      let resolvedPlanId = planId;

      if (resolvedPlanId === null) {
        const plans = await apiGet<SubscriptionPlanPriceResponse[]>(
          `/pcs/specs/${booking.specId}/plans`,
        );
        resolvedPlanId = plans[0]?.id ?? null;
      }

      if (resolvedPlanId === null) {
        toast.error("No active subscription plans are configured for this machine group");
        return;
      }

      const created = await apiPost<
        BookingResponseDto,
        { specId: number; planId: number; quantity: number }
      >("/bookings/subscription", {
        specId: booking.specId,
        planId: resolvedPlanId,
        quantity: 1,
      });

      toast.success("Renewal order created");
      navigate("/checkout", { state: { bookingId: created.bookingId } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not renew booking");
    }
  };

  const handleConfirmCancelRental = async () => {
    if (!cancelBookingTarget || cancellingBookingId !== null) return;
    const id = cancelBookingTarget.bookingId;
    setCancellingBookingId(id);
    try {
      await apiPost<BookingResponseDto>(`/bookings/${id}/cancel`);
      toast.success("Plan cancelled. You can renew it anytime.");
      window.dispatchEvent(new Event("cartUpdated"));
      setCancelBookingTarget(null);
      const prevStatus = normalizeBookingStatus(cancelBookingTarget.status);
      if (prevStatus === "paid") {
        setItems((prev) =>
          prev.map((b) => (b.bookingId === id ? { ...b, status: "cancelled" } : b)),
        );
      } else {
        setItems((prev) => prev.filter((b) => b.bookingId !== id));
      }
      await loadData("silent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not cancel rental");
    } finally {
      setCancellingBookingId(null);
    }
  };

  const price = confirmBooking ? Number(confirmBooking.totalPrice ?? 0) : 0;
  const balanceAfter = walletBalance !== null ? walletBalance - price : null;
  const payRemaining = confirmBooking?.remainingMinutes;
  const cancelRemainingHours = cancelBookingTarget?.endTime
    ? Math.max(0, Math.ceil((new Date(cancelBookingTarget.endTime).getTime() - now) / 36e5))
    : cancelBookingTarget?.totalHours ?? null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          My
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {" "}
            transactions
          </span>
        </h1>
        <p className="text-muted-foreground">
          Track active sessions, renewals, and past subscriptions in one place.
        </p>
      </div>

      <Card className="p-4 border-border mb-4 bg-card/40">
        <div className="flex flex-wrap items-center gap-2">
          {["all", "paid", "active", "expired", "cancelled"].map((key) => {
            const active = statusFilter === key;
            return (
              <Button
                key={key}
                type="button"
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setStatusFilter(
                    key as "all" | "paid" | "active" | "expired" | "cancelled",
                  )
                }
                className={
                  active
                    ? "bg-primary text-primary-foreground"
                    : "border-border"
                }
              >
                {key === "all" ? "All" : key[0].toUpperCase() + key.slice(1)}
              </Button>
            );
          })}
        </div>
      </Card>

      <AlertDialog
        open={!!confirmBooking}
        onOpenChange={(open) => !open && setConfirmBooking(null)}
      >
        <AlertDialogContent className="border-border bg-card max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Confirm wallet payment
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left">
                <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-foreground">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-destructive mt-0.5" />
                  <div>
                    <strong>Non-refundable:</strong> After this payment is
                    completed, amounts are not refunded to your wallet.
                  </div>
                </div>
                {payRemaining != null && payRemaining > 0 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    If you do not pay in time, this order may be cancelled
                    automatically. Approximately <strong>{payRemaining}</strong>{" "}
                    minute(s) remaining before automatic cancellation.
                  </p>
                )}
                {(payRemaining == null || payRemaining <= 0) && (
                  <p className="text-sm text-muted-foreground">
                    Complete payment soon to keep your reservation. You can
                    cancel this dialog without being charged.
                  </p>
                )}
                <p>
                  You are paying order{" "}
                  <strong>#{confirmBooking?.bookingId}</strong> —{" "}
                  <strong>{confirmBooking?.specName}</strong>.
                </p>
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-money">
                      {formatUsd(price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Current balance
                    </span>
                    <span className="font-medium text-money">
                      {walletBalance === null ? "—" : formatUsd(walletBalance)}
                    </span>
                  </div>
                  {balanceAfter !== null && (
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground">
                        Balance after payment
                      </span>
                      <span className="font-bold text-money">
                        {formatUsd(balanceAfter)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="border-border">
              Cancel (no charge)
            </AlertDialogCancel>
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
                "Pay with wallet"
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
              Cancel this rental?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-left text-sm">
                <p>
                  Order <strong>#{cancelBookingTarget?.bookingId}</strong> —{" "}
                  <strong>{cancelBookingTarget?.specName}</strong> will be
                  cancelled. You will not be charged for unpaid orders.
                </p>
                <p className="text-muted-foreground">
                  Remaining time: <strong>{cancelRemainingHours ?? "—"}</strong> hour(s).
                </p>
                <p className="text-muted-foreground">
                  If you change your mind, you can create a new booking from the
                  home page.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="border-border">
              Keep order
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmCancelRental}
              disabled={cancellingBookingId !== null}
            >
              {cancellingBookingId !== null ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelling…
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Cancel rental
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4">
        {isLoading && (
          <Card className="p-12 border-border text-center">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Loading bookings…</p>
          </Card>
        )}

        {!isLoading && loadError && (
          <Card className="p-12 border-border text-center">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{loadError}</p>
          </Card>
        )}

        {visibleItems.map((rental) => {
          const key = normalizeBookingStatus(rental.status);
          const isQueued = !!rental.queued;
          const cfg = isQueued
            ? statusConfig.waiting
            : key in statusConfig
              ? statusConfig[key as keyof typeof statusConfig]
              : {
                  label: rental.status ?? "N/A",
                  className: "bg-muted text-muted-foreground border-border",
                };
          const start = rental.startTime ? new Date(rental.startTime) : null;
          const end = rental.endTime ? new Date(rental.endTime) : null;
          const duration =
            start && end
              ? `${Math.max(0, Math.round((end.getTime() - start.getTime()) / 36e5))} h`
              : "—";
          const pendingCountdown = rental.pendingExpiresAt
            ? formatCountdown(rental.pendingExpiresAt)
            : null;

          const isPending = key === "pending";
          const isActive =
            key === "active" || activeBookingId === rental.bookingId;
          const isPaid = key === "paid" && !isActive;
          const isExpired = key === "expired";
          const total = Number(rental.totalPrice ?? 0);
          const insufficient =
            isPending &&
            total > 0 &&
            walletBalance !== null &&
            walletBalance < total;
          const canOpenPay = isPending && total > 0 && !insufficient;
          return (
            <Card
              key={rental.bookingId}
              className="p-6 border-border hover:border-primary/50 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-bold">{rental.specName}</h3>
                  </div>

                  {isQueued && (
                    <p className="text-sm text-orange-400 mb-2">
                      Waiting for a machine from the subscription pool
                      {rental.queuePosition
                        ? ` — queue position #${rental.queuePosition}`
                        : ""}
                      .
                    </p>
                  )}

                  {isPending && pendingCountdown && (
                    <p className="text-sm text-amber-500 mb-2">
                      Auto-cancel in <strong>about {pendingCountdown}</strong>{" "}
                      if you do not pay yet.
                    </p>
                  )}

                  {!isPending && (
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Start:</span>
                        <span className="font-medium">
                          {start ? start.toLocaleString("en-US") : "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">End:</span>
                        <span className="font-medium">
                          {end ? end.toLocaleString("en-US") : "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{duration}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-end gap-3 lg:min-w-[200px]">
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-2xl font-bold text-money">
                      {formatUsd(total)}
                    </div>
                  </div>

                  {isPending && (
                    <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[180px]">
                      {canOpenPay ? (
                        <Button
                          onClick={() => setConfirmBooking(rental)}
                          disabled={
                            payingBookingId !== null ||
                            cancellingBookingId !== null
                          }
                          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        >
                          {payingBookingId === rental.bookingId ? (
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
                      ) : insufficient ? (
                        <>
                          <Button disabled className="w-full opacity-60">
                            <Wallet className="w-4 h-4 mr-2" />
                            Insufficient balance
                          </Button>
                          <Link
                            to="/account/top-up"
                            className="text-center text-sm text-primary hover:underline"
                          >
                            Top up wallet
                          </Link>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground text-right sm:text-left">
                          This order cannot be paid (invalid amount).
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCancelBookingTarget(rental)}
                        disabled={
                          payingBookingId !== null ||
                          cancellingBookingId !== null
                        }
                        className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel plan
                      </Button>
                    </div>
                  )}

                  {isPaid && (
                    <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[180px]">
                      <Button
                        onClick={() => setCancelBookingTarget(rental)}
                        disabled={
                          payingBookingId !== null ||
                          cancellingBookingId !== null
                        }
                        className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-500/90 hover:to-orange-500/90"
                      >
                        {cancellingBookingId === rental.bookingId ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Cancelling…
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel plan
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-right sm:text-left">
                        Start sessions and active session controls are managed in My PCs.
                      </p>
                    </div>
                  )}

                  {(isExpired || key === "cancelled") && (
                    <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[180px]">
                      <Button
                        onClick={() => handleRenewBooking(rental)}
                        disabled={cancellingBookingId !== null}
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                      >
                        {cancellingBookingId === rental.bookingId ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Renewing…
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Renew
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-right sm:text-left">
                        Renew and continue in checkout.
                      </p>
                    </div>
                  )}

                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {!isLoading && !loadError && visibleItems.length === 0 && (
        <Card className="p-12 border-border text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No transactions yet</h3>
          <p className="text-muted-foreground">
            Choose a subscription plan on the home page to get started.
          </p>
        </Card>
      )}
    </div>
  );
}
