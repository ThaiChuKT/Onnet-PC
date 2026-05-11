import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  CheckCircle,
  Search,
  Shield,
  Trash2,
  User,
  XCircle,
  BookOpen,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { apiDelete, apiGet, apiPatch } from "../../api/http";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formatUsd } from "../../lib/formatUsd";
import { ListPagination } from "./ListPagination";

type AdminUserItemResponse = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  verified: boolean;
  subscriptionBookingId?: number | null;
  subscriptionSpecName?: string | null;
  subscriptionEndTime?: string | null;
  activePcId?: number | null;
  activePcLocation?: string | null;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type AdminBookingItemResponse = {
  bookingId: number;
  userEmail: string;
  specName: string;
  pcId: number | null;
  bookingType: string;
  totalHours: number | null;
  startTime: string;
  endTime: string | null;
  totalPrice: number;
  status: string;
  createdAt: string;
  planName: string | null;
  durationDays: number | null;
};

export function AccountList() {
  const [users, setUsers] = useState<AdminUserItemResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [bookingsByUserId, setBookingsByUserId] = useState<
    Record<number, AdminBookingItemResponse[]>
  >({});
  const [loadingBookingsUserId, setLoadingBookingsUserId] = useState<
    number | null
  >(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

  const loadUsers = async (keyword?: string, nextPage = 0) => {
    setIsLoading(true);
    try {
      const page = await apiGet<PageResponse<AdminUserItemResponse>>(
        "/admin/users",
        { keyword, page: nextPage, size: 4 },
      );
      setUsers(page.content ?? []);
      setTotalPages(page.totalPages ?? 0);
      setPage(page.number ?? nextPage);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Không thể tải danh sách tài khoản",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers(searchTerm.trim() || undefined, page);
  }, [page]);

  useEffect(() => {
    const handle = window.setTimeout(
      () => {
        setPage(0);
        void loadUsers(searchTerm.trim() || undefined, 0);
      },
      250,
    );
    return () => window.clearTimeout(handle);
  }, [searchTerm]);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const selectedStatus = statusFilter.toLowerCase();
    return users.filter((u) => {
      const isActive = !!u.active;
      const role = (u.role ?? "").toLowerCase();
      const matchesSearch =
        !q ||
        String(u.id).includes(q) ||
        (u.fullName ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q) ||
        role.includes(q);
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active-user" && isActive) ||
        (selectedStatus === "inactive-user" && !isActive) ||
        (selectedStatus === "admin" && role.includes("admin")) ||
        (selectedStatus === "user" && role.includes("user"));
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, users]);

  const handleToggleActive = async (user: AdminUserItemResponse) => {
    try {
      await apiPatch<AdminUserItemResponse, { active: boolean }>(
        `/admin/users/${user.id}/active`,
        {
          active: !user.active,
        },
      );
      toast.success("Cập nhật trạng thái thành công");
      await loadUsers(searchTerm.trim() || undefined);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Không thể cập nhật trạng thái",
      );
    }
  };

  const handleToggleBookings = async (user: AdminUserItemResponse) => {
    const isExpanded = expandedUserId === user.id;
    if (isExpanded) {
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId(user.id);
    if (bookingsByUserId[user.id]) {
      return;
    }

    setLoadingBookingsUserId(user.id);
    try {
      const rows = await apiGet<AdminBookingItemResponse[]>(
        `/admin/users/${user.id}/bookings`,
      );
      setBookingsByUserId((prev) => ({ ...prev, [user.id]: rows ?? [] }));
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Không thể tải lịch sử subscriptions",
      );
    } finally {
      setLoadingBookingsUserId(null);
    }
  };

  void handleToggleBookings;

  const handleDelete = async (user: AdminUserItemResponse) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;
    try {
      await apiDelete<string>(`/admin/users/${user.id}`);
      toast.success("Đã xóa tài khoản");
      await loadUsers(searchTerm.trim() || undefined);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể xóa tài khoản");
    }
  };

  const getSubscriptionStatus = (booking: AdminBookingItemResponse) => {
    const now = new Date();
    const endTime = booking.endTime ? new Date(booking.endTime) : null;
    
    if (!endTime) return "unknown";
    
    const daysUntilExpiry = Math.ceil(
      (endTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= 3) return "almost-expired";
    return "active";
  };

  const getFilteredBookings = (bookings: AdminBookingItemResponse[]) => {
    return bookings.filter((b) => {
      if (bookingStatusFilter === "all") return true;
      return getSubscriptionStatus(b) === bookingStatusFilter;
    });
  };

  const stats = {
    total: users.length,
    users: users.filter((u) => (u.role ?? "").toUpperCase().includes("USER"))
      .length,
    admins: users.filter((u) => (u.role ?? "").toUpperCase().includes("ADMIN"))
      .length,
    mods: users.filter((u) => (u.role ?? "").toUpperCase().includes("MOD"))
      .length,
    active: users.filter((u) => u.active).length,
  };

  return (
    <div>
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng tài khoản</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-3 rounded-lg">
              <User className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Users</p>
              <p className="text-2xl font-bold text-accent">{stats.users}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/20 p-3 rounded-lg">
              <Shield className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admins/Mods</p>
              <p className="text-2xl font-bold text-secondary">
                {stats.admins + stats.mods}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>
              <p className="text-2xl font-bold text-accent">{stats.active}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input-background border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[220px] bg-input-background border-border">
            <SelectValue placeholder="Lọc tài khoản" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả tài khoản</SelectItem>
            <SelectItem value="active-user">Active</SelectItem>
            <SelectItem value="inactive-user">Inactive</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <Card className="p-12 border-border text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Đang tải danh sách tài khoản...
            </p>
          </Card>
        )}

        {filteredUsers.map((u) => (
          <Card
            key={u.id}
            className="p-6 border-border hover:border-primary/50 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold">{u.fullName}</h3>
                      <Badge className="bg-primary/20 text-primary border-primary/50">
                        {u.role}
                      </Badge>
                      <Badge
                        className={
                          u.active
                            ? "bg-accent/20 text-accent border-accent/50"
                            : "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {u.active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge
                        className={
                          u.verified
                            ? "bg-blue-500/20 text-blue-500 border-blue-500/50"
                            : "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
                        }
                      >
                        {u.verified ? "Verified" : "Unverified"}
                      </Badge>
                      {u.activePcId != null && (
                        <Badge className="bg-emerald-200 text-emerald-700 border-emerald-300">
                          PC #{u.activePcId}
                          {u.activePcLocation ? ` • ${u.activePcLocation}` : ""}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    {u.subscriptionSpecName && (
                      <p className="text-sm mt-1">
                        <span className="text-muted-foreground">Package:</span>
                        <span className="font-medium ml-2">{u.subscriptionSpecName}</span>
                        {u.subscriptionEndTime && (
                          <span className="text-xs text-muted-foreground ml-2">
                            • expires {new Date(u.subscriptionEndTime).toLocaleString("vi-VN")}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-medium">{u.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">SĐT:</span>
                    <span className="font-medium">{u.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-muted"
                  title="Open account detail"
                >
                  <Link to={`/dashboard/accounts/${u.id}`}>
                    <BookOpen className="w-4 h-4" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(u)}
                  className="border-primary text-foreground hover:bg-primary/10"
                  title={u.active ? "Deactivate" : "Activate"}
                >
                  {u.active ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(u)}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  disabled={(u.role ?? "").toUpperCase().includes("ADMIN")}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {expandedUserId === u.id && (
              <div className="mt-5 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h4 className="font-semibold">Subscription history</h4>
                  <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-input-background border-border text-sm">
                      <SelectValue placeholder="Filter subscriptions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All subscriptions</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="almost-expired">Almost expired (≤3 days)</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loadingBookingsUserId === u.id && (
                  <p className="text-sm text-muted-foreground">
                    Loading subscription history...
                  </p>
                )}

                {loadingBookingsUserId !== u.id &&
                  getFilteredBookings(bookingsByUserId[u.id] ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No subscriptions found for this account.
                    </p>
                  )}

                {loadingBookingsUserId !== u.id &&
                  getFilteredBookings(bookingsByUserId[u.id] ?? []).length > 0 && (
                    <div className="space-y-2">
                      {getFilteredBookings(bookingsByUserId[u.id] ?? []).slice(0, 10).map((b) => {
                        const status = getSubscriptionStatus(b);
                        const statusBadge = status === "active" 
                          ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/50"
                          : status === "almost-expired"
                          ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/50"
                          : "bg-red-500/20 text-red-600 border-red-500/50";
                        const statusLabel = status === "active" 
                          ? "Active" 
                          : status === "almost-expired" 
                          ? "Almost expired" 
                          : "Expired";

                        return (
                          <div
                            key={b.bookingId}
                            className="flex flex-col gap-2 rounded-md border border-border bg-card/70 px-3 py-2"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {b.planName || b.specName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {b.durationDays ? `${b.durationDays} day plan` : "Custom duration"}
                                </p>
                              </div>
                              <Badge className={statusBadge}>
                                {statusLabel}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Start:</span>
                                <p className="font-medium">
                                  {new Date(b.startTime).toLocaleString("vi-VN", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                  })}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">End:</span>
                                <p className="font-medium">
                                  {b.endTime
                                    ? new Date(b.endTime).toLocaleString("vi-VN", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                      })
                                    : "-"}
                                </p>
                              </div>
                              <div className="sm:text-right">
                                <span className="text-muted-foreground">Price:</span>
                                <p className="font-medium text-primary">
                                  {formatUsd(Number(b.totalPrice ?? 0))}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {!isLoading && filteredUsers.length === 0 && (
        <Card className="p-12 border-border text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">
            Không tìm thấy tài khoản nào
          </h3>
          <p className="text-muted-foreground">Thử tìm kiếm với từ khóa khác</p>
        </Card>
      )}

      <div className="mt-6">
        <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
