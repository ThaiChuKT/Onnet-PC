import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../../api/http";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Activity, Power, Search } from "lucide-react";
import { toEnglishMessage } from "../../lib/englishMessage";
import { ListPagination } from "./ListPagination";

function formatDuration(startTime: string, endTime?: string | null): string {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return "-";
  }

  const totalMinutes = Math.floor((end - start) / 60000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

type AdminSessionItemResponse = {
  sessionId: number;
  bookingId: number;
  userId: number;
  userEmail: string;
  userFullName: string;
  pcId: number;
  pcLocation: string;
  startTime: string;
  endTime: string | null;
  totalCost: number;
  status: string;
  specName: string;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type EndSessionResponse = {
  sessionId: number;
  bookingId: number;
  endedAt: string;
  noRefundApplied: boolean;
  moonlightStopUrl: string | null;
  moonlightMessage: string | null;
  status: string;
  message: string;
};

const statusBadgeClass: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-500 border-emerald-500/50 animate-pulse",
  ended: "bg-primary/20 text-primary border-primary/50",
  expired: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
};

export function SessionManagement() {
  const [items, setItems] = useState<AdminSessionItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [nowTick, setNowTick] = useState(Date.now());
  const [processingSessionId, setProcessingSessionId] = useState<number | null>(
    null,
  );
  const [page, setPage] = useState(0);
  const pageSize = 4;

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await apiGet<PageResponse<AdminSessionItemResponse>>(
        "/admin/sessions",
        {
          page: 0,
          size: 500,
        },
      );
      setItems(response.content ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [statusFilter, searchTerm]);

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = 
        !q ||
        String(item.sessionId).includes(q) ||
        (item.userEmail ?? "").toLowerCase().includes(q) ||
        (item.userFullName ?? "").toLowerCase().includes(q) ||
        (item.pcLocation ?? "").toLowerCase().includes(q);
      
      const matchesStatus = statusFilter === "all" || (item.status ?? "").toLowerCase() === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  useEffect(() => {
    const handle = window.setInterval(() => setNowTick(Date.now()), 60000);
    return () => window.clearInterval(handle);
  }, []);

  const stats = useMemo(() => {
    const active = filteredItems.filter(
      (s) => (s.status ?? "").toLowerCase() === "active",
    ).length;
    const ended = filteredItems.filter(
      (s) => (s.status ?? "").toLowerCase() === "ended",
    ).length;
    const expired = filteredItems.filter(
      (s) => (s.status ?? "").toLowerCase() === "expired",
    ).length;
    return {
      total: filteredItems.length,
      active,
      ended,
      expired,
    };
  }, [filteredItems]);

  const totalPages = Math.ceil(filteredItems.length / pageSize);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice(page * pageSize, page * pageSize + pageSize);
  }, [filteredItems, page, pageSize]);

  const handleForceEnd = async (sessionId: number) => {
    if (!confirm("Force-end this active session?")) {
      return;
    }

    setProcessingSessionId(sessionId);
    try {
      const response = await apiPost<EndSessionResponse>(
        `/admin/sessions/${sessionId}/force-end`,
      );
      toast.success(toEnglishMessage(response.message, "Session force-ended"));
      await loadSessions();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not force-end session",
      );
    } finally {
      setProcessingSessionId(null);
    }
  };

  return (
    <div>
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card
          role="button"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("all");
          }}
          className="p-4 border-border bg-card/50 cursor-pointer hover:border-primary/30"
        >
          <p className="text-sm text-muted-foreground">Total sessions</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card
          role="button"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("active");
          }}
          className="p-4 border-border bg-card/50 cursor-pointer hover:border-primary/30"
        >
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-accent">{stats.active}</p>
        </Card>
        <Card
          role="button"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("ended");
          }}
          className="p-4 border-border bg-card/50 cursor-pointer hover:border-primary/30"
        >
          <p className="text-sm text-muted-foreground">Ended</p>
          <p className="text-2xl font-bold text-primary">{stats.ended}</p>
        </Card>
        <Card
          role="button"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("expired");
          }}
          className="p-4 border-border bg-card/50 cursor-pointer hover:border-primary/30"
        >
          <p className="text-sm text-muted-foreground">Expired</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.expired}</p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, full name, or machine location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <Card className="p-10 border-border text-center">
            <Activity className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Loading sessions...</p>
          </Card>
        )}

        {!isLoading &&
          paginatedItems.map((item) => {
            const status = (item.status ?? "").toLowerCase();
            const isActive = status === "active";
            const lastUsedLabel =
              !isActive && item.endTime
                ? formatDuration(item.startTime, item.endTime)
                : "-";
            const activeDuration = isActive
              ? formatDuration(item.startTime, new Date(nowTick).toISOString())
              : "-";
            return (
              <Card
                key={item.sessionId}
                className="p-6 border-border hover:border-primary/40 transition-all"
              >
                <div className="flex col-1 lg:flex-row lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold">
                        Session #{item.sessionId}
                      </h3>
                      <Badge
                        className={
                          statusBadgeClass[status] ??
                          "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {item.status}
                      </Badge>
                      <Badge className="bg-slate-200 text-slate-700 border-slate-300">
                        {isActive ? "Using for:" : "Used for:"} {" "}
                        {isActive ? activeDuration : lastUsedLabel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.userFullName} ({item.userEmail})
                    </p>
                    <div className="grid sm:grid-cols-1 gap-2 text-sm">
                      <p>
                        Spec: {item.specName || "Unknown"} (PC #{item.pcId})
                      </p>
                      <span>
                        Started:{" "}
                        {item.startTime
                          ? new Date(item.startTime).toLocaleString("en-US")
                          : "-"}
                      </span>
                      <p>
                        Ended:{" "}
                        {item.endTime
                          ? new Date(item.endTime).toLocaleString("en-US")
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Button
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive/10"
                      disabled={
                        !isActive || processingSessionId === item.sessionId
                      }
                      onClick={() => handleForceEnd(item.sessionId)}
                    >
                      <Power className="w-4 h-4 mr-2" />
                      {processingSessionId === item.sessionId
                        ? "Ending..."
                        : "Force end"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
      </div>

      {!isLoading && filteredItems.length === 0 && (
        <Card className="p-10 border-border text-center">
          <Activity className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">No sessions found</p>
          <p className="text-sm text-muted-foreground">
            Try changing your filter or search keyword.
          </p>
        </Card>
      )}

      <div className="mt-6">
        <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
