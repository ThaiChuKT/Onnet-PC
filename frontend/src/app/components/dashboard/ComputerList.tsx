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
import { Monitor, Plus, Edit, Trash2, Search, Power, Key } from "lucide-react";
import { useState } from "react";

interface Computer {
  id: string;
  name: string;
  specs: string;
  status: "available" | "rented";
  connectionCode: string;
  category: string;
  rentedBy?: string;
  hourlyPrice: number;
  dailyPrice: number;
  monthlyPrice: number;
}

const initialComputers: Computer[] = [
  {
    id: "PC001",
    name: "Basic Gaming #1",
    specs: "i5-12400F | GTX 1660S | 16GB RAM",
    status: "rented",
    connectionCode: "BGM-001-X7K9",
    category: "Basic",
    rentedBy: "Nguyễn Văn A",
    hourlyPrice: 20000,
    dailyPrice: 150000,
    monthlyPrice: 2500000,
  },
  {
    id: "PC002",
    name: "Basic Gaming #2",
    specs: "i5-12400F | GTX 1660S | 16GB RAM",
    status: "available",
    connectionCode: "BGM-002-P4L2",
    category: "Basic",
    hourlyPrice: 20000,
    dailyPrice: 150000,
    monthlyPrice: 2500000,
  },
  {
    id: "PC003",
    name: "Pro Gaming #1",
    specs: "i7-13700K | RTX 4060Ti | 32GB RAM",
    status: "rented",
    connectionCode: "PRO-003-M9N5",
    category: "Pro",
    rentedBy: "Trần Thị B",
    hourlyPrice: 35000,
    dailyPrice: 250000,
    monthlyPrice: 4500000,
  },
  {
    id: "PC004",
    name: "Pro Gaming #2",
    specs: "i7-13700K | RTX 4060Ti | 32GB RAM",
    status: "available",
    connectionCode: "PRO-004-Q8W3",
    category: "Pro",
    hourlyPrice: 35000,
    dailyPrice: 250000,
    monthlyPrice: 4500000,
  },
  {
    id: "PC005",
    name: "Ultra Gaming #1",
    specs: "i9-13900K | RTX 4080 | 64GB RAM",
    status: "available",
    connectionCode: "ULT-005-R2T7",
    category: "Ultra",
    hourlyPrice: 50000,
    dailyPrice: 350000,
    monthlyPrice: 7000000,
  },
];

export function ComputerList() {
  const [computers, setComputers] = useState<Computer[]>(initialComputers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingComputer, setEditingComputer] = useState<Computer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    specs: "",
    category: "",
    connectionCode: "",
    hourlyPrice: 0,
    dailyPrice: 0,
    monthlyPrice: 0,
  });

  const filteredComputers = computers.filter(
    (pc) =>
      pc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pc.connectionCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    const newComputer: Computer = {
      id: `PC${String(computers.length + 1).padStart(3, "0")}`,
      name: formData.name,
      specs: formData.specs,
      category: formData.category,
      connectionCode: formData.connectionCode,
      status: "available",
      hourlyPrice: formData.hourlyPrice,
      dailyPrice: formData.dailyPrice,
      monthlyPrice: formData.monthlyPrice,
    };
    setComputers([...computers, newComputer]);
    setFormData({ name: "", specs: "", category: "", connectionCode: "", hourlyPrice: 0, dailyPrice: 0, monthlyPrice: 0 });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (computer: Computer) => {
    setEditingComputer(computer);
    setFormData({
      name: computer.name,
      specs: computer.specs,
      category: computer.category,
      connectionCode: computer.connectionCode,
      hourlyPrice: computer.hourlyPrice,
      dailyPrice: computer.dailyPrice,
      monthlyPrice: computer.monthlyPrice,
    });
  };

  const handleUpdate = () => {
    if (!editingComputer) return;
    setComputers(
      computers.map((pc) =>
        pc.id === editingComputer.id
          ? { ...pc, ...formData }
          : pc
      )
    );
    setEditingComputer(null);
    setFormData({ name: "", specs: "", category: "", connectionCode: "", hourlyPrice: 0, dailyPrice: 0, monthlyPrice: 0 });
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa máy này?")) {
      setComputers(computers.filter((pc) => pc.id !== id));
    }
  };

  const stats = {
    total: computers.length,
    available: computers.filter((pc) => pc.status === "available").length,
    rented: computers.filter((pc) => pc.status === "rented").length,
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
                <Label htmlFor="name">Tên Máy</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Pro Gaming #3"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Phân Loại</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="VD: Pro, Basic, Ultra"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specs">Cấu Hình</Label>
                <Input
                  id="specs"
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  placeholder="VD: i7-13700K | RTX 4060Ti | 32GB RAM"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="connectionCode">Mã Kết Nối</Label>
                <Input
                  id="connectionCode"
                  value={formData.connectionCode}
                  onChange={(e) => setFormData({ ...formData, connectionCode: e.target.value })}
                  placeholder="VD: PRO-006-X3Y9"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyPrice">Giá Theo Giờ</Label>
                <Input
                  id="hourlyPrice"
                  type="number"
                  value={formData.hourlyPrice}
                  onChange={(e) => setFormData({ ...formData, hourlyPrice: parseFloat(e.target.value) })}
                  placeholder="VD: 20000"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyPrice">Giá Theo Ngày</Label>
                <Input
                  id="dailyPrice"
                  type="number"
                  value={formData.dailyPrice}
                  onChange={(e) => setFormData({ ...formData, dailyPrice: parseFloat(e.target.value) })}
                  placeholder="VD: 150000"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Giá Theo Tháng</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) })}
                  placeholder="VD: 2500000"
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
        {filteredComputers.map((computer) => (
          <Card
            key={computer.id}
            className="p-6 border-border hover:border-primary/50 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold">{computer.name}</h3>
                  <Badge
                    className={
                      computer.status === "available"
                        ? "bg-accent/20 text-accent border-accent/50"
                        : "bg-secondary/20 text-secondary border-secondary/50"
                    }
                  >
                    {computer.status === "available" ? "Máy Trống" : "Đang Thuê"}
                  </Badge>
                  <Badge className="bg-primary/20 text-primary border-primary/50">
                    {computer.category}
                  </Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-medium">{computer.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Mã kết nối:</span>
                    <span className="font-mono font-medium text-primary">{computer.connectionCode}</span>
                  </div>
                </div>

                <div className="mt-2 text-sm text-muted-foreground">
                  {computer.specs}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground block">Giờ</span>
                    <span className="font-bold text-primary">{computer.hourlyPrice.toLocaleString()}đ</span>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground block">Ngày</span>
                    <span className="font-bold text-primary">{computer.dailyPrice.toLocaleString()}đ</span>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground block">Tháng</span>
                    <span className="font-bold text-primary">{computer.monthlyPrice.toLocaleString()}đ</span>
                  </div>
                </div>

                {computer.rentedBy && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Thuê bởi:</span>{" "}
                    <span className="font-medium text-secondary">{computer.rentedBy}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Dialog
                  open={editingComputer?.id === computer.id}
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
                        <Label htmlFor="edit-name">Tên Máy</Label>
                        <Input
                          id="edit-name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-input-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-category">Phân Loại</Label>
                        <Input
                          id="edit-category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="bg-input-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-specs">Cấu Hình</Label>
                        <Input
                          id="edit-specs"
                          value={formData.specs}
                          onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                          className="bg-input-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-code">Mã Kết Nối</Label>
                        <Input
                          id="edit-code"
                          value={formData.connectionCode}
                          onChange={(e) => setFormData({ ...formData, connectionCode: e.target.value })}
                          className="bg-input-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-hourlyPrice">Giá Theo Giờ</Label>
                        <Input
                          id="edit-hourlyPrice"
                          type="number"
                          value={formData.hourlyPrice}
                          onChange={(e) => setFormData({ ...formData, hourlyPrice: parseFloat(e.target.value) })}
                          className="bg-input-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-dailyPrice">Giá Theo Ngày</Label>
                        <Input
                          id="edit-dailyPrice"
                          type="number"
                          value={formData.dailyPrice}
                          onChange={(e) => setFormData({ ...formData, dailyPrice: parseFloat(e.target.value) })}
                          className="bg-input-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-monthlyPrice">Giá Theo Tháng</Label>
                        <Input
                          id="edit-monthlyPrice"
                          type="number"
                          value={formData.monthlyPrice}
                          onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) })}
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
                  onClick={() => handleDelete(computer.id)}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredComputers.length === 0 && (
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