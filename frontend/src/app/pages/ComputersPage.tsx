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
import { useEffect } from "react";
import { apiGet } from "../api/http";
import { toast } from "sonner";
import { formatUsd } from "../lib/formatUsd";

interface Computer {
  pcId: number;
  specId: number;
  specName: string;
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
  hourlyPrice: number;
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

export function ComputersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cpuFilter, setCpuFilter] = useState("all");
  const [gpuFilter, setGpuFilter] = useState("all");
  const [ramFilter, setRamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const [computers, setComputers] = useState<Computer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Get unique values for filters
  const cpuOptions = Array.from(new Set(computers.map((c) => c.cpu))).filter(Boolean);
  const gpuOptions = Array.from(new Set(computers.map((c) => c.gpu))).filter(Boolean);
  const ramOptions = Array.from(new Set(computers.map((c) => String(c.ram)))).filter(Boolean);

  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const page = await apiGet<PageResponse<Computer>>("/pcs", {
          page: 0,
          size: 50,
          sort: "price_asc",
          keyword: searchTerm || undefined,
        });
        if (!cancelled) setComputers(page.content ?? []);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not load machine list";
        if (!cancelled) {
          setLoadError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [searchTerm]);

  // Filter computers
  const filteredComputers = computers.filter((computer) => {
    const matchSearch =
      computer.cpu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      computer.gpu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      computer.specName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory =
      categoryFilter === "all" ||
      computer.specName.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchCpu = cpuFilter === "all" || computer.cpu === cpuFilter;
    const matchGpu = gpuFilter === "all" || computer.gpu === gpuFilter;
    const matchRam = ramFilter === "all" || String(computer.ram) === ramFilter;
    const matchStatus =
      statusFilter === "all" ||
      computer.status.toLowerCase() === statusFilter.toLowerCase();

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
              PCs
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {" "}
                catalog
              </span>
            </h1>
            <p className="text-muted-foreground">
              Browse inventory (admin). Customers subscribe from the home page.
            </p>
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar Filters */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <Card className="p-6 border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    Filters
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-xs"
                  >
                    Reset
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="bg-input-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Pro">Pro</SelectItem>
                        <SelectItem value="Ultra">Ultra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="bg-input-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
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
                        <SelectItem value="all">All</SelectItem>
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
                        <SelectItem value="all">All</SelectItem>
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
                        <SelectItem value="all">All</SelectItem>
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
                  AI chat
                </Button>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, CPU, GPU…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-input-background border-border"
                />
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  Found{" "}
                  <span className="font-bold text-primary">
                    {filteredComputers.length}
                  </span>{" "}
                  machines
                </p>
              </div>

              {/* Computer Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {isLoading && (
                  <Card className="p-12 border-border text-center md:col-span-2">
                    <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Loading catalog…</h3>
                    <p className="text-muted-foreground">Please wait</p>
                  </Card>
                )}

                {!isLoading &&
                  loadError && (
                    <Card className="p-12 border-border text-center md:col-span-2">
                      <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Could not load catalog</h3>
                      <p className="text-muted-foreground">{loadError}</p>
                    </Card>
                  )}

                {filteredComputers.map((computer) => (
                  <Card
                    key={computer.pcId}
                    className="p-6 border-border hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={() => navigate(`/computers/${computer.pcId}`)}
                  >
                    {/* Image Placeholder */}
                    <div className="w-full h-48 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      <Monitor className="w-24 h-24 text-primary/50 group-hover:scale-110 transition-transform" />
                    </div>

                    {/* Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">{computer.specName}</h3>
                        <Badge
                          className={
                            computer.status.toLowerCase() === "available"
                              ? "bg-accent/20 text-accent border-accent/50"
                              : "bg-muted text-muted-foreground border-border"
                          }
                        >
                          {computer.status.toLowerCase() === "available" ? "Available" : computer.status}
                        </Badge>
                      </div>

                      <Badge className="bg-primary/20 text-primary border-primary/50">
                        PC #{computer.pcId}
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
                            {computer.ram}GB
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {computer.storage}GB
                          </span>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="pt-3 border-t border-border">
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Hourly rate</p>
                            <p className="font-bold text-primary">
                              {formatUsd(Number(computer.hourlyPrice))}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        disabled={computer.status.toLowerCase() !== "available"}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/computers/${computer.pcId}`);
                        }}
                      >
                        View details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {!isLoading && !loadError && filteredComputers.length === 0 && (
                <Card className="p-12 border-border text-center">
                  <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    No machines match
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try different filters or search terms
                  </p>
                  <Button onClick={handleResetFilters} variant="outline">
                    Reset bộ lọc
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
