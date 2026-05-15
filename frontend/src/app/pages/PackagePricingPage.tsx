import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { apiGet, apiPatch } from "../api/http";
import { toast } from "sonner";

type TierKey = "basic" | "pro" | "ultra";

type TierSpecPlanPlanResponse = {
	planId: number;
	planName: string;
	durationDays: number;
	price: number;
	maxHoursPerDay: number | null;
	active: boolean;
};

type TierSpecPlanSpecResponse = {
	specId: number;
	specName: string;
	cpu: string;
	gpu: string;
	ram: number;
	storage: number;
	operatingSystem: string;
	description: string;
	pricePerHour: number;
	exclusive: boolean;
	available: boolean;
	plans: TierSpecPlanPlanResponse[];
};

type TierSpecPlanTierResponse = {
	tierId: number;
	tierName: string;
	tierLevel: number;
	active: boolean;
	specs: TierSpecPlanSpecResponse[];
};

type TierSpecPlanCatalogResponse = {
	tiers: TierSpecPlanTierResponse[];
	unassignedSpecs: TierSpecPlanSpecResponse[];
};

type TierPlanGroups = {
	yearlyIds: number[];
	monthlyIds: number[];
	weeklyIds: number[];
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

function derivePricesFrom(
	duration: "yearly" | "monthly" | "weekly",
	value: number,
) {
	let baseWeekly = 0;
	if (duration === "weekly") {
		baseWeekly = value;
	} else if (duration === "monthly") {
		baseWeekly = value / 4;
	} else if (duration === "yearly") {
		baseWeekly = value / 40; // 1 năm = 10 tháng = 10 * 4 tuần = 40 tuần
	}

	return {
		weekly: roundMoney(baseWeekly),
		monthly: roundMoney(baseWeekly * 4),
		yearly: roundMoney(baseWeekly * 40),
	};
}

export function PackagePricingPage() {
	const { tier } = useParams();
	const navigate = useNavigate();
	const tierKey = (tier ?? "").toLowerCase() as TierKey;

	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [syncByFormula, setSyncByFormula] = useState(true);

	const [planIds, setPlanIds] = useState<TierPlanGroups>({
		yearlyIds: [],
		monthlyIds: [],
		weeklyIds: [],
	});
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
				const catalog = await apiGet<TierSpecPlanCatalogResponse>(
					"/pcs/tier-spec-plans",
				);

				const matchedTier = catalog.tiers.find(
					(t) =>
						t.tierName.toLowerCase() === tierKey ||
						detectTier(t.tierName) === tierKey,
				);

				const allPlans = matchedTier
					? matchedTier.specs.flatMap((s) => s.plans)
					: [];

				const yearlyPlans = allPlans.filter((p) => p.durationDays >= 365);
				const monthlyPlans = allPlans.filter(
					(p) => p.durationDays >= 28 && p.durationDays < 365,
				);
				const weeklyPlans = allPlans.filter((p) => p.durationDays < 28);

				setPlanIds({
					yearlyIds: yearlyPlans.map((p) => p.planId),
					monthlyIds: monthlyPlans.map((p) => p.planId),
					weeklyIds: weeklyPlans.map((p) => p.planId),
				});
				setYearlyPrice(Number(yearlyPlans[0]?.price ?? 0));
				setMonthlyPrice(Number(monthlyPlans[0]?.price ?? 0));
				setWeeklyPrice(Number(weeklyPlans[0]?.price ?? 0));
			} catch (e) {
				toast.error(
					e instanceof Error ? e.message : "Could not load package prices",
				);
			} finally {
				setIsLoading(false);
			}
		};
		void load();
	}, [tierKey]);

	const handleSyncedChange = (
		duration: "yearly" | "monthly" | "weekly",
		value: number,
	) => {
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
		planIds.yearlyIds.forEach((id) => {
			updates.push(apiPatch(`/admin/packages/${id}`, { price: yearlyPrice }));
		});
		planIds.monthlyIds.forEach((id) => {
			updates.push(apiPatch(`/admin/packages/${id}`, { price: monthlyPrice }));
		});
		planIds.weeklyIds.forEach((id) => {
			updates.push(apiPatch(`/admin/packages/${id}`, { price: weeklyPrice }));
		});

		if (updates.length === 0) {
			toast.error("No package plans found to update");
			return;
		}

		setIsSaving(true);
		try {
			await Promise.all(updates);
			toast.success("Package prices updated");
		} catch (e) {
			toast.error(
				e instanceof Error ? e.message : "Could not update package prices",
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="mb-6">
				<Button
					variant="ghost"
					onClick={() => navigate("/dashboard/computers")}
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to machines
				</Button>
			</div>

			{isLoading && (
				<Card className="p-10 border-border text-center">
					<p className="text-muted-foreground">Loading package...</p>
				</Card>
			)}

			{!isLoading &&
				planIds.yearlyIds.length === 0 &&
				planIds.monthlyIds.length === 0 &&
				planIds.weeklyIds.length === 0 && (
					<Card className="p-10 border-border text-center">
						<p className="font-medium">No package plans found for this tier</p>
					</Card>
				)}

			{!isLoading &&
				(planIds.yearlyIds.length > 0 ||
					planIds.monthlyIds.length > 0 ||
					planIds.weeklyIds.length > 0) && (
					<Card className="p-6 border-border max-w-2xl mx-auto">
						<h1 className="text-2xl font-bold mb-2">Edit {title} prices</h1>
						<p className="text-muted-foreground mb-6">
							Toggle sync to auto-calculate weekly/monthly/yearly prices from
							one edited value.
						</p>

						<div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20 mb-6">
							<div>
								<p className="font-semibold">Sync price formula</p>
							</div>
							<Switch
								checked={syncByFormula}
								onCheckedChange={setSyncByFormula}
							/>
						</div>

						<div className="space-y-4">
							<div className="space-y-2">
								<Label>Yearly price</Label>
								<Input
									type="number"
									min={1}
									value={yearlyPrice}
									onChange={(e) =>
										handleSyncedChange("yearly", Number(e.target.value) || 1)
									}
									className="text-money font-semibold"
								/>
							</div>

							<div className="space-y-2">
								<Label>Monthly price</Label>
								<Input
									type="number"
									min={1}
									value={monthlyPrice}
									onChange={(e) =>
										handleSyncedChange("monthly", Number(e.target.value) || 1)
									}
									className="text-money font-semibold"
								/>
							</div>

							<div className="space-y-2">
								<Label>Weekly price</Label>
								<Input
									type="number"
									min={1}
									value={weeklyPrice}
									onChange={(e) =>
										handleSyncedChange("weekly", Number(e.target.value) || 1)
									}
									className="text-money font-semibold"
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
	);
}
