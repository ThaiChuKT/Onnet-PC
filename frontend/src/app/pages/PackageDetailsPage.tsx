import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Cpu, Monitor, Sparkles, HardDrive, Loader2 } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { apiGet, apiPost } from "../api/http";
import { useAuth } from "../auth/AuthProvider";
import { toast } from "sonner";

type TierKey = "basic" | "pro" | "ultra";

type RentMachineResponse = {
  bookingId: number;
  queued: boolean;
  queuePosition: number | null;
  sessionId: number | null;
  pcId: number | null;
  pcLocation: string | null;
  specName: string;
  startTime: string;
  expectedEndTime: string;
  totalPrice: number;
  walletBalance: number;
  status: string;
  message: string;
};

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

const SPEC_TO_TIER_MAP: Record<number, TierKey> = {
  1: "basic",
  2: "basic",
  3: "pro",
  4: "pro",
  5: "ultra",
  6: "ultra",
};

const TIER_LABELS: Record<TierKey, string> = {
  basic: "Basic",
  pro: "Pro",
  ultra: "Ultra",
};

const TIER_IMAGES: Record<TierKey, { src: string; alt: string; locationLabel: string }> = {
  basic: {
    src: "https://images.unsplash.com/photo-1760708825878-9e7ecf31565a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBkZXNrdG9wJTIwY29tcHV0ZXIlMjB0b3dlcnxlbnwxfHx8fDE3NzM2NzY1ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Basic plan gaming setup",
    locationLabel: "Entry-level gaming setup",
  },
  pro: {
    src: "https://images.unsplash.com/photo-1738347826086-cadfac03cd45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZW5kJTIwZ2FtaW5nJTIwY29tcHV0ZXJ8ZW58MXx8fHwxNzczNjc2NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Pro plan gaming setup",
    locationLabel: "High-performance gaming setup",
  },
  ultra: {
    src: "https://images.unsplash.com/photo-1636914011676-039d36b73765?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYyUyMGdhbWluZyUyMHJvb20lMjBzZXR1cHxlbnwxfHx8fDE3NzM2NzY1ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Ultra plan gaming setup",
    locationLabel: "Premium studio-grade setup",
  },
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
  const { isAuthenticated } = useAuth();

  const [machines, setMachines] = useState<MachineListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleBookTier = async () => {
    if (isSubmitting || !tierKey) return;

    if (!isAuthenticated) {
      toast.message("Sign in to subscribe to a tier");
      navigate("/login", { replace: false, state: { from: "/" } });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiPost<RentMachineResponse>("/bookings/rent", {
        tierName: title,
        rentalUnit: "month",
        quantity: 1,
      });
      toast.success("Order created. Please complete your payment.");
      navigate("/checkout", { state: { bookingId: res.bookingId } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create subscription order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const groups = useMemo<TierGroup[]>(() => {
    const grouped = new Map<string, TierGroup>();

    for (const machine of machines) {
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

          <Card className="relative overflow-hidden border-border bg-card/60 mb-6">
            <div className="grid gap-6 md:grid-cols-2 items-center">
              {/* Image section */}
              <div className="relative h-80 overflow-hidden rounded-lg">
                <ImageWithFallback
                  src={tierKey ? TIER_IMAGES[tierKey].src : ""}
                  alt={tierKey ? TIER_IMAGES[tierKey].alt : "Plan image"}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/100 via-transparent to-black/100 blur-transparent" />
              </div>

              {/* Content section */}
              <div className="p-8 md:p-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                <div className="relative">
                  <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground mb-3">Tier showcase</p>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    {title}
                    <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      computer lineup
                    </span>
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                    A snapshot of the hardware available in this subscription tier.
                  </p>
                  
                  {/* Visual Settings */}
                  <div className="space-y-3 mb-8">
                    <h3 className="font-semibold text-foreground">Visual Settings</h3>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Max screen:</span>
                        <span className="ml-2 font-medium text-foreground">
                          {tierKey === "basic" ? "1080p" : tierKey === "pro" ? "1440p" : "4K"}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Recommended max framerate:</span>
                        <span className="ml-2 font-medium text-foreground">
                          {tierKey === "basic" ? "144Hz" : tierKey === "pro" ? "240Hz" : "360Hz"}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Recommended max resolution:</span>
                        <span className="ml-2 font-medium text-foreground">
                          {tierKey === "basic" ? "1920x1080" : tierKey === "pro" ? "2560x1440" : "3840x2160"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {groups.map((group) => (
                <Card key={group.specKey} className="overflow-hidden border-border bg-card/70 flex flex-col">
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

                  <div className="p-5 md:p-6 flex-1">
                    <div className="flex flex-col gap-3 h-full">
                      <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Cpu className="w-4 h-4 text-primary" />
                          Processor
                        </div>
                        <p className="font-semibold text-sm">{group.cpu}</p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Monitor className="w-4 h-4 text-primary" />
                          Graphics
                        </div>
                        <p className="font-semibold text-sm">{group.gpu}</p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          Memory
                        </div>
                        <p className="font-semibold text-sm">{group.ram}GB DDR</p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <HardDrive className="w-4 h-4 text-primary" />
                          Storage
                        </div>
                        <p className="font-semibold text-sm">{group.storage}GB SSD</p>
                      </div>
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

          {!isLoading && !loadError && groups.length > 0 && (
            <div className="flex justify-center pt-8">
              <Button 
                onClick={handleBookTier}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 px-8 py-6 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Join now"
                )}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
