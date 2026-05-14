import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertTriangle,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  CreditCard as CheckoutIcon,
  Wallet,
  XCircle,
  Cpu,
  Zap,
  MemoryStick,
  HardDrive,
  Monitor,
} from "lucide-react";
import { apiGet, apiPost } from "../api/http";
import { toast } from "sonner";
import { formatUsd } from "../lib/formatUsd";

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

type MachineListItemResponse = {
  pcId: number;
  specId: number;
  specName: string;
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
  hourlyPrice: number | string;
  location: string;
  status?: string;
};

type PcConfigOption = {
  pcId: number;
  specId: number;
  specName: string;
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
  hourlyPrice: number;
  location: string;
  machineCount: number;
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
  configOptions: PcConfigOption[];
  selectedConfigSpecId: number | null;
  planOptions: SubscriptionPlanPriceResponse[];
  selectedPlanId: number | null;
  quantity: number;
  originalQuantity: number;
};

type TierKey = "basic" | "pro" | "ultra";

const SPEC_TO_TIER_MAP: Record<number, TierKey> = {
  1: "basic",
  2: "basic",
  3: "pro",
  4: "pro",
  5: "ultra",
  6: "ultra",
};

const getTierKeyFromSpecId = (specId: number | null | undefined): TierKey | null => {
  if (specId == null) return null;
  return SPEC_TO_TIER_MAP[specId] ?? null;
};

const buildConfigOptions = (machines: MachineListItemResponse[], specId: number) => {
  const tierKey = getTierKeyFromSpecId(specId);
  const filtered = machines.filter((machine) => {
    if (tierKey) return getTierKeyFromSpecId(machine.specId) === tierKey;
    return machine.specId === specId;
  });

  const grouped = new Map<string, PcConfigOption>();

  for (const machine of filtered) {
    const key = `${machine.specId}-${machine.specName}-${machine.cpu}-${machine.gpu}-${machine.ram}-${machine.storage}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.machineCount += 1;
      continue;
    }

    grouped.set(key, {
      pcId: machine.pcId,
      specId: machine.specId,
      specName: machine.specName,
      cpu: machine.cpu,
      gpu: machine.gpu,
      ram: machine.ram,
      storage: machine.storage,
      hourlyPrice: Number(machine.hourlyPrice),
      location: machine.location,
      machineCount: 1,
    });
  }

  return Array.from(grouped.values()).sort((a, b) => Number(a.specId) - Number(b.specId));
};

const pickBestPlan = (
  plans: SubscriptionPlanPriceResponse[],
  preferredPlanId: number | null,
  totalPrice: number,
) => {
  const directMatch = preferredPlanId ? plans.find((plan) => plan.id === preferredPlanId) ?? null : null;
  if (directMatch) return directMatch;

  let matchedPlan: SubscriptionPlanPriceResponse | null = null;
  let bestScore = Infinity;

  for (const plan of plans) {
    const unitPrice = Number(plan.price ?? 0);
    if (!unitPrice) continue;
    const inferred = Number(totalPrice ?? 0) / unitPrice;
    if (!Number.isFinite(inferred)) continue;
    const roundedQty = Math.max(1, Math.round(inferred));
    const distanceFromWhole = Math.abs(inferred - roundedQty);
    const distanceFromOne = Math.abs(roundedQty - 1);
    const score = distanceFromOne * 100 + distanceFromWhole * 10;

    if (score < bestScore) {
      bestScore = score;
      matchedPlan = plan;
    }
  }

  return matchedPlan ?? plans[0] ?? null;
};

const normalizeBookingStatus = (value?: string | null) => {
  const normalized = (value ?? "").toLowerCase();
  return normalized === "completed" ? "expired" : normalized;
};

export function CheckoutPage() {
  const [items, setItems] = useState<BookingHistoryItemResponse[]>([]);
  const [bookingDrafts, setBookingDrafts] = useState<Record<number, BookingDraftState>>({});
  const [availableMachines, setAvailableMachines] = useState<MachineListItemResponse[]>([]);
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
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isTopUpSubmitting, setIsTopUpSubmitting] = useState(false);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [page, wallet, machinesPage] = await Promise.all([
        apiGet<PageResponse<BookingHistoryItemResponse>>("/bookings/my", { page: 0, size: 50 }),
        apiGet<{ walletId: number; balance: number }>("/wallet").catch(() => null),
        apiGet<PageResponse<MachineListItemResponse>>("/pcs", { page: 0, size: 200, sort: "price_asc" }).catch(() => null),
      ]);
      const pending = (page.content ?? []).filter(
        (item) => normalizeBookingStatus(item.status) === "pending",
      );
      setItems(pending);
      if (wallet) setWalletBalance(Number(wallet.balance));
      const machineItems = (machinesPage?.content ?? []).map((machine) => ({
        ...machine,
        hourlyPrice: typeof machine.hourlyPrice === "string" ? parseFloat(machine.hourlyPrice) : Number(machine.hourlyPrice),
      }));
      setAvailableMachines(machineItems);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load checkout";
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
            return [item.bookingId, { configOptions: [], selectedConfigSpecId: null, planOptions: [], selectedPlanId: null, quantity: 1, originalQuantity: 1 }] as const;
          }

          try {
            const configOptions = buildConfigOptions(availableMachines, item.specId);
            const selectedConfigSpecId = configOptions.find((config) => config.specId === item.specId)?.specId ?? configOptions[0]?.specId ?? null;
            const plans = selectedConfigSpecId
              ? await apiGet<SubscriptionPlanPriceResponse[]>(`/pcs/specs/${selectedConfigSpecId}/plans`)
              : [];

            const matchedPlan = pickBestPlan(plans, item.planId, Number(item.totalPrice ?? 0));
            const inferredQuantity = matchedPlan
              ? Math.max(1, Math.round(Number(item.totalPrice ?? 0) / Number(matchedPlan.price ?? 1)))
              : 1;

            return [item.bookingId, {
              configOptions,
              selectedConfigSpecId,
              planOptions: plans,
              selectedPlanId: matchedPlan?.id ?? null,
              quantity: inferredQuantity,
              originalQuantity: inferredQuantity,
            }] as const;
          } catch {
            const configOptions = buildConfigOptions(availableMachines, item.specId);
            return [item.bookingId, {
              configOptions,
              selectedConfigSpecId: configOptions.find((config) => config.specId === item.specId)?.specId ?? configOptions[0]?.specId ?? null,
              planOptions: [],
              selectedPlanId: null,
              quantity: 1,
              originalQuantity: 1,
            }] as const;
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
  }, [items, availableMachines]);

  const focusedBookingId = useMemo(() => {
    const bookingId = location.state?.bookingId;
    if (!bookingId) return null;
    const focusId = Number(bookingId);
    return Number.isFinite(focusId) ? focusId : null;
  }, [location.state]);

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
      const selectedConfigSpecId = focusedDraft?.selectedConfigSpecId ?? focusedBooking?.specId ?? null;
      const shouldRecreateBooking =
        isFocusedOrder &&
        selectedConfigSpecId !== null &&
        focusedPlan &&
        (selectedConfigSpecId !== focusedBooking?.specId || previewQuantity !== (focusedDraft?.originalQuantity ?? previewQuantity));

      if (shouldRecreateBooking) {
        const created = await apiPost<BookingResponseDto, { specId: number; planId: number; quantity: number }>(
          "/bookings/subscription",
          {
            specId: selectedConfigSpecId,
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
      setPaymentSuccess(true);
      setCountdown(5);
      setConfirmBooking(null);
      await loadData();
      useEffect(() => {
        if (!paymentSuccess) return;
        let timer = window.setInterval(() => {
          setCountdown((c) => {
            if (c <= 1) {
              window.clearInterval(timer);
              navigate("/account/mypcs");
              return 0;
            }
            return c - 1;
          });
        }, 1000);

        return () => {
          window.clearInterval(timer);
        };
      }, [paymentSuccess, navigate]);

      if (paymentSuccess) {
        return (
          <div className="min-h-screen flex flex-col">
            <main className="flex-1 pt-24 pb-12 bg-muted/30">
              <div className="container mx-auto px-4 max-w-5xl">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      Secure
                      <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        {" "}
                        Checkout
                      </span>
                    </h1>
                    <p className="text-muted-foreground">Review your order and complete payment to activate your Cloud PC.</p>
                  </div>
                  <Button variant="outline" className="border-border" onClick={() => setShowReturnConfirm(true)}>
                    Return to plans
                  </Button>
                </div>

                <Card className="p-12 border-border text-center">
                  <CheckoutIcon className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl font-bold mb-2">Payment successful</h3>
                  <p className="text-muted-foreground mb-4">Redirecting to My PCs in {countdown} second{countdown === 1 ? "" : "s"}...</p>
                  <Button className="bg-gradient-to-r from-primary to-accent" onClick={() => navigate("/account/mypcs")}>Go to My PCs</Button>
                </Card>
              </div>
            </main>
          </div>
        );
      }
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
          redirectTo: "/checkout",
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

  const handleConfirmReturn = async () => {
    if (focusedBooking && cancellingBookingId === null) {
      setCancellingBookingId(focusedBooking.bookingId);
      try {
        await apiPost<BookingResponseDto>(`/bookings/${focusedBooking.bookingId}/cancel`);
        toast.success("Order cancelled");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not cancel order");
      } finally {
        setCancellingBookingId(null);
        setShowReturnConfirm(false);
        navigate("/packages");
      }
    } else {
      setShowReturnConfirm(false);
      navigate("/packages");
    }
  };

  const canShowFocusedSummary = !!focusedBooking && !!focusedPlan;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-24 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Secure
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  {" "}
                  Checkout
                </span>
              </h1>
              <p className="text-muted-foreground">
                Review your order and complete payment to activate your Cloud PC.
              </p>
            </div>
            <Button variant="outline" className="border-border" onClick={() => setShowReturnConfirm(true)}>
              Return to plans
            </Button>
          </div>

          {isLoading && (
            <Card className="p-10 border-border text-center">
              <CheckoutIcon className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading checkout…</p>
            </Card>
          )}

          {!isLoading && loadError && (
            <Card className="p-10 border-border text-center">
              <CheckoutIcon className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">{loadError}</p>
            </Card>
          )}

          {!isLoading && !loadError && items.length === 0 && (
            <Card className="p-12 border-border text-center">
              <CheckoutIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No pending orders</h3>
              <p className="text-muted-foreground mb-4">
                Choose a subscription tier to get started.
              </p>
              <Button asChild className="bg-gradient-to-r from-primary to-accent">
                <Link to="/packages" className="text-white hover:opacity-90">
                  Browse packages
                </Link>
              </Button>
            </Card>
          )}

          {!isLoading && !loadError && items.length > 0 && canShowFocusedSummary && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] items-start shadow-2xl  ">
              <div className="space-y-6">
                {[focusedBooking].filter((b): b is BookingHistoryItemResponse => b !== null).map((item) => {
                  const draft = bookingDrafts[item.bookingId];
                  const itemConfig = draft?.configOptions.find((config) => config.specId === draft.selectedConfigSpecId) ?? draft?.configOptions[0] ?? null;
                  const itemPlan = draft?.planOptions.find((plan) => plan.id === draft.selectedPlanId) ?? draft?.planOptions[0] ?? null;
                  const itemQuantity = Math.max(1, Math.floor(draft?.quantity || 1));
                  const itemPreviewDays = itemPlan ? itemPlan.durationDays * itemQuantity : 0;
                  const itemTotal = itemPlan ? Number(itemPlan.price ?? 0) * itemQuantity : Number(item.totalPrice ?? 0);
                  return (
                    <Card key={item.bookingId} className="p-0 border-border overflow-hidden shadow-md bg-card/70">
                      <div className="border-b border-border px-5 py-4 bg-muted/20">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Product information</p>
                            <h3 className="text-2xl font-bold">{itemPlan?.planName ?? item.specName}</h3>
                          </div>
                          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowConfigDialog(true)}
                              disabled={cancellingBookingId !== null}
                              className="border-border text-primary hover:bg-primary/10 hover:text-primary"
                              
                            >
                              Choose configuration
                            </Button>
                            <Select
                              value={itemPlan?.id?.toString() ?? ""}
                              onValueChange={(val) => {
                                setBookingDrafts((current) => ({
                                  ...current,
                                  [item.bookingId]: {
                                    ...(current[item.bookingId] ?? {
                                      configOptions: draft?.configOptions ?? [],
                                      selectedConfigSpecId: draft?.selectedConfigSpecId ?? null,
                                      planOptions: draft?.planOptions ?? [],
                                      selectedPlanId: itemPlan?.id ?? null,
                                      quantity: 1,
                                      originalQuantity: 1,
                                    }),
                                    selectedPlanId: Number(val),
                                  },
                                }));
                              }}
                            >
                              <SelectTrigger className="w-[140px] bg-background border-border">
                                <SelectValue placeholder="Select period" />
                              </SelectTrigger>
                              <SelectContent>
                                {draft?.planOptions.map((plan) => (
                                  <SelectItem key={plan.id} value={plan.id.toString()}>
                                    {plan.durationDays >= 365 ? "Yearly" : plan.durationDays >= 28 ? "Monthly" : "Weekly"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {itemConfig && (
                          <div className="mt-4 rounded-xl border border-border bg-background/60 p-4">
                            <div className="font-semibold text-foreground mb-3 flex items-center gap-2">
                              <Monitor className="w-4 h-4 text-primary" />
                              Configuration: <span className="text-primary">{itemConfig.specName}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Cpu className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-foreground">{itemConfig.cpu}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Zap className="w-4 h-4 text-secondary shrink-0" />
                                <span className="text-foreground">{itemConfig.gpu}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MemoryStick className="w-4 h-4 text-accent shrink-0" />
                                <span className="text-foreground">{itemConfig.ram} GB</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <HardDrive className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-foreground">{itemConfig.storage} GB</span>
                              </div>
                            </div>
                          </div>
                        )}
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
                                        configOptions: draft?.configOptions ?? [],
                                        selectedConfigSpecId: draft?.selectedConfigSpecId ?? null,
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
                                        configOptions: draft?.configOptions ?? [],
                                        selectedConfigSpecId: draft?.selectedConfigSpecId ?? null,
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
                                        configOptions: draft?.configOptions ?? [],
                                        selectedConfigSpecId: draft?.selectedConfigSpecId ?? null,
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

                          <div className="rounded-lg border border-border bg-background p-4 space-y-2 text-sm items-center ">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-muted-foreground">Total days</p>
                              <p className="font-semibold text-white">{itemPreviewDays} days</p>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-muted-foreground">Amount</span>
                              <span className="font-semibold text-red-500">{formatUsd(itemTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Card className="p-5 border-border bg-card/70 lg:sticky lg:top-24">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p>Wallet balance</p>
                      <p className="text-3xl font-bold text-money">{walletBalance === null ? "—" : formatUsd(walletBalance)}</p>
                  </div>
                  <div className="text-right text-muted-foreground">
                    <p className="text-sm text-muted-foreground">Amount of payment</p>
                    <p className="text-2xl font-semibold text-red-500">{formatUsd(previewTotal)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 text-sm mb-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Unit price</span>
                    <span className="font-medium text-red-500">{focusedPlan ? formatUsd(Number(focusedPlan.price ?? 0)) : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Preview days</span>
                    <span className="font-medium">{previewDays} days</span>
                  </div>
                </div>

                {walletBalance !== null && previewTotal > walletBalance ? (
                  <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 mb-4 text-sm flex items-start gap-3">
                    <AlertTriangle className="w-8 h-8 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">Insufficient balance</p>
                      <p className="text-muted-foreground">Your wallet balance is not enough for this configuration yet. You can top up now and complete payment when ready.</p>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3">
                  {/* Combined button: Top up when insufficient, Finalize when enough */}
                  <Button
                    type="button"
                    onClick={() => {
                      if (walletBalance !== null && previewTotal <= walletBalance) {
                        setConfirmBooking(focusedBooking);
                      } else {
                        setShowTopUp(true);
                      }
                    }}
                    disabled={!focusedBooking || checkoutBusy || payingBookingId !== null}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    {checkoutBusy || payingBookingId !== null ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing…
                      </>
                    ) : walletBalance !== null && previewTotal <= walletBalance ? (
                      "Finalize the purchase"
                    ) : (
                      "Top up wallet"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCancelBookingTarget(focusedBooking)}
                    disabled={cancellingBookingId !== null || !focusedBooking}
                    className="w-full border-border text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>

                  <div className="flex items-center justify-between gap-3">
            
                    <div className="flex items-center gap-3 py-3 text-sm">
                      <Checkbox checked={receiveEmail} onCheckedChange={(checked) => setReceiveEmail(checked === true)} />
                      <span>Receive email receipt</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

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
                <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-foreground">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-destructive mt-0.5" />
                  <div>
                    <strong>Non-refundable:</strong> Payments are non-refundable once completed.
                  </div>
                </div>
                <p className="text-foreground">
                  You are paying order <strong>#{confirmBooking?.bookingId}</strong>
                  {" "}for <strong>{confirmBooking?.specName}</strong>.
                </p>
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm text-foreground">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-red-500 text-money">
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
                    <span className="text-muted-foreground">Balance After Payment</span>
                    <span className="font-medium text-money">
                      {walletBalance === null ? "—" : formatUsd(walletBalance - (focusedBooking?.bookingId === confirmBooking?.bookingId ? previewTotal : Number(confirmBooking?.totalPrice ?? 0)))}
                    </span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="border-border hover:text-red-500">Cancel</AlertDialogCancel>
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
            <AlertDialogDescription className="text-foreground">
              The order will be cancelled and no wallet funds will be charged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
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
              className="h-11 text-money font-semibold bg-input-background"
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

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-lg border-border bg-card">
          <DialogHeader>
            <DialogTitle>Choose configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {focusedDraft?.configOptions && focusedDraft.configOptions.length > 0 ? (
              focusedDraft.configOptions.map((config) => (
                <div
                  key={config.specId}
                  className={`flex items-center justify-between p-3 rounded-lg border ${config.specId === focusedDraft.selectedConfigSpecId ? "border-primary bg-primary/5" : "border-border bg-muted/10"}`}
                >
                  <div>
                    <div className="font-medium">{config.specName}</div>
                    <div className="text-sm text-muted-foreground">
                      {config.cpu} • {config.gpu} • {config.ram}GB RAM • {config.storage}GB SSD
                    </div>
                  </div>
                  <div>
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!focusedBooking) return;
                        try {
                          const plans = await apiGet<SubscriptionPlanPriceResponse[]>(`/pcs/specs/${config.specId}/plans`);
                          const matchedPlan = pickBestPlan(plans, focusedDraft?.selectedPlanId ?? null, Number(focusedBooking.totalPrice ?? 0));
                          setBookingDrafts((current) => ({
                            ...current,
                            [focusedBooking.bookingId]: {
                              ...(current[focusedBooking.bookingId] ?? {
                                configOptions: focusedDraft.configOptions,
                                selectedConfigSpecId: focusedDraft.selectedConfigSpecId,
                                planOptions: focusedDraft.planOptions,
                                selectedPlanId: focusedDraft.selectedPlanId,
                                quantity: focusedDraft.quantity,
                                originalQuantity: focusedDraft.originalQuantity,
                              }),
                              selectedConfigSpecId: config.specId,
                              planOptions: plans,
                              selectedPlanId: matchedPlan?.id ?? null,
                            },
                          }));
                          setShowConfigDialog(false);
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Could not load configuration plans");
                        }
                      }}
                      className="ml-2"
                    >
                      Select
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-muted-foreground">No configurations available.</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showReturnConfirm}
        onOpenChange={(open) => !open && setShowReturnConfirm(false)}
      >
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Return to plans?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              This will cancel your current pending order. Are you sure you want to go back?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="border-border">Keep order</AlertDialogCancel>
            <Button
              onClick={handleConfirmReturn}
              disabled={cancellingBookingId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancellingBookingId !== null ? "Cancelling…" : "Cancel & Return"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
