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
  Cpu,
  DollarSign,
  Play,
  Square,
  Loader2,
  Wallet,
  CreditCard,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { apiGet, apiPost } from "../../api/http";
import { toast } from "sonner";

type BookingHistoryItemResponse = {
  bookingId: number;
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
  createdAt: string;
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

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const statusConfig = {
  pending: {
    label: "Chờ thanh toán",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/50",
  },
  active: { label: "Đang hoạt động", className: "bg-accent/20 text-accent border-accent/50" },
  paid: { label: "Đã thanh toán", className: "bg-blue-500/20 text-blue-500 border-blue-500/50" },
  waiting: { label: "Đang chờ máy", className: "bg-orange-500/20 text-orange-400 border-orange-500/50" },
  completed: { label: "Hoàn thành", className: "bg-secondary/20 text-secondary border-secondary/50" },
  cancelled: { label: "Đã hủy", className: "bg-muted text-muted-foreground border-border" },
};

export function RentalHistory() {
  const [items, setItems] = useState<BookingHistoryItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [payingBookingId, setPayingBookingId] = useState<number | null>(null);
  const [startingBookingId, setStartingBookingId] = useState<number | null>(null);
  const [endingBookingId, setEndingBookingId] = useState<number | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [confirmBooking, setConfirmBooking] = useState<BookingHistoryItemResponse | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [page, wallet, activeSession] = await Promise.all([
        apiGet<PageResponse<BookingHistoryItemResponse>>("/bookings/my", { page: 0, size: 50 }),
        apiGet<{ walletId: number; balance: number }>("/wallet").catch(() => null),
        apiGet<ActiveSessionResponse>("/sessions/current").catch(() => null),
      ]);
      setItems(page.content ?? []);
      if (wallet) setWalletBalance(Number(wallet.balance));
      setActiveBookingId(activeSession?.bookingId ?? null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Không thể tải lịch sử thuê";
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await loadData();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadData]);

  const completedCount = useMemo(
    () => items.filter((i) => (i.status ?? "").toLowerCase() === "completed").length,
    [items],
  );
  const pendingCount = useMemo(
    () => items.filter((i) => (i.status ?? "").toLowerCase() === "pending").length,
    [items],
  );
  const totalSpent = useMemo(
    () =>
      items
        .filter((i) => ["active", "paid", "completed"].includes((i.status ?? "").toLowerCase()))
        .reduce((sum, i) => sum + Number(i.totalPrice ?? 0), 0),
    [items],
  );

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
      toast.success("Thanh toán đơn hàng bằng ví thành công");
      setConfirmBooking(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể thanh toán");
    } finally {
      setPayingBookingId(null);
    }
  };

  const handleStartSession = async (bookingId: number) => {
    if (startingBookingId !== null || endingBookingId !== null) return;
    setStartingBookingId(bookingId);
    try {
      const res = await apiPost<StartSessionResponse>(`/bookings/${bookingId}/start-session`);
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
      toast.success(res.message || "Bắt đầu session thành công");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể bắt đầu session");
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
      toast.success(res.message || "Kết thúc session thành công");
      await loadData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể kết thúc session");
    } finally {
      setEndingBookingId(null);
    }
  };

  const price = confirmBooking ? Number(confirmBooking.totalPrice ?? 0) : 0;
  const balanceAfter =
    walletBalance !== null ? walletBalance - price : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Lịch Sử
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {" "}
            Thuê Máy
          </span>
        </h1>
        <p className="text-muted-foreground">
          Xem đơn hàng và thanh toán bằng ví cho các đơn đang chờ
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
                <h2 className="text-lg font-bold mb-1">Thanh toán đơn hàng</h2>
                <p className="text-sm text-muted-foreground">
                  Bạn có{" "}
                  <span className="text-foreground font-semibold">{pendingCount}</span> đơn
                  chờ thanh toán. Số tiền sẽ được trừ từ ví.{" "}
                  <Link
                    to="/account/top-up"
                    className="text-primary hover:underline font-medium"
                  >
                    Nạp thêm
                  </Link>{" "}
                  nếu cần.
                </p>
              </div>
            </div>
            <div className="sm:text-right shrink-0">
              <p className="text-xs text-muted-foreground mb-1">Số dư ví hiện tại</p>
              <p className="text-2xl font-bold text-primary">
                {walletBalance === null ? "—" : `${walletBalance.toLocaleString("vi-VN")}đ`}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
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
              <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-accent">
                {totalSpent.toLocaleString("vi-VN")}đ
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
              <p className="text-sm text-muted-foreground">Hoàn thành</p>
              <p className="text-2xl font-bold text-secondary">
                {completedCount}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <AlertDialog open={!!confirmBooking} onOpenChange={(open) => !open && setConfirmBooking(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Xác nhận thanh toán
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left">
                <p>
                  Bạn sắp thanh toán đơn <strong>#{confirmBooking?.bookingId}</strong> —{" "}
                  <strong>{confirmBooking?.specName}</strong>.
                </p>
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số tiền</span>
                    <span className="font-bold text-primary">
                      {price.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số dư hiện tại</span>
                    <span className="font-medium">
                      {walletBalance === null ? "—" : `${walletBalance.toLocaleString("vi-VN")}đ`}
                    </span>
                  </div>
                  {balanceAfter !== null && (
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground">Số dư sau thanh toán</span>
                      <span className="font-bold text-foreground">
                        {balanceAfter.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Hủy</AlertDialogCancel>
            <Button
              onClick={handleConfirmPay}
              disabled={payingBookingId !== null}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {payingBookingId !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Thanh toán"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* History List */}
      <div className="space-y-4">
        {isLoading && (
          <Card className="p-12 border-border text-center">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Đang tải lịch sử thuê...</p>
          </Card>
        )}

        {!isLoading &&
          loadError && (
            <Card className="p-12 border-border text-center">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{loadError}</p>
            </Card>
          )}

        {items.map((rental) => {
          const key = (rental.status ?? "").toLowerCase();
          const isQueued = !!rental.queued;
          const cfg =
            isQueued
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
            start && end ? `${Math.max(0, Math.round((end.getTime() - start.getTime()) / 36e5))} giờ` : "—";

          const isPending = key === "pending";
          const isActive = key === "active" || activeBookingId === rental.bookingId;
          const isPaid = key === "paid" && !isActive;
          const total = Number(rental.totalPrice ?? 0);
          const insufficient =
            isPending &&
            total > 0 &&
            walletBalance !== null &&
            walletBalance < total;
          const canOpenPay =
            isPending && total > 0 && !insufficient;
          const canStart = isPaid && !isQueued && activeBookingId === null;
          const isBusy =
            payingBookingId === rental.bookingId ||
            startingBookingId === rental.bookingId ||
            endingBookingId === rental.bookingId;

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

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    <span>PC: {rental.pcId ?? "—"}</span>
                  </div>

                  {isQueued && (
                    <p className="text-sm text-orange-400 mb-2">
                      Đang chờ cấp máy từ pool gói subscription
                      {rental.queuePosition ? ` - vị trí #${rental.queuePosition}` : ""}.
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Ngày thuê:</span>
                      <span className="font-medium">
                        {start ? start.toLocaleDateString("vi-VN") : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Thời gian:</span>
                      <span className="font-medium">{duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-end gap-3 lg:min-w-[200px]">
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-2xl font-bold text-primary">
                      {total.toLocaleString("vi-VN")}đ
                    </div>
                    <div className="text-xs text-muted-foreground">Mã: {rental.bookingId}</div>
                  </div>

                  {isPending && (
                    <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[180px]">
                      {canOpenPay ? (
                        <Button
                          onClick={() => setConfirmBooking(rental)}
                          disabled={payingBookingId !== null || startingBookingId !== null || endingBookingId !== null}
                          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        >
                          {payingBookingId === rental.bookingId ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <Wallet className="w-4 h-4 mr-2" />
                              Thanh toán bằng ví
                            </>
                          )}
                        </Button>
                      ) : insufficient ? (
                        <>
                          <Button disabled className="w-full opacity-60">
                            <Wallet className="w-4 h-4 mr-2" />
                            Không đủ số dư
                          </Button>
                          <Link
                            to="/account/top-up"
                            className="text-center text-sm text-primary hover:underline"
                          >
                            Nạp tiền vào ví
                          </Link>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground text-right sm:text-left">
                          Không thể thanh toán đơn này (số tiền không hợp lệ).
                        </p>
                      )}
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
                            Đang vào session...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Session
                          </>
                        )}
                      </Button>
                      {!canStart && activeBookingId !== null && activeBookingId !== rental.bookingId && (
                        <p className="text-xs text-muted-foreground text-right sm:text-left">
                          Bạn đang có session khác đang hoạt động.
                        </p>
                      )}
                      {!canStart && isQueued && (
                        <p className="text-xs text-orange-400 text-right sm:text-left">
                          Đơn đang trong hàng chờ. Hệ thống sẽ tự gán máy khi có slot trống.
                        </p>
                      )}
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
                            Đang kết thúc...
                          </>
                        ) : (
                          <>
                            <Square className="w-4 h-4 mr-2" />
                            End Session
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
          <h3 className="text-xl font-bold mb-2">Chưa có lịch sử thuê</h3>
          <p className="text-muted-foreground">
            Bạn chưa có đơn hàng nào. Hãy bắt đầu thuê máy tính ngay!
          </p>
        </Card>
      )}
    </div>
  );
}
