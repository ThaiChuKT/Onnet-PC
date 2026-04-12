import { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Search, ReceiptText, Wallet } from "lucide-react";
import { apiGet } from "../../api/http";
import { toast } from "sonner";

type WalletTransactionResponse = {
  id: number;
  amount: number;
  type: string;
  referenceId: number | null;
  note: string | null;
  createdAt: string;
};

export function TopUpBills() {
  const [transactions, setTransactions] = useState<WalletTransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const list = await apiGet<WalletTransactionResponse[]>("/wallet/transactions");
        setTransactions((list ?? []).filter((tx) => (tx.type ?? "").toLowerCase() === "top_up"));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not load top-up bills");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const now = Date.now();
    return transactions.filter((tx) => {
      const matchesSearch =
        !q ||
        String(tx.id).includes(q) ||
        String(tx.referenceId ?? "").includes(q) ||
        (tx.note ?? "").toLowerCase().includes(q);

      if (periodFilter === "all") return matchesSearch;
      const createdMs = new Date(tx.createdAt).getTime();
      if (!Number.isFinite(createdMs)) return false;

      if (periodFilter === "7d") {
        return matchesSearch && createdMs >= now - 7 * 24 * 60 * 60 * 1000;
      }
      if (periodFilter === "30d") {
        return matchesSearch && createdMs >= now - 30 * 24 * 60 * 60 * 1000;
      }
      return matchesSearch;
    });
  }, [periodFilter, searchTerm, transactions]);

  const totalTopUp = useMemo(
    () => filtered.reduce((sum, tx) => sum + Number(tx.amount ?? 0), 0),
    [filtered],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">
          Top-up
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {" "}
            bills
          </span>
        </h2>
        <p className="text-muted-foreground">
          Your personal top-up payment bills.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by bill ID, PayPal order, note..."
            className="pl-10"
          />
        </div>
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="p-4 border-border bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total top-up in current filter</p>
            <p className="text-2xl font-bold text-primary">${totalTopUp.toLocaleString("en-US")}</p>
          </div>
          <Wallet className="w-8 h-8 text-primary" />
        </div>
      </Card>

      <div className="space-y-3">
        {isLoading && (
          <Card className="p-10 border-border text-center">
            <ReceiptText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Loading top-up bills...</p>
          </Card>
        )}

        {!isLoading && filtered.map((tx) => (
          <Card key={tx.id} className="p-5 border-border">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold">TOPUP-#{tx.id}</h3>
                  <Badge className="bg-accent/20 text-accent border-accent/40">Paid</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{tx.note || "Wallet top-up"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PayPal order: {tx.referenceId ?? "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Created: {tx.createdAt ? new Date(tx.createdAt).toLocaleString("vi-VN") : "-"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-xl font-bold text-primary">${Number(tx.amount ?? 0).toLocaleString("en-US")}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <Card className="p-10 border-border text-center">
          <ReceiptText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No top-up bill found</p>
          <p className="text-sm text-muted-foreground">Try another filter or make a wallet top-up first.</p>
        </Card>
      )}
    </div>
  );
}
