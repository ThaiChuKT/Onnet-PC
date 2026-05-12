import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Folder, Search, Pencil, Monitor, ChevronDown, ChevronUp } from "lucide-react";
import { apiGet } from "../api/http";
import { toast } from "sonner";
import { formatUsd } from "../lib/formatUsd";

type AdminPackageItemResponse = {
  planId: number;
  planName: string;
  specId: number;
  specName: string;
  durationDays: number;
  price: number;
  maxHoursPerDay: number | null;
  active: boolean;
};

type AdminPcItemResponse = {
  pcId: number;
  specId: number;
  specName: string;
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

export function ComputersPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<AdminPackageItemResponse[]>([]);
  const [machines, setMachines] = useState<AdminPcItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedPlanIds, setExpandedPlanIds] = useState<number[]>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [pkgPage, machinePage] = await Promise.all([
          apiGet<PageResponse<AdminPackageItemResponse>>("/admin/packages", { page: 0, size: 200 }),
          apiGet<PageResponse<AdminPcItemResponse>>("/admin/pcs", { page: 0, size: 200 }),
        ]);
        setPackages(pkgPage.content ?? []);
        setMachines(machinePage.content ?? []);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not load packages");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const filteredPackages = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return packages.filter((pkg) => {
      const matchesSearch =
        !q ||
        String(pkg.planId).includes(q) ||
        (pkg.planName ?? "").toLowerCase().includes(q) ||
        (pkg.specName ?? "").toLowerCase().includes(q);
      const matchesActive =
        activeFilter === "all" ||
        (activeFilter === "active" && !!pkg.active) ||
        (activeFilter === "inactive" && !pkg.active);
      return matchesSearch && matchesActive;
    });
  }, [activeFilter, packages, searchTerm]);

  const machinesBySpec = useMemo(() => {
    return machines.reduce<Record<number, AdminPcItemResponse[]>>((acc, item) => {
      const key = Number(item.specId);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [machines]);

  const toggleMachines = (planId: number) => {
    setExpandedPlanIds((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId],
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Package
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {" "}
                folders
              </span>
            </h1>
            <p className="text-muted-foreground">
              Manage package pricing and inspect all machines inside each package.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3 mb-6">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search package by name, ID, spec..."
                className="pl-10"
              />
            </div>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Package status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All packages</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {isLoading && (
              <Card className="p-10 border-border text-center">
                <Folder className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Loading package folders...</p>
              </Card>
            )}

            {!isLoading && filteredPackages.map((pkg) => {
              const planMachines = machinesBySpec[pkg.specId] ?? [];
              const expanded = expandedPlanIds.includes(pkg.planId);
              return (
                <Card key={pkg.planId} className="p-5 border-border">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Folder className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold">{pkg.planName}</h3>
                        <Badge className={pkg.active ? "bg-accent/20 text-accent border-accent/50" : "bg-muted text-muted-foreground border-border"}>
                          {pkg.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3 text-sm">
                        <Badge className="bg-primary/20 text-primary border-primary/50">
                          {pkg.specName}
                        </Badge>
                        <Badge variant="outline" className="border-border">
                          {pkg.durationDays} days
                        </Badge>
                        <Badge variant="outline" className="border-border">
                          Spec #{pkg.specId}
                        </Badge>
                      </div>

                      <div className="grid gap-2 text-sm text-muted-foreground">
                        <p>Plan ID: <span className="text-foreground font-medium">{pkg.planId}</span></p>
                        <p>Max hours/day: <span className="text-foreground font-medium">{pkg.maxHoursPerDay ?? "—"}</span></p>
                        <p>Price: <span className="text-primary font-bold">{formatUsd(Number(pkg.price ?? 0))}</span></p>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          onClick={() => navigate(`/packages/${pkg.planId}/edit`)}
                          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit price
                        </Button>
                        <Button variant="outline" onClick={() => toggleMachines(pkg.planId)}>
                          <Monitor className="w-4 h-4 mr-2" />
                          {expanded ? "Hide machines" : "Show machines"}
                          {expanded ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-3">Machines in this package</p>
                      {planMachines.length === 0 ? (
                        <Card className="p-4 border-border bg-muted/20">
                          <p className="text-sm text-muted-foreground">No machine found for this spec.</p>
                        </Card>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                          {planMachines.map((pc) => (
                            <div key={pc.pcId} className="p-3 rounded-lg border border-border bg-muted/20">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold">PC #{pc.pcId}</p>
                                <Badge className="bg-primary/15 text-primary border-primary/40">{pc.status}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{pc.location || "No location"}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}

            {!isLoading && filteredPackages.length === 0 && (
              <Card className="p-10 border-border text-center">
                <Folder className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">No package folder found</p>
                <p className="text-sm text-muted-foreground">Try another search keyword or filter.</p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
