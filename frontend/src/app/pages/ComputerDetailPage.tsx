import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
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
  Save,
} from "lucide-react";
import { apiGet, apiPatch } from "../api/http";
import { toast } from "sonner";

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
  status: string;
  available: boolean;
  plans: SubscriptionPlanPriceResponse[];
  approvedReviews: unknown[];
};

type AdminPcItemResponse = {
  pcId: number;
  specId: number;
};

type PageResponse<T> = {
  content: T[];
};

type UpdatePcRequest = {
  specName: string;
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
  operatingSystem: string;
  description: string;
  available: boolean;
  location: string;
  status: string;
};

export function ComputerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [computer, setComputer] = useState<MachineDetailResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [affectedMachineCount, setAffectedMachineCount] = useState(1);
  const [formData, setFormData] = useState<UpdatePcRequest>({
    specName: "",
    cpu: "",
    gpu: "",
    ram: 16,
    storage: 512,
    operatingSystem: "",
    description: "",
    available: true,
    location: "",
    status: "available",
  });

  const syncForm = (detail: MachineDetailResponse) => {
    setFormData({
      specName: detail.specName ?? "",
      cpu: detail.cpu ?? "",
      gpu: detail.gpu ?? "",
      ram: Number(detail.ram ?? 0),
      storage: Number(detail.storage ?? 0),
      operatingSystem: detail.operatingSystem ?? "",
      description: detail.description ?? "",
      available: !!detail.available,
      location: detail.location ?? "",
      status: (detail.status ?? "available").toLowerCase(),
    });
  };

  const loadDetail = async (targetPcId: number) => {
    const detail = await apiGet<MachineDetailResponse>(`/pcs/${targetPcId}`);
    setComputer(detail);
    syncForm(detail);

    const page = await apiGet<PageResponse<AdminPcItemResponse>>("/admin/pcs", { page: 0, size: 500 });
    const sameSpec = (page.content ?? []).filter((item) => Number(item.specId) === Number(detail.specId));
    setAffectedMachineCount(Math.max(sameSpec.length, 1));
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
        if (!cancelled) {
          setComputer(detail);
          syncForm(detail);
        }
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

  const handleSave = async () => {
    if (!pcId) return;
    setIsSaving(true);
    try {
      const page = await apiGet<PageResponse<AdminPcItemResponse>>("/admin/pcs", { page: 0, size: 500 });
      const sameSpecMachines = (page.content ?? []).filter(
        (item) => Number(item.specId) === Number(computer?.specId ?? -1),
      );
      const targetIds = sameSpecMachines.length > 0 ? sameSpecMachines.map((m) => m.pcId) : [pcId];

      await Promise.all(targetIds.map((targetId) => apiPatch(`/admin/pcs/${targetId}`, formData)));
      await loadDetail(pcId);
      toast.success(`PC configuration updated for ${targetIds.length} machines`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update PC configuration");
    } finally {
      setIsSaving(false);
    }
  };

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
              Back to list
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
              Back to computers
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/computers")}
              className="border-border"
            >
              Cancel changes
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
                    <Badge className="bg-accent/20 text-accent border-accent/50">PC Configuration</Badge>
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
                <h2 className="text-2xl font-bold mb-4">Packages</h2>
                <div className="space-y-3">
                  {computer.plans.length > 0 ? (
                    computer.plans.map((plan) => (
                      <div key={plan.id} className="p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold">{plan.planName}</div>
                          <Badge className="bg-secondary/20 text-secondary border-secondary/40">
                            {plan.durationDays} days
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {Number(plan.price ?? 0).toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No active packages for this spec.</p>
                  )}
                </div>
              </Card>

              <Card className="p-6 border-border">
                <h2 className="text-2xl font-bold mb-4">System fields</h2>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="bg-accent/20 p-1 rounded-full">
                      <Check className="w-4 h-4 text-accent" />
                    </div>
                    <span>Price per hour is read-only here</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-accent/20 p-1 rounded-full">
                      <Check className="w-4 h-4 text-accent" />
                    </div>
                    <span>is_exclusive is excluded from this editor</span>
                  </li>
                </ul>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6 border-border sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Edit PC configuration</h2>

                <div className="space-y-4">
                  <div className="p-3 rounded-lg border border-border bg-muted/20 text-sm text-muted-foreground">
                    This save applies to all machines sharing spec #{computer.specId} ({affectedMachineCount} machines).
                  </div>

                  <div className="space-y-2">
                    <Label>Spec name</Label>
                    <Input value={formData.specName} onChange={(e) => setFormData({ ...formData, specName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>CPU</Label>
                    <Input value={formData.cpu} onChange={(e) => setFormData({ ...formData, cpu: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>GPU</Label>
                    <Input value={formData.gpu} onChange={(e) => setFormData({ ...formData, gpu: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>RAM (GB)</Label>
                      <Input
                        type="number"
                        value={formData.ram}
                        onChange={(e) => setFormData({ ...formData, ram: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Storage (GB)</Label>
                      <Input
                        type="number"
                        value={formData.storage}
                        onChange={(e) => setFormData({ ...formData, storage: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Operating system</Label>
                    <Input
                      value={formData.operatingSystem}
                      onChange={(e) => setFormData({ ...formData, operatingSystem: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">available</SelectItem>
                          <SelectItem value="in_use">in_use</SelectItem>
                          <SelectItem value="maintenance">maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>is_available</Label>
                      <Select
                        value={String(formData.available)}
                        onValueChange={(v) => setFormData({ ...formData, available: v === "true" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="is_available" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">true</SelectItem>
                          <SelectItem value="false">false</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save configuration"}
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
