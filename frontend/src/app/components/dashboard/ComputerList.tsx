import { useEffect, useMemo, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Monitor, Power, Search, Shield, Pencil, Settings, DollarSign } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type TierSpecPlanPlanResponse  = {
  planId: number;
  planName: string;
  durationDays: number;
  price: number;
  maxHoursPerDay: null;
  active: boolean;
};

type TierSpecPlanSpecResponse = {
  specId: number;
  specName: string;
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
  operatingSystem: string;
  description: string;
  pricePerHour: number;
  exclusive: boolean;
  available: boolean;
  plans: TierSpecPlanPlanResponse[];
};

type TierSpecPlanTierResponse = {
  tierId: number;
  tierName: string;
  tierLevel: number;
  active: boolean;
  specs: TierSpecPlanSpecResponse[];
};

type TierSpecPlanCatalogResponse = {
  tiers: TierSpecPlanTierResponse[];
  unassignedSpecs: TierSpecPlanSpecResponse[];
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

type CombinedPlan = TierSpecPlanPlanResponse & { specId: number; specName: string };

type TierPackage = {
  tier: TierKey;
  title: string;
  plans: CombinedPlan[];
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
      badgeClass: "bg-blue-500/15 text-blue-500 border-blue-500/40",
      dotClass: "bg-blue-500",
    };
  }
  if (normalized === "in_use") {
    return {
      label: "In Use",
      badgeClass: "bg-emerald-500/15 text-emerald-600 border-emerald-500/40 animate-pulse",
      dotClass: "bg-emerald-500",
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
  const [catalog, setCatalog] = useState<TierSpecPlanCatalogResponse | null>(null);
  const [machines, setMachines] = useState<AdminPcItemResponse[]>([]);
  const [activeSessions, setActiveSessions] = useState<Record<number, { sessionId: number; userFullName?: string | null; userEmail?: string | null }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierPages, setTierPages] = useState<TierPageState>(DEFAULT_TIER_PAGES);
  
  // State for Dropdown and Edit Plan
  const [openEditMenu, setOpenEditMenu] = useState<TierKey | null>(null);
  const [editPlanTier, setEditPlanTier] = useState<TierPackage | null>(null);
  const [addSpecId, setAddSpecId] = useState("");
  const [addQuantity, setAddQuantity] = useState("1");
  const [isAdding, setIsAdding] = useState(false);
  const [lockFromId, setLockFromId] = useState("");
  const [lockToId, setLockToId] = useState("");
  const [isBulkLocking, setIsBulkLocking] = useState(false);

  const pageSize = 4;
  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [catalogData, machinePage] = await Promise.all([
        apiGet<TierSpecPlanCatalogResponse>("/pcs/tier-spec-plans"),
        apiGet<PageResponse<AdminPcItemResponse>>("/admin/pcs", {
          page: 0,
          size: 200,
        }),
      ]);
      setCatalog(catalogData);
      setMachines(machinePage.content ?? []);
      try {
        const sessionsPage = await apiGet<PageResponse<{ sessionId: number; pcId: number; userFullName?: string | null; userEmail?: string | null }>>("/admin/sessions", { page: 0, size: 500, status: "active" });
        const map: Record<number, { sessionId: number; userFullName?: string | null; userEmail?: string | null }> = {};
        for (const s of sessionsPage.content ?? []) {
          if (s && s.pcId != null) map[Number(s.pcId)] = { sessionId: s.sessionId, userFullName: s.userFullName, userEmail: s.userEmail };
        }
        setActiveSessions(map);
      } catch (ex) {
        console.warn("Could not load active sessions", ex);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to load machines";
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    setTierPages(DEFAULT_TIER_PAGES);
  }, [searchTerm, statusFilter]);

  const tierPackages = useMemo(() => {
    if (!catalog) return [];

    return TIER_ORDER.map((tierKey) => {
      const matchedTier = catalog.tiers.find(t => normalizeTier(t.tierName) === tierKey);
      
      const allPlans: CombinedPlan[] = [];
      const specIds: number[] = [];
      
      if (matchedTier) {
        matchedTier.specs.forEach(spec => {
          specIds.push(spec.specId);
          spec.plans.forEach(plan => {
            allPlans.push({
              ...plan,
              specId: spec.specId,
              specName: spec.specName,
            });
          });
        });
      }

      return {
        tier: tierKey,
        title: TIER_LABELS[tierKey],
        plans: allPlans.sort((a, b) => a.durationDays - b.durationDays),
        specIds: Array.from(new Set(specIds)),
        active: matchedTier?.active ?? false,
      };
    });
  }, [catalog]);

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

  const unassignedPlans = useMemo(() => {
    if (!catalog) return [];
    const unassigned: CombinedPlan[] = [];
    catalog.unassignedSpecs.forEach(spec => {
      spec.plans.forEach(plan => {
        unassigned.push({
          ...plan,
          specId: spec.specId,
          specName: spec.specName,
        });
      });
    });
    return unassigned.sort((a, b) => a.planId - b.planId);
  }, [catalog]);

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

  // Tự động phân tích khoảng ID được chọn để đưa ra Trạng thái và Nút bấm phù hợp
  const bulkState = useMemo(() => {
    const from = parseInt(lockFromId);
    const to = parseInt(lockToId);

    if (isNaN(from) || isNaN(to) || from > to) {
      return { action: "lock", disabled: true, label: "Lock / Unlock", className: "" };
    }

    const rangeMachines = machines.filter((m) => m.pcId >= from && m.pcId <= to);
    const expectedCount = to - from + 1;

    if (rangeMachines.length === 0 || rangeMachines.length !== expectedCount) {
       return { action: "lock", disabled: true, label: "Invalid range / Missing PCs", className: "" };
    }

    const allAvailable = rangeMachines.every(m => normalizeStatus(m.status) === "available");
    const allMaintenance = rangeMachines.every(m => normalizeStatus(m.status) === "maintenance");

    if (allAvailable) {
      return { action: "lock", disabled: false, label: "Lock Selected", className: "border-yellow-500 text-yellow-600 hover:bg-yellow-500/10" };
    }
    if (allMaintenance) {
      return { action: "unlock", disabled: false, label: "Unlock Selected", className: "border-accent text-accent hover:bg-accent/10" };
    }

    return { action: "lock", disabled: true, label: "Mixed states or In-use PCs", className: "" };
  }, [lockFromId, lockToId, machines]);

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
        toast.success(`Machine #${machine.pcId} locked for maintenance`);
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

  const handleAddMachines = async () => {
    const qty = parseInt(addQuantity);
    const spec = parseInt(addSpecId);

    if (isNaN(qty) || qty <= 0 || isNaN(spec)) {
      toast.error("Invalid quantity or spec");
      return;
    }

    const selectedPlan = editPlanTier?.plans.find(p => p.specId === spec);
    const specName = selectedPlan?.specName || "Unknown";

    setIsAdding(true);
    try {
      const promises = [];
      for (let i = 0; i < qty; i++) {
        promises.push(
          apiPost("/admin/pcs", {
            specId: spec,
            status: "available",
            specName: specName,
            pricePerHour: 0,
            location: "N/A",
          })
        );
      }
      await Promise.all(promises);
      toast.success(`Successfully added ${qty} machines`);
      await loadData();
      setAddQuantity("1");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add machines");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBulkLock = async (action: "lock" | "unlock") => {
    const from = parseInt(lockFromId);
    const to = parseInt(lockToId);

    if (isNaN(from) || isNaN(to) || from > to) {
      toast.error("Invalid range: 'From' must be less than or equal to 'To'");
      return;
    }

    setIsBulkLocking(true);
    try {
      const promises = [];
      for (let i = from; i <= to; i++) {
        if (action === "lock") {
          promises.push(apiPost(`/admin/pcs/${i}/lock`));
        } else {
          promises.push(apiPatch(`/admin/pcs/${i}`, { status: "available" }));
        }
      }
      await Promise.allSettled(promises);
      toast.success(`Bulk ${action} processed for PCs #${from} to #${to}`);
      await loadData();
      setLockFromId("");
      setLockToId("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `Failed to process bulk ${action}`);
    } finally {
      setIsBulkLocking(false);
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
            <div className="text-sm text-emerald-600">
              <div>Session started by</div>
              <div className="font-bold">{active?.userFullName ?? active?.userEmail ?? "Unknown user"}</div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card 
            role="button"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
            className="p-4 border-border bg-card/60 cursor-pointer hover:border-primary/30 hover:shadow-2xl">
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

        <Card
          role="button"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("available");
          }}
          className="p-4 border-border bg-card/60 cursor-pointer hover:border-primary/30 hover:shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Monitor className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-blue-500">{stats.available}</p>
            </div>
          </div>
        </Card>

        <Card
          role="button"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("in_use");
          }}
          className="p-4 border-border bg-card/60 cursor-pointer hover:border-primary/30 hover:shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-3 rounded-lg">
              <Monitor className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In use</p>
              <p className="text-2xl font-bold text-emerald-500">{stats.inUse}</p>
            </div>
          </div>
        </Card>

        <Card
          role="button"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("maintenance");
          }}
          className="p-4 border-border bg-card/60 cursor-pointer hover:border-primary/30 hover:shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Monitor className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.maintenance}</p>
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
              void loadData();
            }}
          >
            Retry
          </Button>
        </Card>
      )}

      {!isLoading && !loadError && (
        <div className="space-y-4">
          {unassignedPlans.length > 0 && (
            <Card className="border-border bg-amber-50/30 p-4">
              <h3 className="text-sm font-semibold text-amber-700">Unassigned plans (chua map tier)</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Cac plan nay da luu DB nhung chua xac dinh duoc Basic/Pro/Ultra, nen khong vao cac cot tier ben duoi.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {unassignedPlans.map((plan) => (
                  <Badge key={plan.planId} className="bg-amber-100 text-amber-800 border-amber-200">
                    #{plan.planId} {plan.planName} - ${Number(plan.price ?? 0).toFixed(2)} / {plan.durationDays}d
                  </Badge>
                ))}
              </div>
            </Card>
          )}

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
                      <p className="mt-2 text-sm text-muted-foreground ">
                        Current plans price:{" "}
                        <p className="text-muted-foreground gap-1 mt-1 space-x-1 text-xs">
                        {tierPackage.plans.length > 0
                          ? Array.from(new Map(tierPackage.plans.map(p => [p.durationDays, p])).values())
                              .map((p) => `$${p.price.toFixed(2)} / ${p.durationDays} days`)
                              .join(", ")
                          : "No plans available"}
                      </p>
                    </p>
                    </div>
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOpenEditMenu(openEditMenu === tierPackage.tier ? null : tierPackage.tier)}
                        className="border-primary text-primary hover:bg-primary/10"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      {openEditMenu === tierPackage.tier && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenEditMenu(null)}></div>
                          <div className="absolute right-0 mt-2 w-40 rounded-md border border-border bg-popover text-popover-foreground shadow-md z-50 p-1">
                            <button
                              onClick={() => { setOpenEditMenu(null); navigate(`/dashboard/packages/${tierPackage.tier}/edit`); }}
                              className="w-full flex items-center px-2 py-2 text-sm hover:bg-muted rounded-sm transition-colors"
                            >
                              <DollarSign className="w-4 h-4 mr-2" /> Edit prices
                            </button>
                            <button
                              onClick={() => { 
                                setOpenEditMenu(null); 
                                setEditPlanTier(tierPackage); 
                                setAddSpecId(tierPackage.plans[0]?.specId.toString() ?? "");
                              }}
                              className="w-full flex items-center px-2 py-2 text-sm hover:bg-muted rounded-sm transition-colors"
                            >
                              <Settings className="w-4 h-4 mr-2" /> Edit plan
                            </button>
                          </div>
                        </>
                      )}
                    </div>
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
        </div>
      )}

      {!isLoading && !loadError && machines.length === 0 && (
        <Card className="p-12 border-border text-center bg-card/60 mt-4">
          <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No machines found.</p>
        </Card>
      )}

      <Dialog open={!!editPlanTier} onOpenChange={(open) => !open && setEditPlanTier(null)}>
        <DialogContent className="sm:max-w-lg border-border bg-card">
          <DialogHeader>
            <DialogTitle>Manage {editPlanTier?.title} Plan</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
              <h4 className="font-semibold text-sm">Add machines to this plan</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Configuration</label>
                  <Select value={addSpecId} onValueChange={setAddSpecId}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select configuration..." />
                    </SelectTrigger>
                    <SelectContent>
                    {Array.from(new Map(editPlanTier?.plans.map(p => [p.specId, p])).values()).map(p => (
                        <SelectItem key={p.specId} value={p.specId.toString()}>
                          {p.specName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Quantity</label>
                  <Input type="number" min={1} value={addQuantity} onChange={e => setAddQuantity(e.target.value)} className="bg-background" />
                </div>
              </div>
              <Button onClick={handleAddMachines} disabled={isAdding || !addSpecId || !addQuantity} className="w-full">
                {isAdding ? "Adding..." : "Add Machines"}
              </Button>
            </div>

            <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
              <h4 className="font-semibold text-sm">Bulk Lock / Unlock</h4>
              <p className="text-xs text-muted-foreground">Select a range of PC IDs to apply bulk actions.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">From PC ID</label>
                  <Input type="number" min={1} value={lockFromId} onChange={e => setLockFromId(e.target.value)} placeholder="e.g. 1" className="bg-background" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">To PC ID</label>
                  <Input type="number" min={1} value={lockToId} onChange={e => setLockToId(e.target.value)} placeholder="e.g. 10" className="bg-background" />
                </div>
              </div>
              <div className="pt-1">
                <Button variant="outline" onClick={() => handleBulkLock(bulkState.action as "lock" | "unlock")} disabled={isBulkLocking || bulkState.disabled} className={`w-full ${bulkState.className}`}>
                  {isBulkLocking ? "Processing..." : bulkState.label}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
