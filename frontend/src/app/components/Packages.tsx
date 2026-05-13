import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Check, Clock, Cpu, Gamepad2, Zap } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";
import { Link } from "react-router";
import { formatUsd } from "../lib/formatUsd";

/** Legacy list prices were in VND; USD amounts use 25,000 VND = 1 USD. */
const vndToUsd = (vnd: number) => Math.round((vnd / 25_000) * 100) / 100;

const packages = [
  {
    tierName: "Basic",
    name: "Basic Gaming",
    icon: Gamepad2,
    pricing: {
      week: { amountUsd: vndToUsd(149_000), period: "/ week" },
      month: { amountUsd: vndToUsd(3_499_000), period: "/ month" },
      year: { amountUsd: vndToUsd(34_900_000), period: "/ year" },
    },
    image:
      "https://images.unsplash.com/photo-1760708825878-9e7ecf31565a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBkZXNrdG9wJTIwY29tcHV0ZXIlMjB0b3dlcnxlbnwxfHx8fDE3NzM2NzY1ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    features: [
      "Intel Core i5 / Ryzen 5",
      "GTX 1660 Super",
      "16GB DDR4 RAM",
      "512GB NVMe SSD",
      '24" 144Hz monitor',
      "Keyboard & mouse included",
    ],
    benefits: [
      "Perfect for 1080p gaming",
      "Install your games & mods from Steam, Epic, Battle.net",
      "Multi-screen and ultrawide support"
    ],
    popular: false,
  },
  {
    tierName: "Pro",
    name: "Pro Gaming",
    icon: Zap,
    pricing: {
      week: { amountUsd: vndToUsd(299_000), period: "/ week" },
      month: { amountUsd: vndToUsd(6_999_000), period: "/ month" },
      year: { amountUsd: vndToUsd(69_900_000), period: "/ year" },
    },
    image:
      "https://images.unsplash.com/photo-1738347826086-cadfac03cd45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZW5kJTIwZ2FtaW5nJTIwY29tcHV0ZXJ8ZW58MXx8fHwxNzczNjc2NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    features: [
      "Intel Core i7 / Ryzen 7",
      "RTX 4060 Ti 8GB",
      "32GB DDR5 RAM",
      "1TB NVMe Gen4 SSD",
      '27" 240Hz monitor',
      "Full premium gaming kit",
    ],
    benefits: [
      "Deliver high framerates for competitive gaming",
      "Built for streaming while gaming at high settings",
      "Perfect for content creation and editing"
    ],
    popular: true,
  },
  {
    tierName: "Ultra",
    name: "Ultra Gaming",
    icon: Cpu,
    pricing: {
      week: { amountUsd: vndToUsd(499_000), period: "/ week" },
      month: { amountUsd: vndToUsd(11_999_000), period: "/ month" },
      year: { amountUsd: vndToUsd(119_900_000), period: "/ year" },
    },
    image:
      "https://images.unsplash.com/photo-1636914011676-039d36b73765?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYyUyMGdhbWluZyUyMHJvb20lMjBzZXR1cHxlbnwxfHx8fDE3NzY2NzY1ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    features: [
      "Intel Core i9 / Ryzen 9",
      "RTX 4080 16GB",
      "64GB DDR5 RAM",
      "2TB NVMe Gen4 SSD",
      '32" 4K 144Hz monitor',
      "Premium streaming-ready setup",
    ],
    benefits: [
      "Maximum performance for any game at ultra settings",
      "Designed for competitive esports with max framerates",
      "Professional-grade tools for 4K content creation"
    ],
    popular: false,
  },
];

type PackagesProps = {
  variant?: "home" | "page";
};

export function Packages({ variant = "page" }: PackagesProps) {
  const isHome = variant === "home";
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  if (isHome) {
    return (
      <section id="packages" className="py-24 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                plans
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the setup that matches your budget and performance target. Each plan is built for a
              different play style, from entry level to high-end.
            </p>
            <div className="mt-6">
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                <Link to="/packages">Join now</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {packages.map((pkg) => {
              const currentPricing = pkg.pricing.month;

              return (
                <Card
                  key={pkg.tierName}
                  className={`relative overflow-hidden border-border bg-card/70 backdrop-blur-sm ${
                    pkg.popular ? "ring-1 ring-primary/50 shadow-lg shadow-primary/10" : ""
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="relative h-52 overflow-hidden">
                    <ImageWithFallback src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                      <div className="bg-primary/20 p-2 rounded-lg border border-primary/40 backdrop-blur-sm">
                        <pkg.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{pkg.tierName}</p>
                        <h3 className="text-2xl font-bold">{pkg.name}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-4xl font-bold text-money">{formatUsd(currentPricing.amountUsd)}</span>
                      <span className="text-muted-foreground">{currentPricing.period}</span>
                    </div>

                    <p className="text-sm text-muted-foreground">{pkg.features[0]}</p>

                    <ul className="space-y-2">
                      {pkg.features.slice(1, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground/90">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex gap-3">
                      <Button asChild variant="ghost" className="flex-1 text-primary hover:text-primary/90">
                        <Link to="/packages">Join now</Link>
                      </Button>
                      <Button asChild className="flex-1 bg-card border border-border text-foreground hover:bg-primary/10">
                        <Link to={`/packages/${pkg.tierName.toLowerCase()}`}>View details</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

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
      </div>
    </section>
  );
}
