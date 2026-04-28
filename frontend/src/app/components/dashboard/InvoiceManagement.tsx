import { useEffect, useMemo, useState } from "react";
import { ReceiptText, Search, Wallet } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { apiGet } from "../../api/http";
import { toast } from "sonner";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formatUsd } from "../../lib/formatUsd";

type AdminUserPaymentItemResponse = {
  transactionId: number;
  userEmail: string;
  userFullName: string;
  amount: number;
  type: string;
  note: string;
  createdAt: string;
};

type PageResponse<T> = {
  content: T[];
};

type InvoiceRow = {
  id: string;
  code: string;
  userEmail: string;
  title: string;
  amount: number;
  status: "paid" | "unpaid";
  rawStatus: string;
  createdAt: string;
};

function inDateRange(createdAt: string, fromDate: string, toDate: string) {
  if (!createdAt) return true;
  const date = new Date(createdAt);
  if (fromDate) {
    const from = new Date(`${fromDate}T00:00:00`);
    if (date < from) return false;
  }
  if (toDate) {
    const to = new Date(`${toDate}T23:59:59`);
    if (date > to) return false;
  }
  return true;
}

export function InvoiceManagement() {
  const [topUpItems, setTopUpItems] = useState<AdminUserPaymentItemResponse[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const topUpPage = await apiGet<
          PageResponse<AdminUserPaymentItemResponse>
        >("/admin/payments/topups", {
          page: 0,
          size: 200,
        });
        setTopUpItems(topUpPage.content ?? []);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not load invoices");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const allInvoices = useMemo<InvoiceRow[]>(() => {
    const topUpInvoices: InvoiceRow[] = topUpItems.map((item) => ({
      id: `topup-${item.transactionId}`,
      code: `TOPUP-#${item.transactionId}`,
      userEmail: item.userEmail,
      title: item.note || "PayPal top-up",
      amount: Number(item.amount ?? 0),
      status: "paid",
      rawStatus: "paid",
      createdAt: item.createdAt,
    }));

    return topUpInvoices.sort((a, b) => {
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });
  }, [topUpItems]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const selectedStatus = statusFilter.toLowerCase();

    return allInvoices.filter((item) => {
      const matchesSearch =
        !q ||
        item.code.toLowerCase().includes(q) ||
        (item.userEmail ?? "").toLowerCase().includes(q) ||
        (item.title ?? "").toLowerCase().includes(q);
      const matchesStatus =
        selectedStatus === "all" ||
        item.rawStatus === selectedStatus ||
        item.status === selectedStatus;
      const matchesDate = inDateRange(item.createdAt, fromDate, toDate);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [allInvoices, fromDate, searchTerm, statusFilter, toDate]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const paid = filtered.filter((it) => it.status === "paid").length;
    const totalAmount = filtered.reduce(
      (sum, it) => sum + Number(it.amount ?? 0),
      0,
    );
    return { total, paid, unpaid: total - paid, totalAmount };
  }, [filtered]);

  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div className="relative lg:col-span-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã bill, email, nội dung..."
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-border bg-card/50">
          <p className="text-sm text-muted-foreground">Total invoices</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4 border-border bg-card/50">
          <p className="text-sm text-muted-foreground">Paid invoices</p>
          <p className="text-2xl font-bold text-accent">{stats.paid}</p>
        </Card>
        <Card className="p-4 border-border bg-card/50">
          <p className="text-sm text-muted-foreground">Unpaid invoices</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.unpaid}</p>
        </Card>
        <Card className="p-4 border-border bg-gradient-to-br from-primary/10 to-accent/10">
          <p className="text-sm text-muted-foreground">Total bill value</p>
          <p className="text-xl font-bold text-primary">
            {formatUsd(stats.totalAmount)}
          </p>
        </Card>
      </div>

      <div className="space-y-3">
        {isLoading && (
          <Card className="p-10 text-center border-border">
            <ReceiptText className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Loading invoices...</p>
          </Card>
        )}

        {!isLoading &&
          filtered.map((item) => {
            const paid = item.status === "paid";
            return (
              <Card
                key={item.id}
                className="p-5 border-border hover:border-primary/40 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{item.code}</h3>
                      <Badge
                        className={
                          paid
                            ? "bg-accent/20 text-accent border-accent/40"
                            : "bg-yellow-500/20 text-yellow-500 border-yellow-500/40"
                        }
                      >
                        {paid ? "Paid" : "Unpaid"}
                      </Badge>
                      <Badge className="bg-primary/15 text-primary border-primary/40">
                        Top-up
                      </Badge>
                      <Badge className="bg-muted text-muted-foreground border-border">
                        {item.rawStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.userEmail}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created:{" "}
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString("vi-VN")
                        : "-"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 text-primary font-bold text-lg">
                      <Wallet className="w-4 h-4" />
                      {formatUsd(Number(item.amount ?? 0))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
      </div>

      {!isLoading && filtered.length === 0 && (
        <Card className="p-10 text-center border-border">
          <ReceiptText className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
          <p className="font-medium">No invoices found</p>
          <p className="text-sm text-muted-foreground">
            Thử thay đổi bộ lọc của tab Invoices.
          </p>
        </Card>
      )}
    </div>
  );
}
