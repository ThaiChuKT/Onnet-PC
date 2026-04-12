import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { apiGet, apiPatch } from "../api/http";
import { toast } from "sonner";

type TierKey = "basic" | "pro" | "ultra";

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

type PageResponse<T> = {
	content: T[];
};

type TierPlans = {
	yearly: AdminPackageItemResponse | null;
	monthly: AdminPackageItemResponse | null;
	weekly: AdminPackageItemResponse | null;
};

function detectTier(text: string): TierKey | null {
	const t = text.toLowerCase();
	if (t.includes("basic")) return "basic";
	if (t.includes("pro")) return "pro";
	if (t.includes("ultra")) return "ultra";
	return null;
}

function roundMoney(n: number) {
	return Math.max(1, Math.round(n));
}

function derivePricesFrom(duration: "yearly" | "monthly" | "weekly", value: number) {
	let dailyBase = 0;
	if (duration === "yearly") {
		dailyBase = value / 365;
	} else if (duration === "monthly") {
		dailyBase = value / (30 * 1.15);
	} else {
		dailyBase = value / (7 * 1.25);
	}

	return {
		yearly: roundMoney(dailyBase * 365),
		monthly: roundMoney(dailyBase * 30 * 1.15),
		weekly: roundMoney(dailyBase * 7 * 1.25),
	};
}

export function PackagePricingPage() {
	const { tier } = useParams();
	const navigate = useNavigate();
	const tierKey = (tier ?? "").toLowerCase() as TierKey;

	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [syncByFormula, setSyncByFormula] = useState(true);

	const [plans, setPlans] = useState<TierPlans>({ yearly: null, monthly: null, weekly: null });
	const [yearlyPrice, setYearlyPrice] = useState(0);
	const [monthlyPrice, setMonthlyPrice] = useState(0);
	const [weeklyPrice, setWeeklyPrice] = useState(0);

	const title = useMemo(() => tierKey.toUpperCase(), [tierKey]);

	useEffect(() => {
		const load = async () => {
			if (!["basic", "pro", "ultra"].includes(tierKey)) {
				setIsLoading(false);
				return;
			}
			setIsLoading(true);
			try {
				const page = await apiGet<PageResponse<AdminPackageItemResponse>>("/admin/packages", { page: 0, size: 300 });
				const matches = (page.content ?? []).filter((p) => detectTier(`${p.planName} ${p.specName}`) === tierKey);

				const yearly = matches.find((p) => Number(p.durationDays ?? 0) >= 365) ?? null;
				const monthly = matches.find((p) => Number(p.durationDays ?? 0) >= 28 && Number(p.durationDays ?? 0) < 365) ?? null;
				const weekly = matches.find((p) => Number(p.durationDays ?? 0) < 28) ?? null;

				setPlans({ yearly, monthly, weekly });
				setYearlyPrice(Number(yearly?.price ?? 0));
				setMonthlyPrice(Number(monthly?.price ?? 0));
				setWeeklyPrice(Number(weekly?.price ?? 0));
			} catch (e) {
				toast.error(e instanceof Error ? e.message : "Could not load package prices");
			} finally {
				setIsLoading(false);
			}
		};
		void load();
	}, [tierKey]);

	const handleSyncedChange = (duration: "yearly" | "monthly" | "weekly", value: number) => {
		const safeValue = roundMoney(value);
		if (!syncByFormula) {
			if (duration === "yearly") setYearlyPrice(safeValue);
			if (duration === "monthly") setMonthlyPrice(safeValue);
			if (duration === "weekly") setWeeklyPrice(safeValue);
			return;
		}

		const next = derivePricesFrom(duration, safeValue);
		setYearlyPrice(next.yearly);
		setMonthlyPrice(next.monthly);
		setWeeklyPrice(next.weekly);
	};

	const handleSave = async () => {
		const updates: Array<Promise<unknown>> = [];
		if (plans.yearly?.planId) {
			updates.push(apiPatch(`/admin/packages/${plans.yearly.planId}`, { price: yearlyPrice }));
		}
		if (plans.monthly?.planId) {
			updates.push(apiPatch(`/admin/packages/${plans.monthly.planId}`, { price: monthlyPrice }));
		}
		if (plans.weekly?.planId) {
			updates.push(apiPatch(`/admin/packages/${plans.weekly.planId}`, { price: weeklyPrice }));
		}

		if (updates.length === 0) {
			toast.error("No package plans found to update");
			return;
		}

		setIsSaving(true);
		try {
			await Promise.all(updates);
			toast.success("Package prices updated");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Could not update package prices");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Header />

			<main className="flex-1 pt-20 pb-12 bg-muted/30">
				<div className="container mx-auto px-4 py-8">
					<div className="mb-6">
						<Button variant="ghost" onClick={() => navigate("/computers")}> 
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to package folders
						</Button>
					</div>

					{isLoading && (
						<Card className="p-10 border-border text-center">
							<p className="text-muted-foreground">Loading package...</p>
						</Card>
					)}

					{!isLoading && !plans.yearly && !plans.monthly && !plans.weekly && (
						<Card className="p-10 border-border text-center">
							<p className="font-medium">No package plans found for this tier</p>
						</Card>
					)}

					{!isLoading && (plans.yearly || plans.monthly || plans.weekly) && (
						<Card className="p-6 border-border max-w-2xl mx-auto">
							<h1 className="text-2xl font-bold mb-2">Edit {title} prices</h1>
							<p className="text-muted-foreground mb-6">
								Toggle sync to auto-calculate weekly/monthly/yearly prices from one edited value.
							</p>

							<div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20 mb-6">
								<div>
									<p className="font-semibold">Sync price formula</p>
                                    
								</div>
								<Switch checked={syncByFormula} onCheckedChange={setSyncByFormula} />
							</div>

							<div className="space-y-4">
								<div className="space-y-2">
									<Label>Yearly price</Label>
									<Input
										type="number"
										min={1}
										value={yearlyPrice}
										onChange={(e) => handleSyncedChange("yearly", Number(e.target.value) || 1)}
									/>
								</div>

								<div className="space-y-2">
									<Label>Monthly price</Label>
									<Input
										type="number"
										min={1}
										value={monthlyPrice}
										onChange={(e) => handleSyncedChange("monthly", Number(e.target.value) || 1)}
									/>
								</div>

								<div className="space-y-2">
									<Label>Weekly price</Label>
									<Input
										type="number"
										min={1}
										value={weeklyPrice}
										onChange={(e) => handleSyncedChange("weekly", Number(e.target.value) || 1)}
									/>
								</div>

								<Button
									onClick={handleSave}
									disabled={isSaving}
									className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
								>
									<Save className="w-4 h-4 mr-2" />
									{isSaving ? "Saving..." : "Save package prices"}
								</Button>
							</div>
						</Card>
					)}
				</div>
			</main>

			<Footer />
		</div>
	);
}
