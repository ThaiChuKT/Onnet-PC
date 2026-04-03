import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar, Clock, Cpu, DollarSign } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../api/http";
import { toast } from "sonner";

type BookingHistoryItemResponse = {
  bookingId: number;
  pcId: number | null;
  specName: string;
  totalHours: number | null;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  remainingMinutes: number | null;
  createdAt: string;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const statusConfig = {
  pending: { label: "Chờ xử lý", className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50" },
  active: { label: "Đang hoạt động", className: "bg-accent/20 text-accent border-accent/50" },
  paid: { label: "Đã thanh toán", className: "bg-blue-500/20 text-blue-500 border-blue-500/50" },
  completed: { label: "Hoàn thành", className: "bg-secondary/20 text-secondary border-secondary/50" },
  cancelled: { label: "Đã hủy", className: "bg-muted text-muted-foreground border-border" },
};

export function RentalHistory() {
  const [items, setItems] = useState<BookingHistoryItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const page = await apiGet<PageResponse<BookingHistoryItemResponse>>("/bookings/my", { page: 0, size: 20 });
        if (!cancelled) setItems(page.content ?? []);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Không thể tải lịch sử thuê";
        if (!cancelled) {
          setLoadError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const completedCount = useMemo(
    () => items.filter((i) => (i.status ?? "").toLowerCase() === "completed").length,
    [items],
  );
  const totalSpent = useMemo(
    () =>
      items
        .filter((i) => ["active", "paid", "completed"].includes((i.status ?? "").toLowerCase()))
        .reduce((sum, i) => sum + Number(i.totalPrice ?? 0), 0),
    [items],
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Lịch Sử
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {" "}Thuê Máy
          </span>
        </h1>
        <p className="text-muted-foreground">
          Xem lại tất cả các lần thuê máy tính của bạn
        </p>
      </div>

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
          const cfg =
            key in statusConfig
              ? statusConfig[key as keyof typeof statusConfig]
              : {
            label: rental.status ?? "N/A",
            className: "bg-muted text-muted-foreground border-border",
          };
          const start = rental.startTime ? new Date(rental.startTime) : null;
          const end = rental.endTime ? new Date(rental.endTime) : null;
          const duration =
            start && end ? `${Math.max(0, Math.round((end.getTime() - start.getTime()) / 36e5))} giờ` : "—";

          return (
          <Card
            key={rental.bookingId}
            className="p-6 border-border hover:border-primary/50 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{rental.specName}</h3>
                  <Badge className={cfg.className}>
                    {cfg.label}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  <span>PC: {rental.pcId ?? "—"}</span>
                </div>

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

              <div className="flex flex-col md:items-end gap-2">
                <div className="text-2xl font-bold text-primary">
                  {Number(rental.totalPrice ?? 0).toLocaleString("vi-VN")}đ
                </div>
                <div className="text-xs text-muted-foreground">Mã: {rental.bookingId}</div>
              </div>
            </div>
          </Card>
          );
        })}
      </div>

      {/* Empty State (if needed) */}
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
