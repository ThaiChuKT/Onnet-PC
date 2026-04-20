import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { CheckCircle, CreditCard, Search, Shield, Trash2, User, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPatch } from "../../api/http";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type AdminUserItemResponse = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  verified: boolean;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type AdminUserPaymentItemResponse = {
  transactionId: number;
  walletId: number;
  userId: number;
  userEmail: string;
  userFullName: string;
  amount: number;
  type: string;
  referenceId: number | null;
  note: string;
  createdAt: string;
};

export function AccountList() {
  const [users, setUsers] = useState<AdminUserItemResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [paymentsByUserId, setPaymentsByUserId] = useState<Record<number, AdminUserPaymentItemResponse[]>>({});
  const [loadingPaymentsUserId, setLoadingPaymentsUserId] = useState<number | null>(null);

  const loadUsers = async (keyword?: string) => {
    setIsLoading(true);
    try {
      const page = await apiGet<PageResponse<AdminUserItemResponse>>("/admin/users", { keyword, page: 0, size: 50 });
      setUsers(page.content ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể tải danh sách tài khoản");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => void loadUsers(searchTerm.trim() || undefined), 250);
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
      await apiPatch<AdminUserItemResponse, { active: boolean }>(`/admin/users/${user.id}/active`, {
        active: !user.active,
      });
      toast.success("Cập nhật trạng thái thành công");
      await loadUsers(searchTerm.trim() || undefined);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể cập nhật trạng thái");
    }
  };

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

  const handleTogglePayments = async (user: AdminUserItemResponse) => {
    const isExpanded = expandedUserId === user.id;
    if (isExpanded) {
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId(user.id);
    if (paymentsByUserId[user.id]) {
      return;
    }

    setLoadingPaymentsUserId(user.id);
    try {
      const rows = await apiGet<AdminUserPaymentItemResponse[]>(`/admin/users/${user.id}/payments`);
      setPaymentsByUserId((prev) => ({ ...prev, [user.id]: rows ?? [] }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể tải lịch sử thanh toán");
    } finally {
      setLoadingPaymentsUserId(null);
    }
  };

  const stats = {
    total: users.length,
    users: users.filter((u) => (u.role ?? "").toUpperCase().includes("USER")).length,
    admins: users.filter((u) => (u.role ?? "").toUpperCase().includes("ADMIN")).length,
    mods: users.filter((u) => (u.role ?? "").toUpperCase().includes("MOD")).length,
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
              <p className="text-2xl font-bold text-secondary">{stats.admins + stats.mods}</p>
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
            <p className="text-muted-foreground">Đang tải danh sách tài khoản...</p>
          </Card>
        )}

        {filteredUsers.map((u) => (
          <Card key={u.id} className="p-6 border-border hover:border-primary/50 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold">{u.fullName}</h3>
                      <Badge className="bg-primary/20 text-primary border-primary/50">{u.role}</Badge>
                      <Badge className={u.active ? "bg-accent/20 text-accent border-accent/50" : "bg-muted text-muted-foreground border-border"}>
                        {u.active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge className={u.verified ? "bg-blue-500/20 text-blue-500 border-blue-500/50" : "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"}>
                        {u.verified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
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
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePayments(u)}
                  className="border-border text-foreground hover:bg-muted"
                  title="Payment history"
                >
                  <CreditCard className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(u)}
                  className="border-primary text-foreground hover:bg-primary/10"
                  title={u.active ? "Deactivate" : "Activate"}
                >
                  {u.active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
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
                <h4 className="font-semibold mb-3">Payment history</h4>

                {loadingPaymentsUserId === u.id && (
                  <p className="text-sm text-muted-foreground">Loading payment history...</p>
                )}

                {loadingPaymentsUserId !== u.id && (paymentsByUserId[u.id] ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No transactions found for this account.</p>
                )}

                {loadingPaymentsUserId !== u.id && (paymentsByUserId[u.id] ?? []).length > 0 && (
                  <div className="space-y-2">
                    {(paymentsByUserId[u.id] ?? []).slice(0, 10).map((p) => (
                      <div key={p.transactionId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md border border-border bg-card/70 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">#{p.transactionId} • {p.type}</p>
                          <p className="text-xs text-muted-foreground">{p.note || "No note"}</p>
                          <p className="text-xs text-muted-foreground">{p.createdAt ? new Date(p.createdAt).toLocaleString("vi-VN") : "-"}</p>
                        </div>
                        <p className="font-semibold text-primary">{Number(p.amount ?? 0).toLocaleString("vi-VN")}đ</p>
                      </div>
                    ))}
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
          <h3 className="text-xl font-bold mb-2">Không tìm thấy tài khoản nào</h3>
          <p className="text-muted-foreground">Thử tìm kiếm với từ khóa khác</p>
        </Card>
      )}
    </div>
  );
}

