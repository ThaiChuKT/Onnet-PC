import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Link2, Monitor, RefreshCw, Save, Search, Wifi } from "lucide-react";
import { apiGet, apiPatch, apiPost } from "../../api/http";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ListPagination } from "./ListPagination";

type SunshineHost = {
  id: number;
  name: string;
  hostAddress: string;
  hostPort: number;
  enabled: boolean;
  notes: string | null;
  pcId: number | null;
};

type HostSaveRequest = {
  name: string;
  hostAddress: string;
  hostPort: number;
  notes?: string;
  enabled?: boolean;
  pcId?: number;
};

type AdminPcItemResponse = {
  pcId: number;
  specId: number;
  specName: string;
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
  location: string | null;
  status: string | null;
  tierName: string | null;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type Draft = {
  hostId: number | null;
  hostAddress: string;
  hostPort: string;
  enabled: boolean;
  notes: string;
};

const DEFAULT_PORT = "47989";
const PAGE_SIZE = 4;

function makeDraft(host?: SunshineHost): Draft {
  return {
    hostId: host?.id ?? null,
    hostAddress: host?.hostAddress ?? "",
    hostPort: String(host?.hostPort ?? DEFAULT_PORT),
    enabled: host?.enabled ?? true,
    notes: host?.notes ?? "",
  };
}

function hostNameForPc(pc: AdminPcItemResponse) {
  return `PC #${pc.pcId} - ${pc.specName}`;
}

export function SunshineManagement() {
  const [hosts, setHosts] = useState<SunshineHost[]>([]);
  const [machines, setMachines] = useState<AdminPcItemResponse[]>([]);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingPcId, setSavingPcId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [hostRows, machinePage] = await Promise.all([
        apiGet<SunshineHost[]>("/admin/moonlight/hosts"),
        apiGet<PageResponse<AdminPcItemResponse>>("/admin/pcs", {
          page: 0,
          size: 500,
        }),
      ]);

      const nextHosts = hostRows ?? [];
      const nextMachines = machinePage.content ?? [];
      const hostByPcId = new Map(nextHosts.filter((host) => host.pcId !== null).map((host) => [host.pcId as number, host]));

      setHosts(nextHosts);
      setMachines(nextMachines);
      setDrafts((current) => {
        const next: Record<number, Draft> = {};
        for (const pc of nextMachines) {
          next[pc.pcId] = current[pc.pcId] ?? makeDraft(hostByPcId.get(pc.pcId));
        }
        return next;
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load Sunshine assignments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const hostByPcId = useMemo(
    () => new Map(hosts.filter((host) => host.pcId !== null).map((host) => [host.pcId as number, host])),
    [hosts],
  );

  const unassignedHosts = useMemo(
    () => hosts.filter((host) => host.pcId === null),
    [hosts],
  );

  const filteredMachines = useMemo(() => {
    const query = search.trim().toLowerCase();

    return machines.filter((pc) => {
      const host = hostByPcId.get(pc.pcId);
      const assigned = Boolean(host);
      const draft = drafts[pc.pcId] ?? makeDraft(host);

      if (assignmentFilter === "assigned" && !assigned) return false;
      if (assignmentFilter === "unassigned" && assigned) return false;
      if (assignmentFilter === "enabled" && !draft.enabled) return false;
      if (assignmentFilter === "disabled" && draft.enabled) return false;
      if (statusFilter !== "all" && (pc.status ?? "").toLowerCase() !== statusFilter) return false;

      if (!query) return true;

      const searchable = [
        pc.pcId,
        pc.specName,
        pc.cpu,
        pc.gpu,
        pc.ram,
        pc.storage,
        pc.location,
        pc.status,
        pc.tierName,
        draft.hostAddress,
        draft.hostPort,
        draft.notes,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [assignmentFilter, drafts, hostByPcId, machines, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMachines.length / PAGE_SIZE));
  const visibleMachines = filteredMachines.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [assignmentFilter, search, statusFilter]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const updateDraft = (pcId: number, patch: Partial<Draft>) => {
    setDrafts((current) => ({
      ...current,
      [pcId]: {
        ...makeDraft(hostByPcId.get(pcId)),
        ...current[pcId],
        ...patch,
      },
    }));
  };

  const handleSave = async (pc: AdminPcItemResponse) => {
    const draft = drafts[pc.pcId] ?? makeDraft(hostByPcId.get(pc.pcId));
    const hostAddress = draft.hostAddress.trim();
    const hostPort = Number(draft.hostPort);

    if (!hostAddress) {
      toast.error("Enter a Sunshine host IP or DNS name");
      return;
    }
    if (!Number.isInteger(hostPort) || hostPort < 1 || hostPort > 65535) {
      toast.error("Port must be between 1 and 65535");
      return;
    }

    const existing = hostByPcId.get(pc.pcId);
    const payload: HostSaveRequest = {
      name: hostNameForPc(pc),
      hostAddress,
      hostPort,
      notes: draft.notes.trim() || undefined,
      enabled: draft.enabled,
      pcId: pc.pcId,
    };

    setSavingPcId(pc.pcId);
    try {
      if (existing) {
        await apiPatch<SunshineHost, HostSaveRequest>(`/admin/moonlight/hosts/${existing.id}`, payload);
        toast.success(`Updated Sunshine host for PC #${pc.pcId}`);
      } else {
        await apiPost<SunshineHost, HostSaveRequest>("/admin/moonlight/hosts", payload);
        toast.success(`Assigned Sunshine host to PC #${pc.pcId}`);
      }
      await loadData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save Sunshine assignment");
    } finally {
      setSavingPcId(null);
    }
  };

  const assignedCount = hosts.filter((host) => host.pcId !== null).length;
  const enabledCount = hosts.filter((host) => host.enabled).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 border-border bg-card/50">
          <p className="text-sm text-muted-foreground">Assigned machines</p>
          <p className="text-2xl font-bold">{assignedCount}</p>
        </Card>
        <Card className="p-4 border-border bg-card/50">
          <p className="text-sm text-muted-foreground">Enabled hosts</p>
          <p className="text-2xl font-bold text-accent">{enabledCount}</p>
        </Card>
        <Card className="p-4 border-border bg-card/50">
          <p className="text-sm text-muted-foreground">Machines</p>
          <p className="text-2xl font-bold">{machines.length}</p>
        </Card>
      </div>

      <Card className="border-border bg-card/60">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold">Sunshine host assignments</h3>
            <p className="text-sm text-muted-foreground">
              Assign each PC to the Sunshine IP address it should launch from.
            </p>
          </div>
          <Button variant="outline" onClick={() => void loadData()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="grid gap-3 border-b border-border p-5 lg:grid-cols-[minmax(240px,1fr)_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search PC, spec, IP, status, notes"
              className="pl-10"
            />
          </div>

          <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Assignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignments</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="enabled">Enabled hosts</SelectItem>
              <SelectItem value="disabled">Disabled hosts</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Machine status" />
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
          <div className="p-10 text-center text-muted-foreground">
            <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin" />
            Loading Sunshine assignments...
          </div>
        )}

        {!isLoading && machines.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">
            <Monitor className="mx-auto mb-3 h-8 w-8" />
            No machines found.
          </div>
        )}

        {!isLoading && machines.length > 0 && filteredMachines.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">
            <Search className="mx-auto mb-3 h-8 w-8" />
            No Sunshine assignments match your filters.
          </div>
        )}

        {!isLoading && visibleMachines.length > 0 && (
          <div className="divide-y divide-border">
            {visibleMachines.map((pc) => {
              const existing = hostByPcId.get(pc.pcId);
              const draft = drafts[pc.pcId] ?? makeDraft(existing);
              const isSaving = savingPcId === pc.pcId;

              return (
                <div key={pc.pcId} className="grid gap-4 p-5 xl:grid-cols-[1.4fr_1fr_120px_110px_1fr_auto] xl:items-end">
                  <div>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-primary" />
                      <p className="font-bold">PC #{pc.pcId}</p>
                      {existing && <Check className="h-4 w-4 text-money" />}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{pc.specName}</p>
                    <p className="text-xs text-muted-foreground">
                      {pc.cpu} / {pc.gpu} / {pc.ram}GB RAM / {pc.storage}GB
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {pc.location || "No location"} - {pc.status || "unknown"}
                    </p>
                  </div>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Host IP / DNS</span>
                    <Input
                      value={draft.hostAddress}
                      onChange={(event) => updateDraft(pc.pcId, { hostAddress: event.target.value })}
                      placeholder="Input IP address"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Port</span>
                    <Input
                      value={draft.hostPort}
                      onChange={(event) => updateDraft(pc.pcId, { hostPort: event.target.value })}
                      placeholder="47989"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Enabled</span>
                    <button
                      type="button"
                      onClick={() => updateDraft(pc.pcId, { enabled: !draft.enabled })}
                      className={`flex h-10 w-full items-center justify-center rounded-md border text-sm font-medium ${
                        draft.enabled
                          ? "border-money/40 bg-money/10 text-money"
                          : "border-border bg-muted/30 text-muted-foreground"
                      }`}
                    >
                      {draft.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Notes</span>
                    <Input
                      value={draft.notes}
                      onChange={(event) => updateDraft(pc.pcId, { notes: event.target.value })}
                      placeholder="Optional notes"
                    />
                  </label>

                  <Button onClick={() => void handleSave(pc)} disabled={isSaving} className="h-10">
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : existing ? "Update" : "Assign"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && filteredMachines.length > PAGE_SIZE && (
          <div className="border-t border-border p-5">
            <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filteredMachines.length)} of {filteredMachines.length}
            </p>
          </div>
        )}
      </Card>

      {unassignedHosts.length > 0 && (
        <Card className="border-border bg-card/60 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Unassigned Sunshine hosts</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {unassignedHosts.map((host) => (
              <div key={host.id} className="rounded-md border border-border bg-muted/20 p-3">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-primary" />
                  <p className="font-semibold">{host.name}</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {host.hostAddress}:{host.hostPort}
                </p>
                {host.notes && <p className="mt-1 text-xs text-muted-foreground">{host.notes}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
