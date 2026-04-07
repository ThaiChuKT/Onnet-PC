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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Calendar,
  Clock,
  DollarSign,
  Play,
  Square,
  Loader2,
  Wallet,
  CreditCard,
  AlertTriangle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { apiGet, apiPost } from "../../api/http";
import { toast } from "sonner";

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

type StartSessionResponse = {
  sessionId: number;
  bookingId: number;
  pcId: number;
  pcLocation: string;
  startedAt: string;
  expectedEndTime: string;
  remainingSeconds: number;
  connectionInfo: string;
  status: string;
  message: string;
};

type EndSessionResponse = {
  sessionId: number;
  bookingId: number;
  endedAt: string;
  noRefundApplied: boolean;
  status: string;
  message: string;
};

type BookingResponseDto = {
  bookingId: number;
  status: string;
};

type RenewTarget = {
  booking: BookingHistoryItemResponse;
  plans: SubscriptionPlanPriceResponse[];
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
  completed: {
    label: "Expired",
    className: "bg-secondary/20 text-secondary border-secondary/50",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const POLL_MS = 15_000;

export function RentalHistory() {
  const [items, setItems] = useState<BookingHistoryItemResponse[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [payingBookingId, setPayingBookingId] = useState<number | null>(null);
  const [startingBookingId, setStartingBookingId] = useState<number | null>(
    null,
  );
  const [endingBookingId, setEndingBookingId] = useState<number | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [confirmBooking, setConfirmBooking] =
    useState<BookingHistoryItemResponse | null>(null);
  const [cancelBookingTarget, setCancelBookingTarget] =
    useState<BookingHistoryItemResponse | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(
    null,
  );
  const [renewTarget, setRenewTarget] = useState<RenewTarget | null>(null);
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewPlanId, setRenewPlanId] = useState<number | null>(null);
  const [renewingBookingId, setRenewingBookingId] = useState<number | null>(null);

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

  const completedCount = useMemo(
    () =>
      items.filter((i) => (i.status ?? "").toLowerCase() === "completed")
        .length,
    [items],
  );
  const pendingCount = useMemo(
    () =>
      items.filter((i) => (i.status ?? "").toLowerCase() === "pending").length,
    [items],
  );
  const totalSpent = useMemo(
    () =>
      items
        .filter((i) =>
          ["active", "paid", "completed"].includes(
            (i.status ?? "").toLowerCase(),
          ),
        )
        .reduce((sum, i) => sum + Number(i.totalPrice ?? 0), 0),
    [items],
  );

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

  const formatDurationLabel = (days: number | null | undefined) => {
    if (!days || days <= 0) return "Package";
    if (days === 7) return "Weekly";
    if (days === 30) return "Monthly";
    if (days === 365) return "Yearly";
    return `${days} days`;
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
      toast.success("Payment completed from your wallet");
      setConfirmBooking(null);
      await loadData("silent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPayingBookingId(null);
    }
  };

  const handleStartSession = async (bookingId: number) => {
    if (startingBookingId !== null || endingBookingId !== null) return;
    setStartingBookingId(bookingId);
    try {
      const res = await apiPost<StartSessionResponse>(
        `/bookings/${bookingId}/start-session`,
      );
      setActiveBookingId(res.bookingId ?? bookingId);
      setItems((prev) =>
        prev.map((b) =>
          b.bookingId === bookingId
            ? {
                ...b,
                status: "active",
                pcId: res.pcId ?? b.pcId,
              }
            : b,
        ),
      );
      toast.success(res.message || "Session started");
      await loadData("silent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start session");
    } finally {
      setStartingBookingId(null);
    }
  };

  const handleEndSession = async (bookingId: number) => {
    if (startingBookingId !== null || endingBookingId !== null) return;
    setEndingBookingId(bookingId);
    try {
      const res = await apiPost<EndSessionResponse>("/sessions/current/end");
      setActiveBookingId(null);
      setItems((prev) =>
        prev.map((b) =>
          b.bookingId === (res.bookingId ?? bookingId)
            ? {
                ...b,
                status: "completed",
              }
            : b,
        ),
      );
      toast.success(res.message || "Session ended");
      await loadData("silent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not end session");
    } finally {
      setEndingBookingId(null);
    }
  };

  const handleConfirmCancelRental = async () => {
    if (!cancelBookingTarget || cancellingBookingId !== null) return;
    const id = cancelBookingTarget.bookingId;
    setCancellingBookingId(id);
    try {
      await apiPost<BookingResponseDto>(`/bookings/${id}/cancel`);
      toast.success("Rental cancelled. You have not been charged.");
      setCancelBookingTarget(null);
      setItems((prev) =>
        prev.map((b) =>
          b.bookingId === id ? { ...b, status: "cancelled" } : b,
        ),
      );
      await loadData("silent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not cancel rental");
    } finally {
      setCancellingBookingId(null);
    }
  };

  const handleOpenRenew = async (booking: BookingHistoryItemResponse) => {
    if (!booking.specId) {
      toast.error("Missing machine group for renew");
      return;
    }
    setRenewLoading(true);
    setRenewPlanId(null);
    try {
      const plans = await apiGet<SubscriptionPlanPriceResponse[]>(
        `/pcs/specs/${booking.specId}/plans`,
      );
      setRenewTarget({ booking, plans });
      if (plans.length > 0) {
        setRenewPlanId(plans[0].id);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load renew plans");
    } finally {
      setRenewLoading(false);
    }
  };

  const handleConfirmRenew = async () => {
    if (!renewTarget || !renewPlanId || renewingBookingId !== null) return;
    const { booking } = renewTarget;
    setRenewingBookingId(booking.bookingId);
    try {
      await apiPost<BookingResponseDto, { specId: number; planId: number; quantity: number }>(
        "/bookings/subscription",
        {
          specId: booking.specId ?? 0,
          planId: renewPlanId,
          quantity: 1,
        },
      );
      toast.success("Renewal order created");
      setRenewTarget(null);
      setRenewPlanId(null);
      await loadData("silent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not renew booking");
    } finally {
      setRenewingBookingId(null);
    }
  };

  const price = confirmBooking ? Number(confirmBooking.totalPrice ?? 0) : 0;
  const balanceAfter = walletBalance !== null ? walletBalance - price : null;
  const payRemaining = confirmBooking?.remainingMinutes;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          My
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {" "}
            bookings
          </span>
        </h1>
        <p className="text-muted-foreground">
          Pay pending orders from your wallet, start sessions, and track rental
          periods
        </p>
      </div>

      {pendingCount > 0 && !isLoading && !loadError && (
        <Card className="p-6 border-border mb-6 bg-gradient-to-br from-primary/10 via-card to-accent/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-3 rounded-lg shrink-0">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold mb-1">Payment required</h2>
                <p className="text-sm text-muted-foreground">
                  You have{" "}
                  <span className="text-foreground font-semibold">
                    {pendingCount}
                  </span>{" "}
                  order(s) waiting for payment. Funds are taken from your
                  wallet.{" "}
                  <Link
                    to="/account/top-up"
                    className="text-primary hover:underline font-medium"
                  >
                    Top up
                  </Link>{" "}
                  if needed.
                </p>
              </div>
            </div>
            <div className="sm:text-right shrink-0">
              <p className="text-xs text-muted-foreground mb-1">
                Wallet balance
              </p>
              <p className="text-2xl font-bold text-primary">
                {walletBalance === null
                  ? "—"
                  : `${walletBalance.toLocaleString("en-US")} ₫`}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total orders</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-3 rounded-lg">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total spent</p>
              <p className="text-2xl font-bold text-accent">
                {totalSpent.toLocaleString("en-US")} ₫
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/20 p-3 rounded-lg">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expired</p>
              <p className="text-2xl font-bold text-secondary">
                {completedCount}
              </p>
            </div>
          </div>
        </Card>
      </div>

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
                    completed, amounts are not refunded to your wallet except
                    where required by policy or support.
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
                    <span className="font-bold text-primary">
                      {price.toLocaleString("en-US")} ₫
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Current balance
                    </span>
                    <span className="font-medium">
                      {walletBalance === null
                        ? "—"
                        : `${walletBalance.toLocaleString("en-US")} ₫`}
                    </span>
                  </div>
                  {balanceAfter !== null && (
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground">
                        Balance after payment
                      </span>
                      <span className="font-bold text-foreground">
                        {balanceAfter.toLocaleString("en-US")} ₫
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

      <Dialog
        open={renewLoading || !!renewTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRenewTarget(null);
            setRenewPlanId(null);
            setRenewLoading(false);
          }
        }}
      >
        <DialogContent className="border-border bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />
              Renew package
            </DialogTitle>
            <DialogDescription>
              Select a weekly, monthly, or yearly plan to create a new booking
              for the same machine group.
            </DialogDescription>
          </DialogHeader>

          {renewLoading && !renewTarget ? (
            <div className="py-10 flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading plans…
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
                <p className="font-medium mb-1">
                  {renewTarget?.booking.specName} renewal options
                </p>
                <p className="text-muted-foreground">
                  Order <strong>#{renewTarget?.booking.bookingId}</strong> will be renewed as a new
                  subscription booking.
                </p>
              </div>

              <div className="grid gap-3">
                {renewTarget?.plans.map((plan) => {
                  const selected = renewPlanId === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setRenewPlanId(plan.id)}
                      className={`text-left rounded-lg border p-4 transition-all ${
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{formatDurationLabel(plan.durationDays)}</p>
                          <p className="text-sm text-muted-foreground">{plan.planName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {Number(plan.price ?? 0).toLocaleString("en-US")} ₫
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {plan.durationDays} day(s)
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {renewTarget && renewTarget.plans.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No active subscription plans are configured for this machine group.
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setRenewTarget(null);
                setRenewPlanId(null);
              }}
              className="border-border"
            >
              Close
            </Button>
            <Button
              onClick={handleConfirmRenew}
              disabled={
                renewLoading ||
                !renewTarget ||
                !renewPlanId ||
                renewingBookingId !== null
              }
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {renewingBookingId !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating renewal…
                </>
              ) : (
                "Confirm renewal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

        {items.map((rental) => {
          const key = (rental.status ?? "").toLowerCase();
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
          const isCompleted = key === "completed";
          const total = Number(rental.totalPrice ?? 0);
          const insufficient =
            isPending &&
            total > 0 &&
            walletBalance !== null &&
            walletBalance < total;
          const canOpenPay = isPending && total > 0 && !insufficient;
          const canStart = isPaid && !isQueued && activeBookingId === null;
          const isBusy =
            payingBookingId === rental.bookingId ||
            startingBookingId === rental.bookingId ||
            endingBookingId === rental.bookingId ||
            cancellingBookingId === rental.bookingId;

          return (
            <Card
              key={rental.bookingId}
              className="p-6 border-border hover:border-primary/50 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-bold">{rental.specName}</h3>
                    <Badge className={cfg.className}>{cfg.label}</Badge>
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
                      Auto-cancel in <strong>about {pendingCountdown}</strong> if you
                      do not pay yet.
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
                    <div className="text-2xl font-bold text-primary">
                      {total.toLocaleString("en-US")} ₫
                    </div>
                  </div>

                  {isPending && (
                    <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[180px]">
                      {canOpenPay ? (
                        <Button
                          onClick={() => setConfirmBooking(rental)}
                          disabled={
                            payingBookingId !== null ||
                            startingBookingId !== null ||
                            endingBookingId !== null
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
                          startingBookingId !== null ||
                          endingBookingId !== null ||
                          cancellingBookingId !== null
                        }
                        className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel rental
                      </Button>
                    </div>
                  )}

                  {isPaid && (
                    <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[180px]">
                      <Button
                        onClick={() => handleStartSession(rental.bookingId)}
                        disabled={!canStart || isBusy}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-500/90 hover:to-cyan-500/90"
                      >
                        {startingBookingId === rental.bookingId ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Starting…
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start session
                          </>
                        )}
                      </Button>
                      {!canStart &&
                        activeBookingId !== null &&
                        activeBookingId !== rental.bookingId && (
                          <p className="text-xs text-muted-foreground text-right sm:text-left">
                            Another session is already active.
                          </p>
                        )}
                      {!canStart && isQueued && (
                        <p className="text-xs text-orange-400 text-right sm:text-left">
                          Order is queued; a machine will be assigned when a
                          slot is free.
                        </p>
                      )}
                    </div>
                  )}

                  {isCompleted && (
                    <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[180px]">
                      <Button
                        onClick={() => handleOpenRenew(rental)}
                        disabled={renewLoading || renewingBookingId !== null}
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                      >
                        {renewLoading && renewTarget?.booking.bookingId === rental.bookingId ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading plans…
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Renew package
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-right sm:text-left">
                        Renew with weekly, monthly, or yearly plans.
                      </p>
                    </div>
                  )}

                  {isActive && (
                    <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[180px]">
                      <Button
                        onClick={() => handleEndSession(rental.bookingId)}
                        disabled={isBusy}
                        className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-500/90 hover:to-orange-500/90"
                      >
                        {endingBookingId === rental.bookingId ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Ending…
                          </>
                        ) : (
                          <>
                            <Square className="w-4 h-4 mr-2" />
                            End session
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {!isLoading && !loadError && items.length === 0 && (
        <Card className="p-12 border-border text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
          <p className="text-muted-foreground">
            Choose a subscription plan on the home page to get started.
          </p>
        </Card>
      )}
    </div>
  );
}
