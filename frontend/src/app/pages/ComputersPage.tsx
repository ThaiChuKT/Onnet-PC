import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Monitor,
  Search,
  Filter,
  Cpu,
  HardDrive,
  MemoryStick,
  Zap,
  MessageSquare,
} from "lucide-react";

interface Computer {
  id: string;
  name: string;
  category: string;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  status: "available" | "rented";
  hourlyPrice: number;
  dailyPrice: number;
  monthlyPrice: number;
  image: string;
}

const computers: Computer[] = [
  {
    id: "PC001",
    name: "Basic Gaming #1",
    category: "Basic",
    cpu: "Intel i5-12400F",
    gpu: "GTX 1660 Super",
    ram: "16GB DDR4",
    storage: "500GB NVMe SSD",
    status: "rented",
    hourlyPrice: 20000,
    dailyPrice: 150000,
    monthlyPrice: 2500000,
    image: "gaming-setup",
  },
  {
    id: "PC002",
    name: "Basic Gaming #2",
    category: "Basic",
    cpu: "Intel i5-12400F",
    gpu: "GTX 1660 Super",
    ram: "16GB DDR4",
    storage: "500GB NVMe SSD",
    status: "available",
    hourlyPrice: 20000,
    dailyPrice: 150000,
    monthlyPrice: 2500000,
    image: "gaming-setup",
  },
  {
    id: "PC003",
    name: "Pro Gaming #1",
    category: "Pro",
    cpu: "Intel i7-13700K",
    gpu: "RTX 4060 Ti",
    ram: "32GB DDR5",
    storage: "1TB NVMe SSD",
    status: "available",
    hourlyPrice: 35000,
    dailyPrice: 250000,
    monthlyPrice: 4500000,
    image: "gaming-setup",
  },
  {
    id: "PC004",
    name: "Pro Gaming #2",
    category: "Pro",
    cpu: "Intel i7-13700K",
    gpu: "RTX 4060 Ti",
    ram: "32GB DDR5",
    storage: "1TB NVMe SSD",
    status: "available",
    hourlyPrice: 35000,
    dailyPrice: 250000,
    monthlyPrice: 4500000,
    image: "gaming-setup",
  },
  {
    id: "PC005",
    name: "Ultra Gaming #1",
    category: "Ultra",
    cpu: "Intel i9-13900K",
    gpu: "RTX 4080",
    ram: "64GB DDR5",
    storage: "2TB NVMe SSD",
    status: "available",
    hourlyPrice: 50000,
    dailyPrice: 350000,
    monthlyPrice: 7000000,
    image: "gaming-setup",
  },
  {
    id: "PC006",
    name: "Ultra Gaming #2",
    category: "Ultra",
    cpu: "AMD Ryzen 9 7950X",
    gpu: "RTX 4090",
    ram: "64GB DDR5",
    storage: "2TB NVMe SSD",
    status: "available",
    hourlyPrice: 60000,
    dailyPrice: 400000,
    monthlyPrice: 8000000,
    image: "gaming-setup",
  },
];

export function ComputersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cpuFilter, setCpuFilter] = useState("all");
  const [gpuFilter, setGpuFilter] = useState("all");
  const [ramFilter, setRamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [_showFilters, _setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Get unique values for filters
  const cpuOptions = Array.from(new Set(computers.map((c) => c.cpu)));
  const gpuOptions = Array.from(new Set(computers.map((c) => c.gpu)));
  const ramOptions = Array.from(new Set(computers.map((c) => c.ram)));

  // Filter computers
  const filteredComputers = computers.filter((computer) => {
    const matchSearch =
      computer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      computer.cpu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      computer.gpu.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory =
      categoryFilter === "all" || computer.category === categoryFilter;
    const matchCpu = cpuFilter === "all" || computer.cpu === cpuFilter;
    const matchGpu = gpuFilter === "all" || computer.gpu === gpuFilter;
    const matchRam = ramFilter === "all" || computer.ram === ramFilter;
    const matchStatus =
      statusFilter === "all" || computer.status === statusFilter;

    return (
      matchSearch &&
      matchCategory &&
      matchCpu &&
      matchGpu &&
      matchRam &&
      matchStatus
    );
  });

  const handleResetFilters = () => {
    setCategoryFilter("all");
    setCpuFilter("all");
    setGpuFilter("all");
    setRamFilter("all");
    setStatusFilter("all");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Máy
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {" "}
                Cho Thuê
              </span>
            </h1>
            <p className="text-muted-foreground">
              Tìm và thuê máy tính phù hợp với nhu cầu của bạn
            </p>
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar Filters */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <Card className="p-6 border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    Bộ Lọc
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-xs"
                  >
                    Đặt lại
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Phân Loại</Label>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="bg-input-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Pro">Pro</SelectItem>
                        <SelectItem value="Ultra">Ultra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label>Trạng Thái</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="bg-input-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="available">Máy trống</SelectItem>
                        <SelectItem value="rented">Đang thuê</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* CPU */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      CPU
                    </Label>
                    <Select value={cpuFilter} onValueChange={setCpuFilter}>
                      <SelectTrigger className="bg-input-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {cpuOptions.map((cpu) => (
                          <SelectItem key={cpu} value={cpu}>
                            {cpu}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* GPU */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      GPU
                    </Label>
                    <Select value={gpuFilter} onValueChange={setGpuFilter}>
                      <SelectTrigger className="bg-input-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {gpuOptions.map((gpu) => (
                          <SelectItem key={gpu} value={gpu}>
                            {gpu}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* RAM */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MemoryStick className="w-4 h-4" />
                      RAM
                    </Label>
                    <Select value={ramFilter} onValueChange={setRamFilter}>
                      <SelectTrigger className="bg-input-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {ramOptions.map((ram) => (
                          <SelectItem key={ram} value={ram}>
                            {ram}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* AI Chat Button */}
                <Button
                  onClick={() => navigate("/ai-chat")}
                  className="w-full mt-6 bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat AI Tư Vấn
                </Button>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, CPU, GPU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-input-background border-border"
                />
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  Tìm thấy{" "}
                  <span className="font-bold text-primary">
                    {filteredComputers.length}
                  </span>{" "}
                  máy
                </p>
              </div>

              {/* Computer Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {filteredComputers.map((computer) => (
                  <Card
                    key={computer.id}
                    className="p-6 border-border hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={() => navigate(`/computers/${computer.id}`)}
                  >
                    {/* Image Placeholder */}
                    <div className="w-full h-48 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      <Monitor className="w-24 h-24 text-primary/50 group-hover:scale-110 transition-transform" />
                    </div>

                    {/* Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">{computer.name}</h3>
                        <Badge
                          className={
                            computer.status === "available"
                              ? "bg-accent/20 text-accent border-accent/50"
                              : "bg-muted text-muted-foreground border-border"
                          }
                        >
                          {computer.status === "available"
                            ? "Có sẵn"
                            : "Đang thuê"}
                        </Badge>
                      </div>

                      <Badge className="bg-primary/20 text-primary border-primary/50">
                        {computer.category}
                      </Badge>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {computer.cpu}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {computer.gpu}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MemoryStick className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {computer.ram}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {computer.storage}
                          </span>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="pt-3 border-t border-border">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Giờ</p>
                            <p className="font-bold text-primary">
                              {computer.hourlyPrice.toLocaleString()}đ
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Ngày
                            </p>
                            <p className="font-bold text-primary">
                              {computer.dailyPrice.toLocaleString()}đ
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Tháng
                            </p>
                            <p className="font-bold text-primary">
                              {computer.monthlyPrice.toLocaleString()}đ
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        disabled={computer.status === "rented"}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/computers/${computer.id}`);
                        }}
                      >
                        {computer.status === "available"
                          ? "Xem Chi Tiết"
                          : "Không Khả Dụng"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredComputers.length === 0 && (
                <Card className="p-12 border-border text-center">
                  <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    Không tìm thấy máy nào
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                  </p>
                  <Button onClick={handleResetFilters} variant="outline">
                    Đặt lại bộ lọc
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
