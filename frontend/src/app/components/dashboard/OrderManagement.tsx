import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ShoppingCart, Eye, CheckCircle, XCircle, Clock, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPatch } from "../../api/http";
import { toast } from "sonner";
import { formatUsd } from "../../lib/formatUsd";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ListPagination } from "./ListPagination";

type AdminBookingItemResponse = {
  bookingId: number;
  userId: number | null;
  userFullName: string | null;
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
  planName?: string | null;
  durationDays?: number | null;
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
  expired: {
    label: "Expired",
    className: "bg-blue-500/20 text-blue-500 border-blue-500/50",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/20 text-destructive border-destructive/50",
    icon: XCircle,
  },
  paid: {
    label: "Paid",
    className: "bg-green-500/20 text-green-500 border-green-500/50",
    icon: CheckCircle,
  },
};

const normalizeBookingStatus = (value?: string | null) => {
  const normalized = (value ?? "").toLowerCase();
  return normalized === "completed" ? "expired" : normalized;
};

export function OrderManagement() {
  const [orders, setOrders] = useState<AdminBookingItemResponse[]>([]);
  const [page, setPage] = useState(0);
  // const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminBookingItemResponse | null>(null);
  const pageSize = 4;

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await apiGet<PageResponse<AdminBookingItemResponse>>("/admin/bookings", {
        page: 0,
        size: 500,
      });
      setOrders(response.content ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter, fromDate, toDate]);

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

  const currentOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        String(o.bookingId).includes(q) ||
        (o.userEmail ?? "").toLowerCase().includes(q) ||
        (o.userFullName ?? "").toLowerCase().includes(q) ||
        (o.specName ?? "").toLowerCase().includes(q) ||
        (o.planName ?? "").toLowerCase().includes(q) ||
        (o.bookingType ?? "").toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (!fromDate && !toDate) return true;
      if (!o.createdAt) return true;

      const createdAt = new Date(o.createdAt);
      if (fromDate) {
        const from = new Date(`${fromDate}T00:00:00`);
        if (createdAt < from) return false;
      }
      if (toDate) {
        const to = new Date(`${toDate}T23:59:59`);
        if (createdAt > to) return false;
      }
      return true;
    });
  }, [fromDate, orders, searchTerm, toDate]);

  const filteredOrders = useMemo(() => {
    const selectedStatus = statusFilter.toLowerCase();
    return currentOrders.filter((o) => {
      const rawStatus = normalizeBookingStatus(o.status);
      const isPaid = rawStatus === "paid";
      const isExpired = rawStatus === "expired";
      const statusHit =
        selectedStatus === "all" ||
        rawStatus === selectedStatus ||
        (selectedStatus === "paid" && isPaid) ||
        (selectedStatus === "expired" && isExpired);
      return statusHit;
    });
  }, [currentOrders, statusFilter]);

  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const paid = filteredOrders.filter((o) => normalizeBookingStatus(o.status) === "paid").length;
    const pending = filteredOrders.filter((o) => normalizeBookingStatus(o.status) === "pending").length;
    const completed = filteredOrders.filter((o) => normalizeBookingStatus(o.status) === "expired").length;
    const totalRevenue = filteredOrders
      .filter((o) => ["paid", "expired"].includes(normalizeBookingStatus(o.status)))
      .reduce((sum, o) => sum + Number(o.totalPrice ?? 0), 0);
    return { total, pending, paid, completed, totalRevenue };
  }, [filteredOrders]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(page * pageSize, page * pageSize + pageSize);
  }, [filteredOrders, page, pageSize]);

  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, email, configuration..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input-background border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-input-background border-border">
            <SelectValue placeholder="Order status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Card
          role="button"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("all");
          }}
          className="p-4 border-border bg-card/50 cursor-pointer hover:border-primary/30"
        >
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

        <Card
          role="button"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("paid");
          }}
          className="p-4 border-border bg-card/50 cursor-pointer hover:border-primary/30"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-2xl font-bold">{stats.paid}</p>
            </div>
          </div>
        </Card>

        <Card
          role="button"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("pending");
          }}
          className="p-4 border-border bg-card/50 cursor-pointer hover:border-primary/30"
        >
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

        <Card
          role="button"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("expired");
          }}
          className="p-4 border-border bg-card/50 cursor-pointer hover:border-primary/30"
        >
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
      </div>

      <div className="space-y-4">
        {isLoading && (
          <Card className="p-12 border-border text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading orders…</p>
          </Card>
        )}

        {paginatedOrders.map((order) => {
          const key = normalizeBookingStatus(order.status);
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
                      <span className="text-muted-foreground">Customer:</span>{" "}
                      <Link to={`/dashboard/accounts/${order.userId ?? ""}`} className="font-medium text-primary hover:underline">
                        {order.userFullName || order.userEmail}
                      </Link>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Package:</span>{" "}
                      <span className="font-medium">
                        {order.bookingType === "subscription" && order.planName
                          ? `${order.planName} (${order.durationDays}d)`
                          : order.specName}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">PC:</span>{" "}
                      <span className="font-medium">{order.pcId ?? "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>{" "}
                      <span className="font-bold text-money">
                        {formatUsd(Number(order.totalPrice ?? 0))}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Start:</span>{" "}
                      <span className="font-medium">
                        {order.startTime ? new Date(order.startTime).toLocaleString("en-US") : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End:</span>{" "}
                      <span className="font-medium">
                        {order.endTime ? new Date(order.endTime).toLocaleString("en-US") : "—"}
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
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                      </DialogHeader>
                      {selectedOrder && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">Order ID</p>
                              <p className="font-bold">#{selectedOrder.bookingId}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <Badge className={(statusConfig[normalizeBookingStatus(selectedOrder.status)]?.className) ?? "bg-muted text-muted-foreground border-border"}>
                                {statusConfig[normalizeBookingStatus(selectedOrder.status)]?.label ?? selectedOrder.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">User:</span>{" "}
                              <Link to={`/dashboard/accounts/${selectedOrder.userId ?? ""}`} className="font-medium text-primary hover:underline">
                                {selectedOrder.userFullName || selectedOrder.userEmail}
                              </Link>
                            </div>
                            <div><span className="text-muted-foreground">Spec:</span> <span className="font-medium">{selectedOrder.specName}</span></div>
                            {selectedOrder.bookingType === "subscription" && selectedOrder.planName && (
                              <div><span className="text-muted-foreground">Package:</span> <span className="font-medium">{selectedOrder.planName} ({selectedOrder.durationDays}d)</span></div>
                            )}
                            <div><span className="text-muted-foreground">PC:</span> <span className="font-medium">{selectedOrder.pcId ?? "—"}</span></div>
                            <div><span className="text-muted-foreground">BookingType:</span> <span className="font-medium">{selectedOrder.bookingType}</span></div>
                          </div>

                          <div className="p-4 bg-primary/10 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Total:</span>
                              <span className="text-2xl font-bold text-money">
                                {formatUsd(Number(selectedOrder.totalPrice ?? 0))}
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
                            <Button onClick={() => handleStatusChange(selectedOrder.bookingId, "expired")} className="bg-blue-500 hover:bg-blue-600">
                              Expired
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

      {!isLoading && filteredOrders.length === 0 && (
        <Card className="p-12 border-border text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No orders yet</h3>
          <p className="text-muted-foreground">No data matches the current filters</p>
        </Card>
      )}

      <div className="mt-6">
        <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
