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

type TierKey = "basic" | "pro" | "ultra";

type TierPackage = {
  tier: TierKey;
  title: string;
  plans: AdminPackageItemResponse[];
  specIds: number[];
  active: boolean;
};

const TIER_ORDER: TierKey[] = ["basic", "pro", "ultra"];

function detectTier(text: string): TierKey | null {
  const t = text.toLowerCase();
  if (t.includes("basic")) return "basic";
  if (t.includes("pro")) return "pro";
  if (t.includes("ultra")) return "ultra";
  return null;
}

export function PackageFoldersPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<AdminPackageItemResponse[]>([]);
  const [machines, setMachines] = useState<AdminPcItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedTiers, setExpandedTiers] = useState<TierKey[]>([]);

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

  const tierPackages = useMemo<TierPackage[]>(() => {
    const grouped = new Map<TierKey, TierPackage>();
    for (const pkg of packages) {
      const tier = detectTier(`${pkg.planName} ${pkg.specName}`);
      if (!tier) continue;
      const existing = grouped.get(tier);
      if (!existing) {
        grouped.set(tier, {
          tier,
          title: tier.toUpperCase(),
          plans: [pkg],
          specIds: [pkg.specId],
          active: !!pkg.active,
        });
      } else {
        existing.plans.push(pkg);
        existing.specIds = Array.from(new Set([...existing.specIds, pkg.specId]));
        existing.active = existing.active || !!pkg.active;
      }
    }

    return TIER_ORDER.map((tier) => grouped.get(tier))
      .filter((v): v is TierPackage => !!v)
      .map((entry) => ({
        ...entry,
        plans: [...entry.plans].sort((a, b) => Number(a.durationDays ?? 0) - Number(b.durationDays ?? 0)),
      }));
  }, [packages]);

  const filteredPackages = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return tierPackages.filter((pkg) => {
      const matchesSearch =
        !q ||
        (pkg.title ?? "").toLowerCase().includes(q) ||
        pkg.plans.some((p) => String(p.planId).includes(q) || (p.planName ?? "").toLowerCase().includes(q) || (p.specName ?? "").toLowerCase().includes(q));
      const matchesActive =
        activeFilter === "all" ||
        (activeFilter === "active" && !!pkg.active) ||
        (activeFilter === "inactive" && !pkg.active);
      return matchesSearch && matchesActive;
    });
  }, [activeFilter, searchTerm, tierPackages]);

  const machinesBySpec = useMemo(() => {
    return machines.reduce<Record<number, AdminPcItemResponse[]>>((acc, item) => {
      const key = Number(item.specId);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [machines]);

  const toggleMachines = (tier: TierKey) => {
    setExpandedTiers((prev) =>
      prev.includes(tier) ? prev.filter((id) => id !== tier) : [...prev, tier],
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
              const planMachines = pkg.specIds.flatMap((specId) => machinesBySpec[specId] ?? []);
              const expanded = expandedTiers.includes(pkg.tier);
              const yearly = pkg.plans.find((p) => Number(p.durationDays) >= 365);
              const monthly = pkg.plans.find((p) => Number(p.durationDays) >= 28 && Number(p.durationDays) < 365);
              const weekly = pkg.plans.find((p) => Number(p.durationDays) < 28);
              return (
                <Card key={pkg.tier} className="p-5 border-border">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Folder className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold">{pkg.title}</h3>
                        <Badge className={pkg.active ? "bg-accent/20 text-accent border-accent/50" : "bg-muted text-muted-foreground border-border"}>
                          {pkg.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Specs linked: {pkg.specIds.length}</p>
                        <p>Yearly: {yearly ? `${Number(yearly.price ?? 0).toLocaleString("vi-VN")}đ` : "-"}</p>
                        <p>Monthly: {monthly ? `${Number(monthly.price ?? 0).toLocaleString("vi-VN")}đ` : "-"}</p>
                        <p>Weekly: {weekly ? `${Number(weekly.price ?? 0).toLocaleString("vi-VN")}đ` : "-"}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => navigate(`/packages/${pkg.tier}/edit`)}
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit price
                      </Button>
                      <Button variant="outline" onClick={() => toggleMachines(pkg.tier)}>
                        <Monitor className="w-4 h-4 mr-2" />
                        {expanded ? "Hide machines" : "Show machines"}
                        {expanded ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                      </Button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-3">Machines in this tier package</p>
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
