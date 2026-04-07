import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ShoppingCart, Eye, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPatch } from "../../api/http";
import { toast } from "sonner";

type AdminBookingItemResponse = {
  bookingId: number;
  userEmail: string;
  specName: string;
  pcId: number | null;
  bookingType: string;
  totalHours: number | null;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  createdAt: string;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const statusConfig: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
    icon: Clock,
  },
  active: {
    label: "Active",
    className: "bg-accent/20 text-accent border-accent/50",
    icon: CheckCircle,
  },
  completed: {
    label: "Expired",
    className: "bg-blue-500/20 text-blue-500 border-blue-500/50",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/20 text-destructive border-destructive/50",
    icon: XCircle,
  },
};

export function OrderManagement() {
  const [orders, setOrders] = useState<AdminBookingItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminBookingItemResponse | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const page = await apiGet<PageResponse<AdminBookingItemResponse>>("/admin/bookings", { page: 0, size: 50 });
      setOrders(page.content ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const handleStatusChange = async (bookingId: number, status: string) => {
    try {
      await apiPatch<AdminBookingItemResponse, { status: string }>(`/admin/bookings/${bookingId}/status`, { status });
      toast.success("Status updated");
      setSelectedOrder(null);
      await loadOrders();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update status");
    }
  };

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => (o.status ?? "").toLowerCase() === "pending").length;
    const active = orders.filter((o) => (o.status ?? "").toLowerCase() === "active").length;
    const completed = orders.filter((o) => (o.status ?? "").toLowerCase() === "completed").length;
    const totalRevenue = orders
      .filter((o) => ["active", "completed"].includes((o.status ?? "").toLowerCase()))
      .reduce((sum, o) => sum + Number(o.totalPrice ?? 0), 0);
    return { total, pending, active, completed, totalRevenue };
  }, [orders]);

  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total orders</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-accent">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expired</p>
              <p className="text-2xl font-bold text-blue-500">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-lg font-bold text-primary">
                {(stats.totalRevenue / 1_000_000).toFixed(1)}M
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <Card className="p-12 border-border text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading orders…</p>
          </Card>
        )}

        {orders.map((order) => {
          const key = (order.status ?? "").toLowerCase();
          const cfg = statusConfig[key] ?? {
            label: order.status ?? "N/A",
            className: "bg-muted text-muted-foreground border-border",
            icon: Clock,
          };
          const StatusIcon = cfg.icon;

          return (
            <Card key={order.bookingId} className="p-6 border-border hover:border-primary/50 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold">#{order.bookingId}</h3>
                    <Badge className={cfg.className}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {cfg.label}
                    </Badge>
                    <Badge className="bg-primary/20 text-primary border-primary/50">{order.bookingType}</Badge>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Khách:</span>{" "}
                      <span className="font-medium">{order.userEmail}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Spec:</span>{" "}
                      <span className="font-medium">{order.specName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">PC:</span>{" "}
                      <span className="font-medium">{order.pcId ?? "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Giá:</span>{" "}
                      <span className="font-bold text-primary">
                        {Number(order.totalPrice ?? 0).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bắt đầu:</span>{" "}
                      <span className="font-medium">
                        {order.startTime ? new Date(order.startTime).toLocaleString("vi-VN") : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Kết thúc:</span>{" "}
                      <span className="font-medium">
                        {order.endTime ? new Date(order.endTime).toLocaleString("vi-VN") : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog
                    open={selectedOrder?.bookingId === order.bookingId}
                    onOpenChange={(open) => !open && setSelectedOrder(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="border-primary text-foreground hover:bg-primary/10"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Chi tiết
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Chi Tiết Đơn</DialogTitle>
                      </DialogHeader>
                      {selectedOrder && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">Mã đơn</p>
                              <p className="font-bold">#{selectedOrder.bookingId}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Trạng thái</p>
                              <Badge className={(statusConfig[(selectedOrder.status ?? "").toLowerCase()]?.className) ?? "bg-muted text-muted-foreground border-border"}>
                                {selectedOrder.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div><span className="text-muted-foreground">User:</span> <span className="font-medium">{selectedOrder.userEmail}</span></div>
                            <div><span className="text-muted-foreground">Spec:</span> <span className="font-medium">{selectedOrder.specName}</span></div>
                            <div><span className="text-muted-foreground">PC:</span> <span className="font-medium">{selectedOrder.pcId ?? "—"}</span></div>
                            <div><span className="text-muted-foreground">BookingType:</span> <span className="font-medium">{selectedOrder.bookingType}</span></div>
                          </div>

                          <div className="p-4 bg-primary/10 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Tổng tiền:</span>
                              <span className="text-2xl font-bold text-primary">
                                {Number(selectedOrder.totalPrice ?? 0).toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button onClick={() => handleStatusChange(selectedOrder.bookingId, "pending")} variant="outline">
                              Pending
                            </Button>
                            <Button onClick={() => handleStatusChange(selectedOrder.bookingId, "active")} className="bg-accent hover:bg-accent/90">
                              Active
                            </Button>
                            <Button onClick={() => handleStatusChange(selectedOrder.bookingId, "completed")} className="bg-blue-500 hover:bg-blue-600">
                              Completed
                            </Button>
                            <Button onClick={() => handleStatusChange(selectedOrder.bookingId, "cancelled")} variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                              Cancelled
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {!isLoading && orders.length === 0 && (
        <Card className="p-12 border-border text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Chưa có đơn nào</h3>
          <p className="text-muted-foreground">Đơn hàng sẽ hiển thị ở đây</p>
        </Card>
      )}
    </div>
  );
}

