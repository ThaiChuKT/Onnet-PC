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
import { Monitor, Plus, Edit, Trash2, Search, Power, Settings2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "../../api/http";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
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
    return { label: "Máy Trống", className: "bg-accent/20 text-accent border-accent/50" };
  }
  if (normalized === "in_use" || normalized === "in-use" || normalized === "rented") {
    return { label: "Đang cho thuê", className: "bg-secondary/20 text-secondary border-secondary/50" };
  }
  if (normalized === "maintenance") {
    return { label: "Bảo trì", className: "bg-muted/20 text-muted-foreground border-border" };
  }
  return { label: status || "Không rõ", className: "bg-muted/20 text-muted-foreground border-border" };
}

function detectTier(text: string) {
  const t = text.toLowerCase();
  if (t.includes("basic")) return "basic";
  if (t.includes("pro")) return "pro";
  if (t.includes("ultra")) return "ultra";
  return null;
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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("available");
  const [page, setPage] = useState(0);
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

  const totalPages = Math.max(1, Math.ceil(filteredComputers.length / pageSize));

  const visibleComputers = useMemo(() => {
    return filteredComputers.slice(page * pageSize, page * pageSize + pageSize);
  }, [filteredComputers, page]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter]);

  const loadComputers = async () => {
    setIsLoading(true);
    try {
      const response = await apiGet<PageResponse<Computer>>("/admin/pcs", { page: 0, size: 200 });
      setComputers(response.content ?? []);
    } catch (e) {
      console.error("ComputerList.loadComputers error:", e);
      toast.error(e instanceof Error ? e.message : "Không thể tải danh sách máy");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadComputers();
  }, []);

  const tierGroups = useMemo(() => {
    const map = new Map<string, Computer[]>();
    for (const pc of visibleComputers) {
      const key = detectTier(pc.specName) ?? "other";
      const arr = map.get(key) ?? [];
      arr.push(pc);
      map.set(key, arr);
    }
    return map;
  }, [visibleComputers]);

  const specOptions = useMemo(() => {
    const map = new Map<number, Computer>();
    for (const pc of computers) {
      if (!map.has(pc.specId)) {
        map.set(pc.specId, pc);
      }
    }
    return Array.from(map.values());
  }, [computers]);

  const handleAdd = async () => {
    try {
      if (addMode === "machine") {
        if (!selectedSpecId) {
          toast.error("Vui lòng chọn gói (plan)");
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
        toast.success(`Đã thêm ${q} máy thành công`);
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
        toast.success("Tạo gói và máy mẫu thành công");
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
      toast.error(e instanceof Error ? e.message : "Không thể tạo máy");
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
          ? computers.filter((pc) => detectTier(pc.specName) === detectTier(editingComputer.specName))
          : [editingComputer];

      for (const targetComputer of targetComputers) {
        // eslint-disable-next-line no-await-in-loop
        await apiPatch<Computer, UpdatePcRequest>(`/admin/pcs/${targetComputer.pcId}`, payload);
      }
      toast.success("Cập nhật máy thành công");
      setEditingComputer(null);
      await loadComputers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể cập nhật máy");
    }
  };

  const handleDelete = async (pcId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa máy này?")) return;
    try {
      await apiDelete<string>(`/admin/pcs/${pcId}`);
      toast.success("Đã xóa máy");
      await loadComputers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể xóa máy");
    }
  };

  const handleToggleLock = async (computer: Computer) => {
    try {
      if ((computer.status ?? "").toLowerCase() === "maintenance") {
        await apiPatch<Computer, UpdatePcRequest>(`/admin/pcs/${computer.pcId}`, { status: "available" });
        toast.success("Đã mở khóa máy");
      } else {
        await apiPost<Computer>(`/admin/pcs/${computer.pcId}/lock`);
        toast.success("Đã khóa máy và kết thúc phiên đang hoạt động");
      }
      await loadComputers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể thay đổi trạng thái khóa máy");
    }
  };

  const getStatusDotClass = (status: string) => {
    const normalized = (status ?? "").toLowerCase();
    if (normalized === "available") return "bg-emerald-500";
    if (normalized === "in_use" || normalized === "in-use" || normalized === "rented") return "bg-blue-500";
    if (normalized === "maintenance") return "bg-yellow-500";
    return "bg-red-500";
  };

  const stats = {
    total: computers.length,
    available: computers.filter((pc) => (pc.status ?? "").toLowerCase() === "available").length,
    inUse: computers.filter((pc) => (pc.status ?? "").toLowerCase() === "in_use").length,
    maintenance: computers.filter((pc) => (pc.status ?? "").toLowerCase() === "maintenance").length,
  };

  const selectStatusFilter = (nextStatus: string) => {
    setStatusFilter(nextStatus);
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <button type="button" onClick={() => selectStatusFilter("all")} className="text-left">
          <Card className={`p-4 border-border bg-card/50 transition-all ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg">
              <Monitor className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng số máy</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
          </Card>
        </button>

        <button type="button" onClick={() => selectStatusFilter("available")} className="text-left">
          <Card className={`p-4 border-border bg-card/50 transition-all ${statusFilter === "available" ? "ring-2 ring-primary" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-3 rounded-lg">
              <Power className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Máy trống</p>
              <p className="text-2xl font-bold text-accent">{stats.available}</p>
            </div>
          </div>
          </Card>
        </button>

        <button type="button" onClick={() => selectStatusFilter("in_use")} className="text-left">
          <Card className={`p-4 border-border bg-card/50 transition-all ${statusFilter === "in_use" ? "ring-2 ring-primary" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="bg-secondary/20 p-3 rounded-lg">
              <Monitor className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đang cho thuê</p>
              <p className="text-2xl font-bold text-secondary">{stats.inUse}</p>
            </div>
          </div>
          </Card>
        </button>

        <button type="button" onClick={() => selectStatusFilter("maintenance")} className="text-left">
          <Card className={`p-4 border-border bg-card/50 transition-all ${statusFilter === "maintenance" ? "ring-2 ring-primary" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="bg-muted/20 p-3 rounded-lg">
              <Monitor className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bảo trì</p>
              <p className="text-2xl font-bold text-muted-foreground">{stats.maintenance}</p>
            </div>
          </div>
          </Card>
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, ID, CPU, GPU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input-background border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[220px] bg-input-background border-border">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="available">Máy trống</SelectItem>
            <SelectItem value="in_use">Đang cho thuê</SelectItem>
            <SelectItem value="maintenance">Bảo trì</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Thêm Mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAddMode("machine")}
                  className={`px-3 py-2 rounded ${addMode === "machine" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                >
                  Thêm Máy
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode("package")}
                  className={`px-3 py-2 rounded ${addMode === "package" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                >
                  Thêm Gói
                </button>
              </div>

              {addMode === "machine" && (
                <>
                  <div className="space-y-2">
                    <Label>Chọn Gói (Plan)</Label>
                    <Select value={String(selectedSpecId)} onValueChange={(val) => setSelectedSpecId(Number(val))}>
                      <SelectTrigger className="bg-input-background border-border">
                        <SelectValue placeholder="Chọn gói để thêm máy" />
                      </SelectTrigger>
                      <SelectContent>
                        {specOptions.map((s) => (
                          <SelectItem key={s.specId} value={String(s.specId)}>{s.specName} (#{s.specId})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Số lượng máy cần thêm</Label>
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
                      className="bg-input-background border-border"
                    />
                  </div>
                </>
              )}

              {addMode === "package" && (
                <>
                  <div className="space-y-2">
                    <Label>Thêm Gói mới</Label>
                    <Input
                      placeholder="Tên gói (Spec name)"
                      value={formData.specName}
                      onChange={(e) => setFormData({ ...formData, specName: e.target.value })}
                      className="bg-input-background border-border"
                    />
                    <p className="text-sm text-muted-foreground">(Tạo gói sẽ tạo 1 máy mẫu hiện tại)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpu">CPU</Label>
                    <Input
                      id="cpu"
                      value={formData.cpu}
                      onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                      placeholder="VD: Intel i7-13700K"
                      className="bg-input-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gpu">GPU</Label>
                    <Input
                      id="gpu"
                      value={formData.gpu}
                      onChange={(e) => setFormData({ ...formData, gpu: e.target.value })}
                      placeholder="VD: RTX 4060 Ti"
                      className="bg-input-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ram">RAM (GB)</Label>
                    <Input
                      id="ram"
                      type="number"
                      value={formData.ram}
                      onChange={(e) => setFormData({ ...formData, ram: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                      className="bg-input-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storage">Storage (GB)</Label>
                    <Input
                      id="storage"
                      type="number"
                      value={formData.storage}
                      onChange={(e) => setFormData({ ...formData, storage: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                      placeholder="VD: 1024"
                      className="bg-input-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operatingSystem">Hệ điều hành</Label>
                    <Input
                      id="operatingSystem"
                      value={formData.operatingSystem}
                      onChange={(e) => setFormData({ ...formData, operatingSystem: e.target.value })}
                      placeholder="VD: Windows 11"
                      className="bg-input-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Trạng thái máy mẫu</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger id="status" className="bg-input-background border-border">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Máy trống</SelectItem>
                        <SelectItem value="in_use">Đang cho thuê</SelectItem>
                        <SelectItem value="maintenance">Bảo trì</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <Button onClick={handleAdd} className="w-full bg-gradient-to-r from-primary to-accent">
                {addMode === "machine" 
                  ? `Thêm ${Number(quantity) || 1} máy vào ${specOptions.find((s) => s.specId === Number(selectedSpecId))?.specName || "Gói"}` 
                  : "Tạo Gói (Tạo 1 máy mẫu)"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa trạng thái máy</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-status">Trạng thái</Label>
                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                  <SelectTrigger id="bulk-status" className="bg-input-background border-border">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Máy trống</SelectItem>
                    <SelectItem value="in_use">Đang cho thuê</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Khi chọn tất cả máy, chỉ nên dùng mục này để chỉnh status hàng loạt.
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={async () => {
                  const targetIds = [...selectedIds];
                  if (targetIds.length === 0) { toast.error('Không có mục nào để cập nhật'); return; }
                  try {
                    for (const id of targetIds) {
                      const payload: UpdatePcRequest = { status: bulkStatus };
                      // eslint-disable-next-line no-await-in-loop
                      await apiPatch(`/admin/pcs/${id}`, payload);
                    }
                    toast.success('Cập nhật hàng loạt thành công');
                    setIsBulkDialogOpen(false);
                    setSelectedIds([]);
                    await loadComputers();
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Bulk update failed');
                  }
                }} className="bg-gradient-to-r from-primary to-accent">Áp dụng</Button>
                <Button variant="ghost" onClick={() => setIsBulkDialogOpen(false)}>Hủy</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Computer List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={selectedIds.length === computers.length && computers.length>0} onChange={(e) => {
              if (e.target.checked) setSelectedIds(computers.map(c => c.pcId));
              else setSelectedIds([]);
            }} />
            <span className="text-sm text-muted-foreground">Chọn tất cả ({selectedIds.length})</span>
          </div>
        </div>

        {isLoading && (
          <Card className="p-12 border-border text-center">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải danh sách máy...</p>
          </Card>
        )}

        {!isLoading && visibleComputers.length === 0 && computers.length === 0 && (
          <Card className="p-12 border-border text-center">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Không tìm thấy máy nào.</p>
          </Card>
        )}

        {!isLoading && visibleComputers.length > 0 && Array.from(tierGroups.entries()).map(([tier, pcs]) => (
          <div key={tier} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {tier === "basic" ? "Basic" : tier === "pro" ? "Pro" : tier === "ultra" ? "Ultra" : "Other"}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{pcs.length} máy</span>
                <input type="checkbox" checked={pcs.every(p=> selectedIds.includes(p.pcId))} onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(prev => Array.from(new Set([...prev, ...pcs.map(p=>p.pcId)])));
                  } else {
                    setSelectedIds(prev => prev.filter(id => !pcs.some(p=>p.pcId===id)));
                  }
                }} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {pcs.map((computer) => (
                <Card key={computer.pcId} className="p-6 border-border hover:border-primary/50 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`h-3 w-3 rounded-full ${getStatusDotClass(computer.status)}`} />
                        <Badge
                          className={
                            getStatusMeta(computer.status).className
                          }
                        >
                          {getStatusMeta(computer.status).label}
                        </Badge>
                        <Badge className="bg-primary/20 text-primary border-primary/50">PC #{computer.pcId}</Badge>
                        <div className="ml-2">
                          <input type="checkbox" checked={selectedIds.includes(computer.pcId)} onChange={(e) => {
                            if (e.target.checked) setSelectedIds(prev => Array.from(new Set([...prev, computer.pcId])));
                            else setSelectedIds(prev => prev.filter(id=>id!==computer.pcId));
                          }} />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">CPU:</span>
                          <span className="font-medium">{computer.cpu}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">GPU:</span>
                          <span className="font-medium">{computer.gpu}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-muted-foreground">
                        {computer.ram}GB RAM • {computer.storage}GB • {computer.operatingSystem || "OS N/A"}
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                        <div className="p-2 bg-muted/50 rounded">
                          <span className="text-muted-foreground block">Giờ</span>
                          <span className="font-bold text-primary">
                            {formatUsd(Number(computer.pricePerHour))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleToggleLock(computer)}
                        className={computer.status === "maintenance" ? "border-accent text-accent hover:bg-accent/10" : "border-yellow-500 text-yellow-600 hover:bg-yellow-500/10"}
                      >
                        {computer.status === "maintenance" ? "Mở khóa" : "Khóa"}
                      </Button>

                      <Dialog
                        open={editingComputer?.pcId === computer.pcId}
                        onOpenChange={(open) => !open && setEditingComputer(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={computer.status !== "available"}
                            onClick={() => handleEdit(computer)}
                            className="border-primary text-foreground hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border">
                          <DialogHeader>
                            <DialogTitle>Chỉnh Sửa Máy</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-specName">Tên cấu hình (Spec)</Label>
                              <Input
                                id="edit-specName"
                                value={formData.specName}
                                onChange={(e) => setFormData({ ...formData, specName: e.target.value })}
                                className="bg-input-background border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-cpu">CPU</Label>
                              <Input
                                id="edit-cpu"
                                value={formData.cpu}
                                onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                                className="bg-input-background border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-gpu">GPU</Label>
                              <Input
                                id="edit-gpu"
                                value={formData.gpu}
                                onChange={(e) => setFormData({ ...formData, gpu: e.target.value })}
                                className="bg-input-background border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-ram">RAM (GB)</Label>
                              <Input
                                id="edit-ram"
                                type="number"
                                value={formData.ram}
                                onChange={(e) => setFormData({ ...formData, ram: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                                className="bg-input-background border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-storage">Storage (GB)</Label>
                              <Input
                                id="edit-storage"
                                type="number"
                                value={formData.storage}
                                onChange={(e) => setFormData({ ...formData, storage: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                                className="bg-input-background border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-operatingSystem">Hệ điều hành</Label>
                              <Input
                                id="edit-operatingSystem"
                                value={formData.operatingSystem}
                                onChange={(e) => setFormData({ ...formData, operatingSystem: e.target.value })}
                                className="bg-input-background border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-status">Trạng thái máy</Label>
                              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                <SelectTrigger id="edit-status" className="bg-input-background border-border">
                                  <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="available">Máy trống</SelectItem>
                                  <SelectItem value="in_use">Đang cho thuê</SelectItem>
                                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Button onClick={() => {
                                void handleUpdate("single");
                              }} className="w-full bg-gradient-to-r from-primary to-accent">
                                Cập Nhật máy này
                              </Button>
                              {detectTier(editingComputer?.specName ?? "") && (
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    void handleUpdate("plan");
                                  }}
                                  className="w-full border-primary text-foreground hover:bg-primary/10"
                                >
                                  Chỉnh toàn bộ máy trong {String(detectTier(editingComputer?.specName ?? "")).toUpperCase()}
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
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setSelectedIds([])}
            className="shadow-2xl bg-card/95"
          >
            Bỏ chọn ({selectedIds.length})
          </Button>
          <Button
            onClick={() => setIsBulkDialogOpen(true)}
            className="shadow-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Chỉnh sửa ({selectedIds.length})
          </Button>
        </div>
      )}

      {!isLoading && visibleComputers.length === 0 && computers.length > 0 && (
        <Card className="p-12 border-border text-center">
          <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Không tìm thấy máy nào</h3>
          <p className="text-muted-foreground">
            Thử tìm kiếm với từ khóa khác hoặc thêm máy mới
          </p>
        </Card>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="pt-2">
          <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsBulkDialogOpen(true)}
            className="shadow-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Chỉnh sửa ({selectedIds.length})
          </Button>
        </div>
      )}
    </div>
  );
}