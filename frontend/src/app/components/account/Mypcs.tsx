import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Loader2, Monitor, Play, Square, Sparkles } from "lucide-react";
import { apiGet, apiPost } from "../../api/http";
import { toast } from "sonner";

type BookingHistoryItemResponse = {
  bookingId: number;
  specId: number | null;
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

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
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

type SpecSummary = {
  specId: number;
  specName: string;
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
  pricePerHour: number;
  machineCount: number;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  ready: {
    label: "Ready",
    className: "bg-blue-500/20 text-blue-500 border-blue-500/50",
  },
  in_use: {
    label: "In Use",
    className: "bg-accent/20 text-accent border-accent/50",
  },
  maintenance: {
    label: "Maintenance",
    className: "bg-red-500/20 text-red-500 border-red-500/50",
  },
  waiting: {
    label: "Waiting",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  },
  expired: {
    label: "Expired",
    className: "bg-secondary/20 text-secondary border-secondary/50",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const normalizeBookingStatus = (value?: string | null) => {
  const normalized = (value ?? "").toLowerCase();
  if (normalized === "completed") return "expired";
  if (normalized === "paid") return "ready";
  if (normalized === "active") return "in_use";
  if (normalized === "in use") return "in_use";
  if (normalized === "locked") return "maintenance";
  return normalized;
};

const POLL_MS = 15_000;

export function Mypcs() {
  const [items, setItems] = useState<BookingHistoryItemResponse[]>([]);
  const [machines, setMachines] = useState<MachineListItemResponse[]>([]);
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [startingBookingId, setStartingBookingId] = useState<number | null>(null);
  const [endingBookingId, setEndingBookingId] = useState<number | null>(null);

  const loadData = useCallback(async (mode: "full" | "silent" = "full") => {
    if (mode === "full") {
      setIsLoading(true);
      setLoadError(null);
    }

    try {
      const [page, activeSession, machinesPage] = await Promise.all([
        apiGet<PageResponse<BookingHistoryItemResponse>>("/bookings/my", {
          page: 0,
          size: 50,
        }),
        apiGet<ActiveSessionResponse>("/sessions/current").catch(() => null),
        apiGet<PageResponse<MachineListItemResponse>>("/pcs", {
          page: 0,
          size: 200,
          sort: "price_asc",
        }).catch(() => null),
      ]);

      setItems(page.content ?? []);
      setActiveBookingId(activeSession?.bookingId ?? null);
      const machineItems = (machinesPage?.content ?? []).map((machine) => ({
        ...machine,
        hourlyPrice: typeof machine.hourlyPrice === "string" ? parseFloat(machine.hourlyPrice) : Number(machine.hourlyPrice),
      }));
      setMachines(machineItems);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load My PCs";
      if (mode === "full") {
        setLoadError(msg);
        toast.error(msg);
      }
    } finally {
      if (mode === "full") setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData("full");
  }, [loadData]);

  useEffect(() => {
    const id = window.setInterval(() => {
      loadData("silent");
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [loadData]);

  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        const status = normalizeBookingStatus(item.status);
        return (
          status === "ready" ||
          status === "in_use" ||
          status === "waiting" ||
          status === "maintenance" ||
          status === "expired"
        );
      }),
    [items],
  );

  const specCatalog = useMemo(() => {
    const grouped = new Map<number, SpecSummary>();

    for (const machine of machines) {
      const existing = grouped.get(machine.specId);
      if (existing) {
        existing.machineCount += 1;
        continue;
      }

      grouped.set(machine.specId, {
        specId: machine.specId,
        specName: machine.specName,
        cpu: machine.cpu,
        gpu: machine.gpu,
        ram: machine.ram,
        storage: machine.storage,
        pricePerHour: Number(machine.hourlyPrice ?? 0),
        machineCount: 1,
      });
    }

    return grouped;
  }, [machines]);

  const handleStartSession = async (bookingId: number) => {
    if (startingBookingId !== null || endingBookingId !== null) return;

    setStartingBookingId(bookingId);
    try {
      const res = await apiPost<StartSessionResponse>(`/bookings/${bookingId}/start-session`);
      setActiveBookingId(res.bookingId ?? bookingId);
      setItems((prev) =>
        prev.map((item) =>
          item.bookingId === bookingId
            ? {
                ...item,
                status: "in_use",
                pcId: res.pcId ?? item.pcId,
              }
            : item,
        ),
      );
      toast.success(res.message || "Session started");
      await loadData("silent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start session");
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
        prev.map((item) =>
          item.bookingId === (res.bookingId ?? bookingId)
            ? {
                ...item,
                status: "expired",
              }
            : item,
        ),
      );
      toast.success(res.message || "Session ended");
      await loadData("silent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not end session");
    } finally {
      setEndingBookingId(null);
    }
  };

  const activeCount = visibleItems.filter((item) => normalizeBookingStatus(item.status) === "in_use" || activeBookingId === item.bookingId).length;
  const readyCount = visibleItems.filter((item) => normalizeBookingStatus(item.status) === "ready").length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            My
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {" "}
              PCs
            </span>
          </h1>
          <p className="text-muted-foreground">
            Start or stop your session here. Specs and status are shown for each machine.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        <Card className="p-4 border-border bg-card/70 flex flex-col justify-center">
          <p className="text-lg font-semibold text-muted-foreground">Available bookings</p>
          <p className="text-3xl font-bold mt-1">{visibleItems.length}</p>
        </Card>
        <Card className="p-4 border-border bg-card/70 flex flex-col justify-center">
          <p className="text-lg font-semibold text-muted-foreground">Ready to start</p>
          <p className="text-3xl font-bold text-money mt-1">{readyCount}</p>
        </Card>
        <Card className="p-4 border-border bg-card/70 flex flex-col justify-center">
          <p className="text-lg font-semibold text-muted-foreground">Active sessions</p>
          <p className="text-3xl font-bold text-accent mt-1">{activeCount}</p>
        </Card>
      </div>

      {isLoading && (
        <Card className="p-12 border-border text-center">
          <Monitor className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Loading PCs…</p>
        </Card>
      )}

      {!isLoading && loadError && (
        <Card className="p-12 border-border text-center">
          <Monitor className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{loadError}</p>
        </Card>
      )}

      {!isLoading && !loadError && visibleItems.length === 0 && (
        <Card className="relative overflow-hidden border-border bg-card/70 p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold mb-2">You don't have any PC</h3>
          <p className="mx-auto max-w-lg text-muted-foreground mb-6">
            Choose a plan first and your machine will appear here once the booking is ready.
          </p>
          <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
            <Link to="/packages">Choose your plans</Link>
          </Button>
        </Card>
      )}

      {!isLoading && !loadError && visibleItems.length > 0 && (
        <Card className="overflow-hidden border-border bg-card/60">
          <div className="hidden md:grid grid-cols-[2.2fr_2.1fr_1fr_1fr] gap-4 border-b border-border bg-muted/30 px-5 py-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            <div>Name</div>
            <div>Specs</div>
            <div>Status</div>
            <div className="text-right">Action</div>
          </div>

          <div className="divide-y divide-border">
            {visibleItems.map((item) => {
              const status = normalizeBookingStatus(item.status);
              const cfg = statusConfig[status] ?? {
                label: item.status ?? "N/A",
                className: "bg-muted text-muted-foreground border-border",
              };
              const spec = item.specId ? specCatalog.get(item.specId) ?? null : null;
              const isActive = status === "in_use" || activeBookingId === item.bookingId;
              const canStart = status === "ready" && activeBookingId === null;
              const isStarting = startingBookingId === item.bookingId;
              const isEnding = endingBookingId === item.bookingId;
              const canShowStart = canStart && !isActive;

              return (
                <div key={item.bookingId} className="px-5 py-5">
                  <div className="grid gap-4 md:grid-cols-[2.2fr_2.1fr_1fr_1fr] md:items-center">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{item.specName}</h3>
                        <Badge className={cfg.className}>{cfg.label}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Hours left: {item.remainingMinutes !== null ? `${Math.ceil(item.remainingMinutes / 60)}h` : "—"}
                      </div>
                      {item.queued && (
                        <div className="text-xs text-orange-400">
                          Waiting for a machine from the subscription pool
                          {item.queuePosition ? ` - queue position #${item.queuePosition}` : ""}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl border border-border/70 bg-background/60 p-3">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">CPU</div>
                        <div className="mt-1 text-sm font-medium">{spec?.cpu ?? "—"}</div>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-background/60 p-3">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">RAM</div>
                        <div className="mt-1 text-sm font-medium">{spec ? `${spec.ram}GB` : "—"}</div>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-background/60 p-3">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">GPU</div>
                        <div className="mt-1 text-sm font-medium">{spec?.gpu ?? "—"}</div>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-background/60 p-3">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Storage</div>
                        <div className="mt-1 text-sm font-medium">{spec ? `${spec.storage}GB` : "—"}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-current" />
                      <span className="text-sm font-medium">{cfg.label}</span>
                    </div>

                    <div className="flex justify-start md:justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            void handleEndSession(item.bookingId);
                          } else {
                            void handleStartSession(item.bookingId);
                          }
                        }}
                        disabled={(!canShowStart && !isActive) || isStarting || isEnding || startingBookingId !== null || endingBookingId !== null}
                        className={
                          isActive
                            ? "w-full md:w-auto bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-500/90 hover:to-orange-500/90"
                            : "w-full md:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-500/90 hover:to-cyan-500/90"
                        }
                      >
                        {isEnding ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Ending…
                          </>
                        ) : isStarting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Starting…
                          </>
                        ) : isActive ? (
                          <>
                            <Square className="w-4 h-4 mr-2" />
                            End session
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start session
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}