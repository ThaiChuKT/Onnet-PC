import { useEffect, useMemo, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Monitor, Power, Search, Shield, Pencil } from "lucide-react";
import { apiGet, apiPatch, apiPost } from "../../api/http";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ListPagination } from "./ListPagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type AdminPackageItemResponse = {
  planId: number;
  planName: string;
  specId: number;
  specName: string;
  tierName: string | null;
  durationDays: number;
  price: number;
  maxHoursPerDay: number | null;
  active: boolean;
};

type AdminPcItemResponse = {
  pcId: number;
  specId: number;
  specName: string;
  tierName: string | null;
  location: string;
  status: string;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type TierKey = "basic" | "pro" | "ultra";

type TierPackage = {
  tier: TierKey;
  title: string;
  plans: AdminPackageItemResponse[];
  specIds: number[];
  active: boolean;
};

type TierPageState = Record<TierKey, number>;

const TIER_ORDER: TierKey[] = ["basic", "pro", "ultra"];

const TIER_LABELS: Record<TierKey, string> = {
  basic: "Basic",
  pro: "Pro",
  ultra: "Ultra",
};

const DEFAULT_TIER_PAGES: TierPageState = {
  basic: 0,
  pro: 0,
  ultra: 0,
};

function detectTier(text: string): TierKey | null {
  const normalized = text.toLowerCase();
  if (normalized.includes("basic")) return "basic";
  if (normalized.includes("pro")) return "pro";
  if (normalized.includes("ultra")) return "ultra";
  return null;
}

function normalizeTier(value?: string | null): TierKey | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === "basic" || normalized === "pro" || normalized === "ultra") {
    return normalized;
  }
  return detectTier(normalized);
}

function normalizeStatus(status: string) {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "in-use" || normalized === "rented") {
    return "in_use";
  }
  return normalized;
}

function getStatusMeta(status: string) {
  const normalized = normalizeStatus(status);
  if (normalized === "available") {
    return {
      label: "Available",
      badgeClass: "bg-emerald-500/15 text-emerald-600 border-emerald-500/40",
      dotClass: "bg-emerald-500",
    };
  }
  if (normalized === "in_use") {
    return {
      label: "In Use",
      badgeClass: "bg-blue-500/15 text-blue-500 border-blue-500/40",
      dotClass: "bg-blue-500",
    };
  }
  return {
    label: "Maintenance / Unavailable",
    badgeClass: "bg-yellow-500/15 text-yellow-600 border-yellow-500/40",
    dotClass: "bg-yellow-500",
  };
}

function isMachineVisible(
  machine: AdminPcItemResponse,
  searchTerm: string,
  statusFilter: string,
) {
  const q = searchTerm.trim().toLowerCase();
  const normalizedStatus = normalizeStatus(machine.status);
  const matchesSearch =
    !q ||
    String(machine.pcId).includes(q) ||
    String(machine.specId).includes(q) ||
    (machine.specName ?? "").toLowerCase().includes(q) ||
    (machine.tierName ?? "").toLowerCase().includes(q) ||
    (machine.location ?? "").toLowerCase().includes(q) ||
    normalizedStatus.includes(q);
  const matchesStatus =
    statusFilter === "all" || normalizedStatus === statusFilter;
  return matchesSearch && matchesStatus;
}

export function ComputerList() {
  const [packages, setPackages] = useState<AdminPackageItemResponse[]>([]);
  const [machines, setMachines] = useState<AdminPcItemResponse[]>([]);
  const [activeSessions, setActiveSessions] = useState<Record<number, { sessionId: number; userFullName?: string | null; userEmail?: string | null }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierPages, setTierPages] = useState<TierPageState>(DEFAULT_TIER_PAGES);
  const pageSize = 4;
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [packagePage, machinePage] = await Promise.all([
          apiGet<PageResponse<AdminPackageItemResponse>>("/admin/packages", {
            page: 0,
            size: 200,
          }),
          apiGet<PageResponse<AdminPcItemResponse>>("/admin/pcs", {
            page: 0,
            size: 200,
          }),
        ]);
        setPackages(packagePage.content ?? []);
        setMachines(machinePage.content ?? []);
        // load active sessions to display current user on in-use machines
        try {
          const sessionsPage = await apiGet<PageResponse<{ sessionId: number; pcId: number; userFullName?: string | null; userEmail?: string | null }>>("/admin/sessions", { page: 0, size: 500, status: "active" });
          const map: Record<number, { sessionId: number; userFullName?: string | null; userEmail?: string | null }> = {};
          for (const s of sessionsPage.content ?? []) {
            if (s && s.pcId != null) map[Number(s.pcId)] = { sessionId: s.sessionId, userFullName: s.userFullName, userEmail: s.userEmail };
          }
          setActiveSessions(map);
        } catch (ex) {
          // best-effort; don't fail whole load if sessions can't be fetched
          console.warn("Could not load active sessions", ex);
        }
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Unable to load machines";
        setLoadError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    setTierPages(DEFAULT_TIER_PAGES);
  }, [searchTerm, statusFilter]);

  const tierPackages = useMemo(() => {
    const grouped = new Map<TierKey, TierPackage>();

    for (const pkg of packages) {
      const tier = normalizeTier(pkg.tierName) ?? detectTier(`${pkg.planName} ${pkg.specName}`);
      if (!tier) continue;

      const existing = grouped.get(tier);
      if (!existing) {
        grouped.set(tier, {
          tier,
          title: TIER_LABELS[tier],
          plans: [pkg],
          specIds: [pkg.specId],
          active: !!pkg.active,
        });
        continue;
      }

      existing.plans.push(pkg);
      existing.specIds = Array.from(new Set([...existing.specIds, pkg.specId]));
      existing.active = existing.active || !!pkg.active;
    }

    return TIER_ORDER.map((tier) =>
      grouped.get(tier) ?? {
        tier,
        title: TIER_LABELS[tier],
        plans: [],
        specIds: [],
        active: false,
      },
    ).map((entry) => ({
      ...entry,
      plans: [...entry.plans].sort(
        (a, b) => Number(a.durationDays ?? 0) - Number(b.durationDays ?? 0),
      ),
    }));
  }, [packages]);

  const machinesBySpec = useMemo(() => {
    return machines.reduce<Record<number, AdminPcItemResponse[]>>((acc, item) => {
      const key = Number(item.specId);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [machines]);

  const tierMachineStats = useMemo(() => {
    return tierPackages.reduce<Record<TierKey, AdminPcItemResponse[]>>(
      (acc, tierPackage) => {
        const rows = tierPackage.specIds.flatMap(
          (specId) => machinesBySpec[specId] ?? [],
        );
        const tierRows = rows.filter(
          (machine) => normalizeTier(machine.tierName) === tierPackage.tier,
        );
        acc[tierPackage.tier] = tierRows
          .filter((machine) =>
            isMachineVisible(machine, searchTerm, statusFilter),
          )
          .sort((a, b) => Number(a.pcId) - Number(b.pcId));
        return acc;
      },
      { basic: [], pro: [], ultra: [] },
    );
  }, [machinesBySpec, searchTerm, statusFilter, tierPackages]);

  const stats = useMemo(() => {
    const allMachines = machines;
    return {
      total: allMachines.length,
      available: allMachines.filter(
        (machine) => normalizeStatus(machine.status) === "available",
      ).length,
      inUse: allMachines.filter(
        (machine) => normalizeStatus(machine.status) === "in_use",
      ).length,
      maintenance: allMachines.filter(
        (machine) => normalizeStatus(machine.status) === "maintenance",
      ).length,
    };
  }, [machines]);

  const handleToggleLock = async (machine: AdminPcItemResponse) => {
    const status = normalizeStatus(machine.status);
    if (status === "in_use") {
      toast.error("Cannot lock a machine while it is in use. End the session first.");
      return;
    }

    try {
      if (status === "maintenance") {
        await apiPatch<AdminPcItemResponse, { status: string }>(
          `/admin/pcs/${machine.pcId}`,
          { status: "available" },
        );
        toast.success(`Machine #${machine.pcId} unlocked`);
      } else {
        await apiPost<AdminPcItemResponse>(`/admin/pcs/${machine.pcId}/lock`);
        toast.success(`Machine #${machine.pcId} locked and sessions ended`);
      }
      const machinePage = await apiGet<PageResponse<AdminPcItemResponse>>(
        "/admin/pcs",
        { page: 0, size: 200 },
      );
      setMachines(machinePage.content ?? []);
      // refresh sessions map as well
      try {
        const sessionsPage = await apiGet<PageResponse<{ sessionId: number; pcId: number; userFullName?: string | null; userEmail?: string | null }>>("/admin/sessions", { page: 0, size: 500, status: "active" });
        const map: Record<number, { sessionId: number; userFullName?: string | null; userEmail?: string | null }> = {};
        for (const s of sessionsPage.content ?? []) {
          if (s && s.pcId != null) map[Number(s.pcId)] = { sessionId: s.sessionId, userFullName: s.userFullName, userEmail: s.userEmail };
        }
        setActiveSessions(map);
      } catch {
        // ignore
      }
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Unable to update machine status",
      );
    }
  };

  const renderMachineCard = (machine: AdminPcItemResponse) => {
    const statusMeta = getStatusMeta(machine.status);
    const isInUse = normalizeStatus(machine.status) === "in_use";
    const active = activeSessions[Number(machine.pcId)];

    return (
      <Card
        key={machine.pcId}
        onClick={() => {
          if (isInUse) navigate(`/dashboard/sessions?pcId=${machine.pcId}`);
        }}
        className={`border-border bg-card/70 p-4 ${isInUse ? "cursor-pointer hover:border-primary/30" : ""}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${statusMeta.dotClass}`} />
              <p className="font-semibold truncate">PC #{machine.pcId}</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground truncate">
              {machine.location || machine.specName}
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              Spec #{machine.specId} • {machine.specName}
            </p>
          </div>

          <Badge className={statusMeta.badgeClass}>{statusMeta.label}</Badge>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              // prevent card click
              e.stopPropagation();
              void handleToggleLock(machine);
            }}
            disabled={isInUse}
            className={
              normalizeStatus(machine.status) === "maintenance"
                ? "border-accent text-accent hover:bg-accent/10"
                : "border-yellow-500 text-yellow-600 hover:bg-yellow-500/10"
            }
          >
            <Shield className="mr-2 h-4 w-4" />
            {normalizeStatus(machine.status) === "maintenance" ? "Unlock" : "Lock"}
          </Button>
          {isInUse && (
            <div className="text-sm text-blue-500">
              <div>In use by</div>
              <div className="font-medium">{active?.userFullName ?? active?.userEmail ?? "Unknown user"}</div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="p-4 border-border bg-card/60">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg">
              <Monitor className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total machines</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/60">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-3 rounded-lg">
              <Monitor className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-emerald-500">
                {stats.available}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/60">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Monitor className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In use</p>
              <p className="text-2xl font-bold text-blue-500">{stats.inUse}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/60">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Monitor className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-500">
                {stats.maintenance}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search machines by ID, location, spec, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input-background border-border"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[220px] bg-input-background border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in_use">In use</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <Card className="p-12 border-border text-center bg-card/60">
          <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading machines...</p>
        </Card>
      )}

      {loadError && !isLoading && (
        <Card className="p-8 border-destructive/40 bg-destructive/5 text-center">
          <p className="font-semibold text-destructive mb-2">
            Failed to load machines
          </p>
          <p className="text-sm text-muted-foreground mb-4">{loadError}</p>
          <Button
            variant="outline"
            onClick={() => {
              setLoadError(null);
              void (async () => {
                setIsLoading(true);
                try {
                  const [packagePage, machinePage] = await Promise.all([
                    apiGet<PageResponse<AdminPackageItemResponse>>("/admin/packages", {
                      page: 0,
                      size: 200,
                    }),
                    apiGet<PageResponse<AdminPcItemResponse>>("/admin/pcs", {
                      page: 0,
                      size: 200,
                    }),
                  ]);
                  setPackages(packagePage.content ?? []);
                  setMachines(machinePage.content ?? []);
                } catch (e) {
                  toast.error(
                    e instanceof Error ? e.message : "Unable to reload machines",
                  );
                } finally {
                  setIsLoading(false);
                }
              })();
            }}
          >
            Retry
          </Button>
        </Card>
      )}

      {!isLoading && !loadError && (
        <div className="grid gap-4 xl:grid-cols-3">
          {tierPackages.map((tierPackage) => {
            const visibleMachines = tierMachineStats[tierPackage.tier];
            const currentPage = tierPages[tierPackage.tier];
            const totalPages = Math.ceil(visibleMachines.length / pageSize);
            const pageItems = visibleMachines.slice(
              currentPage * pageSize,
              currentPage * pageSize + pageSize,
            );
            // planSummary removed — not currently displayed

            return (
              <Card key={tierPackage.tier} className="border-border bg-card/50 p-5">
                <div className="mb-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/20 p-2">
                          <Power className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">{tierPackage.title}</h3>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {tierPackage.specIds.length} spec link{tierPackage.specIds.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/packages/${tierPackage.tier}/edit`)}
                      className="border-primary text-primary hover:bg-primary/10"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit prices
                    </Button>
                  </div>


                </div>

                <div className="space-y-3">
                  {pageItems.length > 0 ? (
                    pageItems.map((machine) => renderMachineCard(machine))
                  ) : (
                    <Card className="border-border bg-muted/20 p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        No machines match this package, filter, or search.
                      </p>
                    </Card>
                  )}
                </div>

                <div className="mt-4">
                  <ListPagination
                    page={currentPage}
                    totalPages={Math.max(totalPages, 0)}
                    onPageChange={(page) =>
                      setTierPages((prev) => ({ ...prev, [tierPackage.tier]: page }))
                    }
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && !loadError && machines.length === 0 && (
        <Card className="p-12 border-border text-center bg-card/60 mt-4">
          <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No machines found.</p>
        </Card>
      )}
    </div>
  );
}
