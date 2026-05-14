import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Check, Clock, Cpu, Gamepad2, Zap } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatUsd } from "../lib/formatUsd";
import { apiGet } from "../api/http";
import { toast } from "sonner";
import { TIER_SPEC_MAP } from "../lib/constants";

type SubscriptionPlanPriceResponse = {
  id: number;
  planName: string;
  durationDays: number;
  price: number;
};

type TierPricing = {
  tierName: string;
  name: string;
  icon: any;
  pricing: {
    week: { amountUsd: number; period: string };
    month: { amountUsd: number; period: string };
    year: { amountUsd: number; period: string };
  };
  image: string;
  features: string[];
  benefits: string[];
  popular: boolean;
};

const TIER_STATIC_DATA: Record<string, Omit<TierPricing, "pricing">> = {
  Basic: {
    tierName: "Basic",
    name: "Basic Gaming",
    icon: Gamepad2,
    image:
      "https://images.unsplash.com/photo-1760708825878-9e7ecf31565a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBkZXNrdG9wJTIwY29tcHV0ZXIlMjB0b3dlcnxlbnwxfHx8fDE3NzM2NzY1ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    features: [
      "Intel Core i5-12400F OR AMD Ryzen 5 5600X",
      "NVIDIA RTX 3060 OR AMD RX 6600",
      "16GB DDR4 RAM",
      "512GB NVMe SSD",
      "$2.40–2.50/hour rental rate",
      "Any game from Steam, Epic, Battle.net",
    ],
    benefits: [
      "Perfect for 1080p gaming at 60+ fps",
      "Install your games & mods freely",
      "Most affordable entry point"
    ],
    popular: false,
  },
  Pro: {
    tierName: "Pro",
    name: "Pro Gaming",
    icon: Zap,
    image:
      "https://images.unsplash.com/photo-1738347826086-cadfac03cd45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZW5kJTIwZ2FtaW5nJTIwY29tcHV0ZXJ8ZW58MXx8fHwxNzczNjc2NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    features: [
      "Intel Core i7-13700F OR AMD Ryzen 7 7700X",
      "NVIDIA RTX 4070 OR RTX 4070 Super",
      "32GB DDR5 RAM",
      "1TB NVMe Gen4 SSD",
      "$5.00–5.50/hour rental rate",
      "Built for streaming & content creation",
    ],
    benefits: [
      "High framerates for competitive gaming",
      "Stream at high settings simultaneously",
      "Perfect for 1440p and high-refresh gaming"
    ],
    popular: true,
  },
  Ultra: {
    tierName: "Ultra",
    name: "Ultra Gaming",
    icon: Cpu,
    image:
      "https://images.unsplash.com/photo-1636914011676-039d36b73765?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYyUyMGdhbWluZyUyMHJvb20lMjBzZXR1cHxlbnwxfHx8fDE3NzY2NzY1ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    features: [
      "Intel Core i9-14900K OR AMD Ryzen 9 7950X",
      "NVIDIA RTX 4090 (Dual support available)",
      "64GB DDR5 RAM",
      "2TB NVMe Gen4 SSD",
      "$10.00–10.50/hour rental rate",
      "Professional workstation & rendering",
    ],
    benefits: [
      "Maximum performance for 4K gaming",
      "Professional AI workload & rendering",
      "Exclusive tier with VIP support"
    ],
    popular: false,
  },
};

type PackagesProps = {
  variant?: "home" | "page";
};

export function Packages({ }: PackagesProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");
  const [plansBySpec, setPlansBySpec] = useState<Record<number, SubscriptionPlanPriceResponse[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const specIds = [...TIER_SPEC_MAP.basic, ...TIER_SPEC_MAP.pro, ...TIER_SPEC_MAP.ultra];
        const results = await Promise.allSettled(
          specIds.map((specId) => apiGet<SubscriptionPlanPriceResponse[]>(`/pcs/specs/${specId}/plans`)),
        );

        const nextPlansBySpec: Record<number, SubscriptionPlanPriceResponse[]> = {};
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            nextPlansBySpec[specIds[index]] = result.value ?? [];
          }
        });
        setPlansBySpec(nextPlansBySpec);
      } catch (e) {
        toast.error("Could not load package pricing");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const packages = useMemo<TierPricing[]>(() => {
    const tierNames = ["Basic", "Pro", "Ultra"];
    return tierNames.map((tierName) => {
      const staticData = TIER_STATIC_DATA[tierName];
      const tierKey = tierName.toLowerCase() as keyof typeof TIER_SPEC_MAP;
      const tierPlans = TIER_SPEC_MAP[tierKey].flatMap((specId) => plansBySpec[specId] ?? []);
      const weekPrices = tierPlans
        .filter((p) => Number(p.durationDays ?? 0) >= 7 && Number(p.durationDays ?? 0) < 28)
        .map((p) => Number(p.price ?? 0))
        .filter((value) => value > 0);
      const monthPrices = tierPlans
        .filter((p) => Number(p.durationDays ?? 0) >= 28 && Number(p.durationDays ?? 0) < 365)
        .map((p) => Number(p.price ?? 0))
        .filter((value) => value > 0);
      const yearPrices = tierPlans
        .filter((p) => Number(p.durationDays ?? 0) >= 365)
        .map((p) => Number(p.price ?? 0))
        .filter((value) => value > 0);

      const firstPlan = tierPlans[0];
      const monthPrice = monthPrices[0] ?? weekPrices[0] ?? firstPlan?.price ?? 0;
      const weekPrice = weekPrices[0] ?? (monthPrice > 0 ? monthPrice / 4 : firstPlan?.price ?? 0);
      const yearPrice = yearPrices[0] ?? (monthPrice > 0 ? monthPrice * 12 : weekPrice * 52);

      return {
        ...staticData,
        pricing: {
          week: { amountUsd: weekPrice, period: "/ week" },
          month: { amountUsd: monthPrice, period: "/ month" },
          year: { amountUsd: yearPrice, period: "/ year" },
        },
      };
    });
  }, [plansBySpec]);



  return (
    <section id="packages" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose your
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              plan
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Pick a plan and billing period. Hardware is maintained on a schedule so performance stays
            predictable.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-card border border-border rounded-lg p-1">
            <button
              type="button"
              onClick={() => setSelectedPeriod("week")}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                selectedPeriod === "week"
                  ? "bg-gradient-to-r from-primary to-accent text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="w-4 h-4" />
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod("month")}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                selectedPeriod === "month"
                  ? "bg-gradient-to-r from-primary to-accent text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="w-4 h-4" />
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod("year")}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                selectedPeriod === "year"
                  ? "bg-gradient-to-r from-primary to-accent text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="w-4 h-4" />
              Yearly
              <span className="ml-1 text-xs bg-accent/20 px-2 py-0.5 rounded-full">Best value</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading package pricing...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => {
              const currentPricing = pkg.pricing[selectedPeriod];

              return (
                <Card
                  key={index}
                  className={`relative overflow-hidden group hover:scale-105 transition-all duration-300 ${
                    pkg.popular ? "border-primary shadow-lg shadow-primary/20" : "border-border hover:border-primary/50"
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary/20 p-2 rounded-lg border border-primary/50">
                          <pkg.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold">{pkg.name}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="text-4xl font-bold text-money">{formatUsd(currentPricing.amountUsd)}</span>
                        <span className="text-muted-foreground">{currentPricing.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {pkg.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground/90">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <Button asChild className="w-full border border-amber-500/50 bg-transparent text-foreground hover:bg-amber-500/10 hover:border-amber-500">
                      <Link to={`/packages/${pkg.tierName.toLowerCase()}`}>View details</Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
