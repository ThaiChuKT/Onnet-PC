import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Monitor,
  Cpu,
  Zap,
  MemoryStick,
  HardDrive,
  Check,
  ArrowLeft,
  Package,
} from "lucide-react";
import { apiGet } from "../api/http";

type SubscriptionPlanPriceResponse = {
  id: number;
  planName: string;
  durationDays: number;
  price: number;
};

type MachineDetailResponse = {
  pcId: number;
  specId: number;
  specName: string;
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
  operatingSystem: string;
  description: string;
  hourlyPrice: number;
  location: string;
  plans: SubscriptionPlanPriceResponse[];
  approvedReviews: unknown[];
};

export function ComputerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [computer, setComputer] = useState<MachineDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const goToPackages = () => {
    navigate("/");
    window.setTimeout(() => {
      window.location.hash = "packages";
    }, 0);
  };

  const pcId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!pcId) {
        setIsLoading(false);
        setLoadError("Invalid machine ID");
        return;
      }
      setIsLoading(true);
      setLoadError(null);
      try {
        const detail = await apiGet<MachineDetailResponse>(`/pcs/${pcId}`);
        if (!cancelled) setComputer(detail);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not load machine details";
        if (!cancelled) setLoadError(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pcId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 pb-12 flex items-center justify-center">
          <Card className="p-12 border-border text-center">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Loading machine…</h3>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!computer || loadError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 pb-12 flex items-center justify-center">
          <Card className="p-12 border-border text-center">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Machine not found</h3>
            {loadError && <p className="text-muted-foreground">{loadError}</p>}
            <Button onClick={() => navigate("/computers")} className="mt-4">
              Back to catalog
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/computers")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to catalog
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/computers")}
              className="border-border"
            >
              Cancel — don&apos;t rent
            </Button>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            <div className="space-y-6">
              <Card className="p-6 border-border">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-lg mb-6 flex items-center justify-center">
                  <Monitor className="w-48 h-48 text-primary/50" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">{computer.specName}</h1>
                    <Badge className="bg-accent/20 text-accent border-accent/50">Details</Badge>
                  </div>

                  <Badge className="bg-primary/20 text-primary border-primary/50">
                    PC #{computer.pcId}
                  </Badge>

                  <p className="text-muted-foreground">{computer.description}</p>
                </div>
              </Card>

              <Card className="p-6 border-border">
                <h2 className="text-2xl font-bold mb-4">Specifications</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="bg-primary/20 p-3 rounded-lg">
                      <Cpu className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CPU</p>
                      <p className="font-bold">{computer.cpu}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <Zap className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">GPU</p>
                      <p className="font-bold">{computer.gpu}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="bg-accent/20 p-3 rounded-lg">
                      <MemoryStick className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">RAM</p>
                      <p className="font-bold">{computer.ram} GB</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="bg-primary/20 p-3 rounded-lg">
                      <HardDrive className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Storage</p>
                      <p className="font-bold">{computer.storage} GB</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-border">
                <h2 className="text-2xl font-bold mb-4">More info</h2>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="bg-accent/20 p-1 rounded-full">
                      <Check className="w-4 h-4 text-accent" />
                    </div>
                    <span>OS: {computer.operatingSystem || "N/A"}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-accent/20 p-1 rounded-full">
                      <Check className="w-4 h-4 text-accent" />
                    </div>
                    <span>Location: {computer.location || "N/A"}</span>
                  </li>
                </ul>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6 border-border sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Subscribe to rent</h2>

                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                    <p className="text-sm text-foreground">
                      Rentals use <strong>Basic / Pro / Ultra</strong> subscription tiers. You no longer
                      pick individual machines for checkout — the pool assigns one for you.
                    </p>
                  </div>

                  <div className="space-y-2 text-sm p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 font-semibold">
                      <Package className="w-4 h-4 text-primary" />
                      How it works
                    </div>
                    <p className="text-muted-foreground">
                      After you purchase a tier, use <strong>Start session</strong> in My bookings; the
                      system picks an available machine that matches your tier.
                    </p>
                  </div>

                  <Button
                    onClick={goToPackages}
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    Choose a subscription
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/account/rental-history")}
                    className="w-full h-12 border-border"
                  >
                    My bookings
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/computers")}
                    className="w-full h-12 border-border text-muted-foreground"
                  >
                    Cancel — leave this page
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
