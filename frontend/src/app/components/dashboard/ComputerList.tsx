import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Monitor, Plus, Edit, Trash2, Search, Power } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "../../api/http";
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

interface Computer {
  pcId: number;
  specId: number;
  specName: string;
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
  operatingSystem: string;
  pricePerHour: number;
  location: string;
  status: string;
}

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type CreatePcRequest = {
  specId?: number;
  specName?: string;
  cpu?: string;
  gpu?: string;
  ram?: number;
  storage?: number;
  operatingSystem?: string;
  description?: string;
  pricePerHour?: number;
  location?: string;
  status?: string;
};

type UpdatePcRequest = Partial<CreatePcRequest>;

function getStatusMeta(status: string) {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "available") {
    return {
      label: "Available",
      className: "bg-accent/20 text-accent border-accent/50",
    };
  }
  if (
    normalized === "in_use" ||
    normalized === "in-use" ||
    normalized === "rented"
  ) {
    return {
      label: "In Use",
      className: "bg-secondary/20 text-secondary border-secondary/50",
    };
  }
  if (normalized === "maintenance") {
    return {
      label: "Maintenance",
      className: "bg-muted/20 text-muted-foreground border-border",
    };
  }
  return {
    label: status || "Unknown",
    className: "bg-muted/20 text-muted-foreground border-border",
  };
}

function detectTier(text: string) {
  const t = text.toLowerCase();
  if (t.includes("basic")) return "basic";
  if (t.includes("pro")) return "pro";
  if (t.includes("ultra")) return "ultra";
  return null;
}

function getStatusDotClass(status: string) {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "available") return "bg-emerald-500";
  if (
    normalized === "in_use" ||
    normalized === "in-use" ||
    normalized === "rented"
  )
    return "bg-blue-500";
  if (normalized === "maintenance") return "bg-yellow-500";
  return "bg-red-500";
}

export function ComputerList() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addMode, setAddMode] = useState<"machine" | "package">("machine");
  const [editingComputer, setEditingComputer] = useState<Computer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState<number | "">(1);
  const [selectedSpecId, setSelectedSpecId] = useState<number | "">("");
  const [formData, setFormData] = useState({
    specName: "",
    cpu: "",
    gpu: "",
    ram: 16,
    storage: 512,
    operatingSystem: "",
    status: "available",
  });
  const [page, setPage] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const pageSize = 4;

  const filteredComputers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const selectedStatus = statusFilter.toLowerCase();
    return computers.filter((pc) => {
      const normalized = (pc.status ?? "").toLowerCase();
      const matchesSearch =
        !q ||
        String(pc.pcId).includes(q) ||
        pc.specName.toLowerCase().includes(q) ||
        pc.cpu.toLowerCase().includes(q) ||
        pc.gpu.toLowerCase().includes(q) ||
        pc.location.toLowerCase().includes(q) ||
        normalized.includes(q);
      const matchesStatus =
        selectedStatus === "all" || normalized === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [computers, searchTerm, statusFilter]);

  const visibleComputers = useMemo(() => {
    return filteredComputers.slice(page * pageSize, page * pageSize + pageSize);
  }, [filteredComputers, page]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredComputers.length / pageSize),
  );

  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter]);

  const loadComputers = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await apiGet<PageResponse<Computer>>("/admin/pcs", {
        page: 0,
        size: 200,
      });
      setComputers(response.content ?? []);
    } catch (e) {
      console.error("ComputerList.loadComputers error:", e);
      const message =
        e instanceof Error ? e.message : "Unable to load computer list";
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadComputers();
  }, []);

  const specOptions = useMemo(() => {
    const map = new Map<number, Computer>();
    for (const pc of computers) {
      if (!map.has(pc.specId)) {
        map.set(pc.specId, pc);
      }
    }
    return Array.from(map.values());
  }, [computers]);

  const stats = {
    total: computers.length,
    available: computers.filter(
      (pc) => (pc.status ?? "").toLowerCase() === "available",
    ).length,
    inUse: computers.filter(
      (pc) =>
        (pc.status ?? "").toLowerCase() === "in_use" ||
        (pc.status ?? "").toLowerCase() === "in-use" ||
        (pc.status ?? "").toLowerCase() === "rented",
    ).length,
    maintenance: computers.filter(
      (pc) => (pc.status ?? "").toLowerCase() === "maintenance",
    ).length,
  };

  const handleAdd = async () => {
    try {
      if (addMode === "machine") {
        if (!selectedSpecId) {
          toast.error("Please select a plan");
          return;
        }
        const q = Number(quantity) || 1;
        for (let i = 0; i < q; i++) {
          // eslint-disable-next-line no-await-in-loop
          await apiPost<Computer, CreatePcRequest>("/admin/pcs", {
            specId: Number(selectedSpecId),
            status: "available",
          });
        }
        toast.success(`Successfully added ${q} computers`);
      } else {
        const payload: CreatePcRequest = {
          specName: formData.specName,
          cpu: formData.cpu,
          gpu: formData.gpu,
          ram: formData.ram,
          storage: formData.storage,
          operatingSystem: formData.operatingSystem,
          pricePerHour: 0,
          status: formData.status,
        };
        await apiPost<Computer, CreatePcRequest>("/admin/pcs", payload);
        toast.success("Successfully created package and sample computer");
      }

      setFormData({
        specName: "",
        cpu: "",
        gpu: "",
        ram: 16,
        storage: 512,
        operatingSystem: "",
        status: "available",
      });
      setQuantity(1);
      setSelectedSpecId("");
      setIsAddDialogOpen(false);
      await loadComputers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to create computer");
    }
  };

  const handleEdit = (computer: Computer) => {
    setEditingComputer(computer);
    setFormData({
      specName: computer.specName,
      cpu: computer.cpu,
      gpu: computer.gpu,
      ram: computer.ram,
      storage: computer.storage,
      operatingSystem: computer.operatingSystem,
      status: computer.status,
    });
  };

  const handleUpdate = async (scope: "single" | "plan" = "single") => {
    if (!editingComputer) return;
    try {
      const payload: UpdatePcRequest = {
        specName: formData.specName,
        cpu: formData.cpu,
        gpu: formData.gpu,
        ram: formData.ram,
        storage: formData.storage,
        operatingSystem: formData.operatingSystem,
        status: formData.status,
      };

      const targetComputers =
        scope === "plan"
          ? computers.filter(
              (pc) =>
                detectTier(pc.specName) ===
                detectTier(editingComputer.specName),
            )
          : [editingComputer];

      for (const targetComputer of targetComputers) {
        // eslint-disable-next-line no-await-in-loop
        await apiPatch<Computer, UpdatePcRequest>(
          `/admin/pcs/${targetComputer.pcId}`,
          payload,
        );
      }

      toast.success("Computer updated successfully");
      setEditingComputer(null);
      await loadComputers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to update computer");
    }
  };

  const handleDelete = async (pcId: number) => {
    if (!confirm("Are you sure you want to delete this computer?")) return;
    try {
      await apiDelete<string>(`/admin/pcs/${pcId}`);
      toast.success("Computer deleted");
      await loadComputers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to delete computer");
    }
  };

  const handleToggleLock = async (computer: Computer) => {
    try {
      if ((computer.status ?? "").toLowerCase() === "maintenance") {
        await apiPatch<Computer, UpdatePcRequest>(
          `/admin/pcs/${computer.pcId}`,
          { status: "available" },
        );
        toast.success("Computer unlocked");
      } else {
        await apiPost<Computer>(`/admin/pcs/${computer.pcId}/lock`);
        toast.success("Computer locked and active session ended");
      }
      await loadComputers();
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Unable to change computer lock status",
      );
    }
  };

  return (
    <div>
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-border bg-card/60">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg">
              <Monitor className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Computers</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/60">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-3 rounded-lg">
              <Power className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Available Computers
              </p>
              <p className="text-2xl font-bold text-accent">
                {stats.available}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/60">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/20 p-3 rounded-lg">
              <Monitor className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In use</p>
              <p className="text-2xl font-bold text-secondary">{stats.inUse}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/60">
          <div className="flex items-center gap-3">
            <div className="bg-muted/20 p-3 rounded-lg">
              <Monitor className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Maintenance</p>
              <p className="text-2xl font-bold text-muted-foreground">
                {stats.maintenance}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, CPU, GPU..."
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

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add New</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAddMode("machine")}
                  className={`px-3 py-2 rounded ${addMode === "machine" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                >
                  Add Computer
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode("package")}
                  className={`px-3 py-2 rounded ${addMode === "package" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                >
                  Add Package
                </button>
              </div>

              {addMode === "machine" && (
                <>
                  <div className="space-y-2">
                    <Label>Select Plan</Label>
                    <Select
                      value={String(selectedSpecId)}
                      onValueChange={(val) => setSelectedSpecId(Number(val))}
                    >
                      <SelectTrigger className="bg-input-background border-border">
                        <SelectValue placeholder="Select package to add computer" />
                      </SelectTrigger>
                      <SelectContent>
                        {specOptions.map((s) => (
                          <SelectItem key={s.specId} value={String(s.specId)}>
                            {s.specName} (#{s.specId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Number of computers to add</Label>
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                      className="bg-input-background border-border"
                    />
                  </div>
                </>
              )}

              {addMode === "package" && (
                <>
                  <div className="space-y-2">
                    <Label>Add New Package</Label>
                    <Input
                      placeholder="Package name (spec name)"
                      value={formData.specName}
                      onChange={(e) =>
                        setFormData({ ...formData, specName: e.target.value })
                      }
                      className="bg-input-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpu">CPU</Label>
                    <Input
                      id="cpu"
                      value={formData.cpu}
                      onChange={(e) =>
                        setFormData({ ...formData, cpu: e.target.value })
                      }
                      className="bg-input-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gpu">GPU</Label>
                    <Input
                      id="gpu"
                      value={formData.gpu}
                      onChange={(e) =>
                        setFormData({ ...formData, gpu: e.target.value })
                      }
                      className="bg-input-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ram">RAM (GB)</Label>
                    <Input
                      id="ram"
                      type="number"
                      value={formData.ram}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ram: Math.max(
                            1,
                            Math.floor(Number(e.target.value) || 1),
                          ),
                        })
                      }
                      className="bg-input-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storage">Storage (GB)</Label>
                    <Input
                      id="storage"
                      type="number"
                      value={formData.storage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          storage: Math.max(
                            1,
                            Math.floor(Number(e.target.value) || 1),
                          ),
                        })
                      }
                      className="bg-input-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operatingSystem">Operating System</Label>
                    <Input
                      id="operatingSystem"
                      value={formData.operatingSystem}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          operatingSystem: e.target.value,
                        })
                      }
                      className="bg-input-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger
                        id="status"
                        className="bg-input-background border-border"
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in_use">In use</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button
                onClick={() => {
                  void handleAdd();
                }}
                className="w-full bg-gradient-to-r from-primary to-accent"
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <Card className="p-12 border-border text-center bg-card/60">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading computer list...</p>
          </Card>
        )}

        {loadError && !isLoading && (
          <Card className="p-8 border-destructive/40 bg-destructive/5 text-center">
            <p className="font-semibold text-destructive mb-2">
              Failed to load computer list
            </p>
            <p className="text-sm text-muted-foreground mb-4">{loadError}</p>
            <Button variant="outline" onClick={() => void loadComputers()}>
              Retry
            </Button>
          </Card>
        )}

        {!isLoading &&
          loadError === null &&
          visibleComputers.length === 0 &&
          computers.length === 0 && (
            <Card className="p-12 border-border text-center bg-card/60">
              <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No computers found.</p>
            </Card>
          )}

        {!isLoading &&
          loadError === null &&
          visibleComputers.length === 0 &&
          computers.length > 0 && (
            <Card className="p-12 border-border text-center bg-card/60">
              <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No computers found</h3>
              <p className="text-muted-foreground">
                Try searching with different keywords or add a new computer
              </p>
            </Card>
          )}

        {!isLoading && loadError === null && visibleComputers.length > 0 && (
          <div className="grid gap-4 xl:grid-cols-2">
            {visibleComputers.map((computer) => (
              <Card
                key={computer.pcId}
                className="border-border bg-card/60 p-4 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">PC #{computer.pcId}</h3>
                    <p className="text-xs text-muted-foreground">
                      {computer.location || computer.specName}
                    </p>
                  </div>
                  <Badge className={getStatusMeta(computer.status).className}>
                    {getStatusMeta(computer.status).label}
                  </Badge>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${getStatusDotClass(computer.status)}`}
                      />
                      <p className="font-semibold truncate">
                        {computer.specName}
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {computer.cpu} • {computer.gpu}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {computer.ram}GB RAM • {computer.storage}GB •{" "}
                      {computer.operatingSystem || "OS N/A"}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary">
                      {formatUsd(Number(computer.pricePerHour))}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleToggleLock(computer)}
                    className={
                      (computer.status ?? "").toLowerCase() === "maintenance"
                        ? "border-accent text-accent hover:bg-accent/10"
                        : "border-yellow-500 text-yellow-600 hover:bg-yellow-500/10"
                    }
                  >
                    {(computer.status ?? "").toLowerCase() === "maintenance"
                      ? "Unlock"
                      : "Lock"}
                  </Button>

                  <Dialog
                    open={editingComputer?.pcId === computer.pcId}
                    onOpenChange={(open) => !open && setEditingComputer(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          (computer.status ?? "").toLowerCase() !== "available"
                        }
                        onClick={() => handleEdit(computer)}
                        className="border-primary text-foreground hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle>Edit Computer</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-specName">
                            Configuration Name (Spec)
                          </Label>
                          <Input
                            id="edit-specName"
                            value={formData.specName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specName: e.target.value,
                              })
                            }
                            className="bg-input-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-cpu">CPU</Label>
                          <Input
                            id="edit-cpu"
                            value={formData.cpu}
                            onChange={(e) =>
                              setFormData({ ...formData, cpu: e.target.value })
                            }
                            className="bg-input-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-gpu">GPU</Label>
                          <Input
                            id="edit-gpu"
                            value={formData.gpu}
                            onChange={(e) =>
                              setFormData({ ...formData, gpu: e.target.value })
                            }
                            className="bg-input-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-ram">RAM (GB)</Label>
                          <Input
                            id="edit-ram"
                            type="number"
                            value={formData.ram}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                ram: Math.max(
                                  1,
                                  Math.floor(Number(e.target.value) || 1),
                                ),
                              })
                            }
                            className="bg-input-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-storage">Storage (GB)</Label>
                          <Input
                            id="edit-storage"
                            type="number"
                            value={formData.storage}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                storage: Math.max(
                                  1,
                                  Math.floor(Number(e.target.value) || 1),
                                ),
                              })
                            }
                            className="bg-input-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-operatingSystem">
                            Operating System
                          </Label>
                          <Input
                            id="edit-operatingSystem"
                            value={formData.operatingSystem}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                operatingSystem: e.target.value,
                              })
                            }
                            className="bg-input-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-status">Computer Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) =>
                              setFormData({ ...formData, status: value })
                            }
                          >
                            <SelectTrigger
                              id="edit-status"
                              className="bg-input-background border-border"
                            >
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">
                                Available
                              </SelectItem>
                              <SelectItem value="in_use">In use</SelectItem>
                              <SelectItem value="maintenance">
                                Maintenance
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Button
                            onClick={() => {
                              void handleUpdate("single");
                            }}
                            className="w-full bg-gradient-to-r from-primary to-accent"
                          >
                            Update This Computer
                          </Button>
                          {detectTier(editingComputer?.specName ?? "") && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                void handleUpdate("plan");
                              }}
                              className="w-full border-primary text-foreground hover:bg-primary/10"
                            >
                              Edit all computers in{" "}
                              {String(
                                detectTier(editingComputer?.specName ?? ""),
                              ).toUpperCase()}
                            </Button>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(computer.pcId)}
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="pt-2">
          <ListPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
