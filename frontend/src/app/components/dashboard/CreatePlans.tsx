import { useEffect, useMemo, useState } from "react";
import { Copy, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost } from "../../api/http";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

type AdminPcItemResponse = {
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
  tierName: string | null;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type PlanDraft = {
  id: string;
  planName: string;
  tierName: string | null;
  specName: string;
  durationDays: number;
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
  os: string;
  desc: string;
  location: string;
  weekly: number;
  monthly: number;
  yearly: number;
};

type AdminPackageItemResponse = {
  planId: number;
  planName: string;
  specId: number;
  specName: string;
  tierName: string | null;
  durationDays: number;
  price: number;
  maxHoursPerDay: number | null;
  active: boolean;
};

type CreatePackageRequest = {
  planName: string;
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
  operatingSystem: string;
  description: string;
  location: string;
  monthlyPrice: number;
  tierName?: string;
  active: boolean;
};

const INITIAL_FORM = {
  planName: "",
  cpu: "",
  gpu: "",
  ram: "16",
  storage: "512",
  os: "",
  desc: "",
  location: "",
  monthlyPrice: "",
  tierName: "",
};

export function CreatePlans() {
  const [open, setOpen] = useState(false);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
  const [copyEnabled, setCopyEnabled] = useState(false);
  const [selectedConfigPcId, setSelectedConfigPcId] = useState<string>("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [pcConfigs, setPcConfigs] = useState<AdminPcItemResponse[]>([]);
  const [plans, setPlans] = useState<PlanDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const loadConfigs = async () => {
      setIsLoadingConfigs(true);
      try {
        const res = await apiGet<PageResponse<AdminPcItemResponse>>("/admin/pcs", {
          page: 0,
          size: 500,
        });
        if (!cancelled) {
          const uniqueBySpec = new Map<number, AdminPcItemResponse>();
          for (const item of res.content ?? []) {
            if (!uniqueBySpec.has(Number(item.specId))) {
              uniqueBySpec.set(Number(item.specId), item);
            }
          }
          setPcConfigs(Array.from(uniqueBySpec.values()));
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not load existing configurations");
      } finally {
        if (!cancelled) {
          setIsLoadingConfigs(false);
        }
      }
    };

    void loadConfigs();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const monthly = useMemo(() => {
    const value = Number(form.monthlyPrice);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }, [form.monthlyPrice]);

  const weekly = useMemo(() => Number((monthly / 4).toFixed(2)), [monthly]);
  const yearly = useMemo(() => Number((monthly * 10).toFixed(2)), [monthly]);

  const copyFromConfig = () => {
    const selected = pcConfigs.find((item) => String(item.pcId) === selectedConfigPcId);
    if (!selected) {
      toast.error("Please select an existing configuration first");
      return;
    }

    setForm((prev) => ({
      ...prev,
      planName: prev.planName || selected.specName || "",
      cpu: selected.cpu || "",
      gpu: selected.gpu || "",
      ram: String(selected.ram ?? 16),
      storage: String(selected.storage ?? 512),
      os: selected.operatingSystem || "",
      location: selected.location || "",
      tierName: prev.tierName,
    }));
    toast.success("Configuration copied from existing plan");
  };

  const handleCreatePlan = async () => {
    const ram = Number(form.ram);
    const storage = Number(form.storage);

    if (!form.planName.trim()) {
      toast.error("Plan name is required");
      return;
    }
    if (!form.cpu.trim() || !form.gpu.trim() || !form.os.trim() || !form.location.trim()) {
      toast.error("Please fill CPU, GPU, OS, and location");
      return;
    }
    if (!Number.isFinite(ram) || ram <= 0 || !Number.isFinite(storage) || storage <= 0) {
      toast.error("RAM and Storage must be positive numbers");
      return;
    }
    if (monthly <= 0) {
      toast.error("Monthly price must be greater than 0");
      return;
    }

    const payload: CreatePackageRequest = {
      planName: form.planName.trim(),
      cpu: form.cpu.trim(),
      gpu: form.gpu.trim(),
      ram,
      storage,
      operatingSystem: form.os.trim(),
      description: form.desc.trim(),
      location: form.location.trim(),
      monthlyPrice: monthly,
      active: true,
      ...(form.tierName.trim() ? { tierName: form.tierName.trim() } : {}),
    };

    setIsSubmitting(true);
    try {
      const created = await apiPost<AdminPackageItemResponse[], CreatePackageRequest>("/admin/packages", payload);

      const createdByDuration = new Map<number, AdminPackageItemResponse>();
      for (const row of created ?? []) {
        createdByDuration.set(Number(row.durationDays), row);
      }

      const weeklyRow = createdByDuration.get(7);
      const monthlyRow = createdByDuration.get(30);
      const yearlyRow = createdByDuration.get(365);

      const newPlan: PlanDraft = {
        id: `${Date.now()}`,
        planName: payload.planName,
        tierName: monthlyRow?.tierName ?? null,
        specName: monthlyRow?.specName ?? payload.planName,
        durationDays: 30,
        cpu: payload.cpu,
        gpu: payload.gpu,
        ram: payload.ram,
        storage: payload.storage,
        os: payload.operatingSystem,
        desc: payload.description,
        location: payload.location,
        weekly: Number(weeklyRow?.price ?? weekly),
        monthly: Number(monthlyRow?.price ?? monthly),
        yearly: Number(yearlyRow?.price ?? yearly),
      };

      setPlans((prev) => [newPlan, ...prev]);
      setOpen(false);
      setCopyEnabled(false);
      setSelectedConfigPcId("");
      setForm(INITIAL_FORM);
      toast.success("Plan created and saved to database");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="min-h-[55vh] border-border bg-card/50 p-8 flex items-center justify-center">
        <Button
          onClick={() => setOpen(true)}
          className="h-12 px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create new plans
        </Button>
      </Card>

      {plans.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.id} className="border-border bg-card/60 p-5">
              <h3 className="text-lg font-bold">{plan.planName}</h3>
              <p className="text-xs text-muted-foreground mt-1">Spec: {plan.specName}{plan.tierName ? ` • Tier: ${plan.tierName}` : ""}</p>
              <p className="text-sm text-muted-foreground mt-1">{plan.cpu} • {plan.gpu}</p>
              <p className="text-sm text-muted-foreground">{plan.ram} GB RAM • {plan.storage} GB SSD • {plan.os}</p>
              <p className="text-sm text-muted-foreground">Location: {plan.location}</p>
              {plan.desc && <p className="text-sm mt-2">{plan.desc}</p>}
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded border border-border p-2">
                  <p className="text-muted-foreground">Weekly</p>
                  <p className="font-semibold">${plan.weekly.toFixed(2)}</p>
                </div>
                <div className="rounded border border-border p-2">
                  <p className="text-muted-foreground">Monthly</p>
                  <p className="font-semibold">${plan.monthly.toFixed(2)}</p>
                </div>
                <div className="rounded border border-border p-2">
                  <p className="text-muted-foreground">Yearly</p>
                  <p className="font-semibold">${plan.yearly.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl border-border bg-card">
          <DialogHeader>
            <DialogTitle>Create new plans</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCopyEnabled((value) => !value)}
                className="border-border"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy from existing plans
              </Button>
              {isLoadingConfigs ? <span className="text-sm text-muted-foreground">Loading configs...</span> : null}
            </div>

            {copyEnabled && (
              <div className="rounded-lg border border-border p-4 space-y-3">
                <Label>Existing PC configuration</Label>
                <Select value={selectedConfigPcId} onValueChange={setSelectedConfigPcId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a configuration to copy" />
                  </SelectTrigger>
                  <SelectContent>
                    {pcConfigs.map((pc) => (
                      <SelectItem key={pc.pcId} value={String(pc.pcId)}>
                        {pc.specName} • {pc.cpu} • {pc.gpu} • {pc.ram}GB/{pc.storage}GB
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="secondary" onClick={copyFromConfig}>
                  Apply copied configuration
                </Button>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plans name</Label>
                <Input
                  id="plan-name"
                  value={form.planName}
                  onChange={(e) => setForm((prev) => ({ ...prev, planName: e.target.value }))}
                  placeholder="e.g. Ultra Creator"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu">CPU</Label>
                <Input
                  id="cpu"
                  value={form.cpu}
                  onChange={(e) => setForm((prev) => ({ ...prev, cpu: e.target.value }))}
                  placeholder="e.g. Ryzen 9 7950X"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpu">GPU</Label>
                <Input
                  id="gpu"
                  value={form.gpu}
                  onChange={(e) => setForm((prev) => ({ ...prev, gpu: e.target.value }))}
                  placeholder="e.g. RTX 4080"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ram">RAM (GB)</Label>
                <Input
                  id="ram"
                  type="number"
                  min={1}
                  value={form.ram}
                  onChange={(e) => setForm((prev) => ({ ...prev, ram: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">Storage (GB)</Label>
                <Input
                  id="storage"
                  type="number"
                  min={1}
                  value={form.storage}
                  onChange={(e) => setForm((prev) => ({ ...prev, storage: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="os">OS</Label>
                <Input
                  id="os"
                  value={form.os}
                  onChange={(e) => setForm((prev) => ({ ...prev, os: e.target.value }))}
                  placeholder="e.g. Windows 11 Pro"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Singapore DC-1"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Tier (optional)</Label>
                <Select value={form.tierName || "none"} onValueChange={(value) => setForm((prev) => ({ ...prev, tierName: value === "none" ? "" : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto detect from plan name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Auto detect from plan name</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="ultra">Ultra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="desc">Desc</Label>
                <Textarea
                  id="desc"
                  value={form.desc}
                  onChange={(e) => setForm((prev) => ({ ...prev, desc: e.target.value }))}
                  placeholder="Description for this plan"
                  rows={3}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="monthly-price">Price (Monthly)</Label>
                  <Input
                    id="monthly-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.monthlyPrice}
                    onChange={(e) => setForm((prev) => ({ ...prev, monthlyPrice: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (Weekly)</Label>
                  <Input value={weekly ? weekly.toFixed(2) : "0.00"} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Price (Yearly)</Label>
                  <Input value={yearly ? yearly.toFixed(2) : "0.00"} disabled />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Pricing formula: Monthly = 4 × Weekly and Yearly = 10 × Monthly.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreatePlan()} disabled={isSubmitting} className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              {isSubmitting ? "Creating..." : "Create plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
