import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Cpu, MapPin, Monitor, Search, Sparkles, HardDrive } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { apiGet } from "../api/http";
import { toast } from "sonner";

type TierKey = "basic" | "pro" | "ultra";

type MachineListItemResponse = {
  pcId: number;
  specId: number;
  specName: string;
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
  hourlyPrice: number | string;
  location: string;
  status?: string;
};

type PageResponse<T> = {
  content: T[];
};

// Map specId to tier based on database tier_spec_mappings
const SPEC_TO_TIER_MAP: Record<number, TierKey> = {
  // Basic tier (tier_id=1)
  1: "basic",  // Nebula Starter
  2: "basic",  // Nebula Plus
  3: "basic",  // Nebula Creator
  4: "basic",  // Orion Balanced
  10: "basic", // Zephyr Dev
  // Pro tier (tier_id=2)
  5: "pro",    // Orion Pro
  6: "pro",    // Atlas Gamer
  7: "pro",    // Atlas Creator
  // Ultra tier (tier_id=3)
  8: "ultra",  // Titan Workstation
  9: "ultra",  // Titan AI
};

const TIER_LABELS: Record<TierKey, string> = {
  basic: "Basic",
  pro: "Pro",
  ultra: "Ultra",
};

function getTierKey(tier: string | undefined): TierKey | null {
  const t = (tier ?? "").trim().toLowerCase();
  if (t === "basic" || t === "pro" || t === "ultra") {
    return t;
  }
  return null;
}

type TierGroup = {
  specKey: string;
  specId: number;
  specName: string;
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
  hourlyPrice: number;
  machines: MachineListItemResponse[];
};

export function PackageDetailsPage() {
  const navigate = useNavigate();
  const { tier } = useParams();
  const tierKey = useMemo(() => getTierKey(tier), [tier]);

  const [machines, setMachines] = useState<MachineListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const title = tierKey ? TIER_LABELS[tierKey] : "Unknown";

  useEffect(() => {
    const load = async () => {
      if (!tierKey) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);
      try {
        const page = await apiGet<PageResponse<MachineListItemResponse>>("/pcs", {
          page: 0,
          size: 200,
          sort: "price_asc",
        });
        const machines = (page.content ?? []).map((machine) => ({
          ...machine,
          hourlyPrice: typeof machine.hourlyPrice === "string" ? parseFloat(machine.hourlyPrice) : Number(machine.hourlyPrice),
        }));
        const filtered = machines.filter((machine) => {
          // Use spec_id mapping for accurate tier detection
          return SPEC_TO_TIER_MAP[machine.specId] === tierKey;
        });
        console.log(`[PackageDetailsPage] Tier: ${tierKey}, Total fetched: ${machines.length}, Filtered: ${filtered.length}`);
        console.log(`[PackageDetailsPage] All specs:`, machines.map(m => ({ pcId: m.pcId, specId: m.specId, specName: m.specName, tier: SPEC_TO_TIER_MAP[m.specId] ?? 'unknown' })));
        setMachines(filtered);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Could not load machines";
        setLoadError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [tierKey]);

  const filteredMachines = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return machines;
    return machines.filter((machine) => {
      return (
        String(machine.pcId).includes(q) ||
        String(machine.specId).includes(q) ||
        (machine.specName ?? "").toLowerCase().includes(q) ||
        (machine.cpu ?? "").toLowerCase().includes(q) ||
        (machine.gpu ?? "").toLowerCase().includes(q) ||
        (machine.location ?? "").toLowerCase().includes(q) ||
        (machine.status ?? "").toLowerCase().includes(q)
      );
    });
  }, [machines, searchTerm]);

  const groups = useMemo<TierGroup[]>(() => {
    const grouped = new Map<string, TierGroup>();

    for (const machine of filteredMachines) {
      const specKey = `${machine.specId}-${machine.specName}-${machine.cpu}-${machine.gpu}-${machine.ram}-${machine.storage}`;
      const existing = grouped.get(specKey);
      if (!existing) {
        grouped.set(specKey, {
          specKey,
          specId: machine.specId,
          specName: machine.specName,
          cpu: machine.cpu,
          gpu: machine.gpu,
          ram: machine.ram,
          storage: machine.storage,
          hourlyPrice: Number(machine.hourlyPrice),
          machines: [machine],
        });
        continue;
      }
      existing.machines.push(machine);
    }

    return Array.from(grouped.values()).sort((a, b) => Number(a.specId) - Number(b.specId));
  }, [filteredMachines]);

  const metrics = useMemo(() => {
    const uniqueSpecs = new Set(machines.map((machine) => machine.specId));
    const averageRam = machines.length ? Math.round(machines.reduce((sum, machine) => sum + Number(machine.ram ?? 0), 0) / machines.length) : 0;
    const averageStorage = machines.length ? Math.round(machines.reduce((sum, machine) => sum + Number(machine.storage ?? 0), 0) / machines.length) : 0;

    return {
      total: machines.length,
      specs: uniqueSpecs.size,
      averageRam,
      averageStorage,
    };
  }, [machines]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => navigate("/packages")} className="border border-border/60 bg-background/60 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to plans
            </Button>
            {tierKey && (
              <Badge className="border-primary/30 bg-primary/10 text-primary">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                {title} tier
              </Badge>
            )}
          </div>

          <Card className="relative overflow-hidden border-border bg-card/60 p-8 md:p-10 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="relative max-w-3xl">
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground mb-3">Tier showcase</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {title}
                <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  computer lineup
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                A snapshot of the hardware available in this subscription tier.
              </p>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card className="p-4 border-border bg-card/70">
              <p className="text-sm text-muted-foreground">PCs listed</p>
              <p className="text-2xl font-bold">{metrics.total}</p>
            </Card>
            <Card className="p-4 border-border bg-card/70">
              <p className="text-sm text-muted-foreground">Distinct specs</p>
              <p className="text-2xl font-bold">{metrics.specs}</p>
            </Card>
            <Card className="p-4 border-border bg-card/70">
              <p className="text-sm text-muted-foreground">Avg RAM</p>
              <p className="text-2xl font-bold text-primary">{metrics.averageRam}GB</p>
            </Card>
            <Card className="p-4 border-border bg-card/70">
              <p className="text-sm text-muted-foreground">Avg storage</p>
              <p className="text-2xl font-bold text-accent">{metrics.averageStorage}GB</p>
            </Card>
          </div>

          <div className="relative mb-6 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by PC ID, CPU, GPU, RAM, storage, or location..."
              className="pl-10 bg-background/80 border-border"
            />
          </div>

          {isLoading && (
            <Card className="p-10 border-border text-center bg-card/70">
              <Monitor className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Loading lineup...</p>
            </Card>
          )}

          {!isLoading && loadError && (
            <Card className="p-10 border-border text-center bg-card/70">
              <p className="font-medium text-destructive">Could not load this tier</p>
              <p className="text-sm text-muted-foreground">{loadError}</p>
            </Card>
          )}

          {!isLoading && !loadError && groups.length > 0 && (
            <div className="space-y-4">
              {groups.map((group) => (
                <Card key={group.specKey} className="overflow-hidden border-border bg-card/70">
                  <div className="border-b border-border/70 bg-muted/30 p-5 md:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>

                        <h2 className="text-2xl font-bold">{group.specName}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Built for the {title} tier with the same core hardware profile across the listed machines.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 md:p-6 md:grid-cols-[1.2fr_1fr]">
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Cpu className="w-4 h-4 text-primary" />
                            Processor
                          </div>
                          <p className="font-semibold">{group.cpu}</p>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Monitor className="w-4 h-4 text-primary" />
                            Graphics
                          </div>
                          <p className="font-semibold">{group.gpu}</p>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Memory
                          </div>
                          <p className="font-semibold">{group.ram}GB DDR</p>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <HardDrive className="w-4 h-4 text-primary" />
                            Storage
                          </div>
                          <p className="font-semibold">{group.storage}GB SSD</p>
                        </div>
                      </div>

                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                      <p className="text-sm font-semibold mb-3">Image placeholder</p>

                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && !loadError && groups.length === 0 && (
            <Card className="p-10 border-border text-center bg-card/70">
              <Monitor className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No PCs found for this tier</p>
              <p className="text-sm text-muted-foreground">Try a different search or go back to the plans list.</p>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
