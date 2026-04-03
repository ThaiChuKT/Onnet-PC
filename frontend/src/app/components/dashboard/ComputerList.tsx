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
  specName: string;
  cpu?: string;
  gpu?: string;
  ram?: number;
  storage?: number;
  operatingSystem?: string;
  description?: string;
  pricePerHour: number;
  location: string;
  status?: string;
};

type UpdatePcRequest = Partial<CreatePcRequest>;

export function ComputerList() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingComputer, setEditingComputer] = useState<Computer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    specName: "",
    cpu: "",
    gpu: "",
    ram: 16,
    storage: 512,
    operatingSystem: "",
    pricePerHour: 0,
    location: "",
    status: "available",
  });

  const loadComputers = async () => {
    setIsLoading(true);
    try {
      const page = await apiGet<PageResponse<Computer>>("/admin/pcs", { page: 0, size: 50 });
      setComputers(page.content ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể tải danh sách máy");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadComputers();
  }, []);

  const filteredComputers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return computers;
    return computers.filter((pc) => {
      return (
        String(pc.pcId).includes(q) ||
        pc.specName.toLowerCase().includes(q) ||
        pc.cpu.toLowerCase().includes(q) ||
        pc.gpu.toLowerCase().includes(q) ||
        pc.location.toLowerCase().includes(q) ||
        pc.status.toLowerCase().includes(q)
      );
    });
  }, [computers, searchTerm]);

  const handleAdd = async () => {
    try {
      const payload: CreatePcRequest = {
        specName: formData.specName,
        cpu: formData.cpu,
        gpu: formData.gpu,
        ram: formData.ram,
        storage: formData.storage,
        operatingSystem: formData.operatingSystem,
        pricePerHour: formData.pricePerHour,
        location: formData.location,
        status: formData.status,
      };
      await apiPost<Computer, CreatePcRequest>("/admin/pcs", payload);
      toast.success("Tạo máy thành công");
      setFormData({
        specName: "",
        cpu: "",
        gpu: "",
        ram: 16,
        storage: 512,
        operatingSystem: "",
        pricePerHour: 0,
        location: "",
        status: "available",
      });
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
      pricePerHour: computer.pricePerHour,
      location: computer.location,
      status: computer.status,
    });
  };

  const handleUpdate = async () => {
    if (!editingComputer) return;
    try {
      const payload: UpdatePcRequest = {
        specName: formData.specName,
        cpu: formData.cpu,
        gpu: formData.gpu,
        ram: formData.ram,
        storage: formData.storage,
        operatingSystem: formData.operatingSystem,
        pricePerHour: formData.pricePerHour,
        location: formData.location,
        status: formData.status,
      };
      await apiPatch<Computer, UpdatePcRequest>(`/admin/pcs/${editingComputer.pcId}`, payload);
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

  const stats = {
    total: computers.length,
    available: computers.filter((pc) => (pc.status ?? "").toLowerCase() === "available").length,
    rented: computers.filter((pc) => (pc.status ?? "").toLowerCase() !== "available").length,
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 border-border bg-card/50">
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

        <Card className="p-4 border-border bg-card/50">
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

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/20 p-3 rounded-lg">
              <Monitor className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đang cho thuê</p>
              <p className="text-2xl font-bold text-secondary">{stats.rented}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, ID, mã kết nối..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input-background border-border"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Máy Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Thêm Máy Mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="specName">Tên cấu hình (Spec)</Label>
                <Input
                  id="specName"
                  value={formData.specName}
                  onChange={(e) => setFormData({ ...formData, specName: e.target.value })}
                  placeholder="VD: Pro Gaming"
                  className="bg-input-background border-border"
                />
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
                <Label htmlFor="location">Vị trí</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="VD: HCM-DC1"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerHour">Giá theo giờ</Label>
                <Input
                  id="pricePerHour"
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: Number(e.target.value) || 0 })}
                  placeholder="VD: 20000"
                  className="bg-input-background border-border"
                />
              </div>
              <Button onClick={handleAdd} className="w-full bg-gradient-to-r from-primary to-accent">
                Thêm Máy
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Computer List */}
      <div className="space-y-4">
        {isLoading && (
          <Card className="p-12 border-border text-center">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải danh sách máy...</p>
          </Card>
        )}

        {filteredComputers.map((computer) => (
          <Card
            key={computer.pcId}
            className="p-6 border-border hover:border-primary/50 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold">{computer.specName}</h3>
                  <Badge
                    className={
                      (computer.status ?? "").toLowerCase() === "available"
                        ? "bg-accent/20 text-accent border-accent/50"
                        : "bg-secondary/20 text-secondary border-secondary/50"
                    }
                  >
                    {(computer.status ?? "").toLowerCase() === "available" ? "Máy Trống" : computer.status}
                  </Badge>
                  <Badge className="bg-primary/20 text-primary border-primary/50">PC #{computer.pcId}</Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{computer.location}</span>
                  </div>
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
                    <span className="font-bold text-primary">{Number(computer.pricePerHour).toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Dialog
                  open={editingComputer?.pcId === computer.pcId}
                  onOpenChange={(open) => !open && setEditingComputer(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(computer)}
                      className="border-primary text-foreground hover:bg-primary/10"
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
                        <Label htmlFor="edit-location">Vị trí</Label>
                        <Input
                          id="edit-location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="bg-input-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-pricePerHour">Giá theo giờ</Label>
                        <Input
                          id="edit-pricePerHour"
                          type="number"
                          value={formData.pricePerHour}
                          onChange={(e) => setFormData({ ...formData, pricePerHour: Number(e.target.value) || 0 })}
                          className="bg-input-background border-border"
                        />
                      </div>
                      <Button onClick={handleUpdate} className="w-full bg-gradient-to-r from-primary to-accent">
                        Cập Nhật
                      </Button>
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

      {!isLoading && filteredComputers.length === 0 && (
        <Card className="p-12 border-border text-center">
          <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Không tìm thấy máy nào</h3>
          <p className="text-muted-foreground">
            Thử tìm kiếm với từ khóa khác hoặc thêm máy mới
          </p>
        </Card>
      )}
    </div>
  );
}