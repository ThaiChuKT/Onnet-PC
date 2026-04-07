import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Check, Cpu, Gamepad2, Zap, Clock, Loader2 } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthProvider";
import { apiPost } from "../api/http";
import { toast } from "sonner";

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

const packages = [
  {
    tierName: "Basic",
    name: "Basic Gaming",
    icon: Gamepad2,
    pricing: {
      week: { price: "149,000 ₫", period: "/ week" },
      month: { price: "3,499,000 ₫", period: "/ month" },
      year: { price: "34,900,000 ₫", period: "/ year" },
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
    popular: false,
  },
  {
    tierName: "Pro",
    name: "Pro Gaming",
    icon: Zap,
    pricing: {
      week: { price: "299,000 ₫", period: "/ week" },
      month: { price: "6,999,000 ₫", period: "/ month" },
      year: { price: "69,900,000 ₫", period: "/ year" },
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
    popular: true,
  },
  {
    tierName: "Ultra",
    name: "Ultra Gaming",
    icon: Cpu,
    pricing: {
      week: { price: "499,000 ₫", period: "/ week" },
      month: { price: "11,999,000 ₫", period: "/ month" },
      year: { price: "119,900,000 ₫", period: "/ year" },
    },
    image:
      "https://images.unsplash.com/photo-1636914011676-039d36b73765?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYyUyMGdhbWluZyUyMHJvb20lMjBzZXR1cHxlbnwxfHx8fDE3NzM2NzY1ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    features: [
      "Intel Core i9 / Ryzen 9",
      "RTX 4080 16GB",
      "64GB DDR5 RAM",
      "2TB NVMe Gen4 SSD",
      '32" 4K 144Hz monitor',
      "Premium streaming-ready setup",
    ],
    popular: false,
  },
];

export function Packages() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");
  const [isSubmittingTier, setIsSubmittingTier] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleBookTier = async (tierName: string) => {
    if (isSubmittingTier !== null) return;

    if (!isAuthenticated) {
      toast.message("Sign in to subscribe to a tier");
      navigate("/login", { replace: false, state: { from: "/" } });
      return;
    }

    setIsSubmittingTier(tierName);
    try {
      const res = await apiPost<RentMachineResponse>("/bookings/rent", {
        tierName,
        rentalUnit: selectedPeriod,
        quantity: 1,
      });
      toast.success(res.message || "Order created. Pay in My bookings, then start your session.");
      navigate("/account/rental-history");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create subscription order");
    } finally {
      setIsSubmittingTier(null);
    }
  };

  return (
    <section
      id="packages"
      className="py-20 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Subscription
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              tiers
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Pick a tier and billing period. Hardware is maintained on a schedule so performance stays
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
              <span className="ml-1 text-xs bg-accent/20 px-2 py-0.5 rounded-full">
                Best value
              </span>
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
                  pkg.popular
                    ? "border-primary shadow-lg shadow-primary/20"
                    : "border-border hover:border-primary/50"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent"></div>
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
                      <span className="text-4xl font-bold text-primary">
                        {currentPricing.price}
                      </span>
                      <span className="text-muted-foreground">
                        {currentPricing.period}
                      </span>
                    </div>
                    {selectedPeriod === "year" && (
                      <p className="text-xs text-accent mt-1">
                        Save up to ~20% vs paying month-to-month
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/90">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleBookTier(pkg.tierName)}
                    disabled={isSubmittingTier !== null}
                    className={`w-full ${
                      pkg.popular
                        ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        : "bg-card border border-primary text-foreground hover:bg-primary/10"
                    }`}
                  >
                    {isSubmittingTier === pkg.tierName ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      "Subscribe now"
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-card/50 backdrop-blur border border-border rounded-lg px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">Flexible rental pricing</div>
                <div className="text-xs text-muted-foreground">
                  Switch period anytime before checkout
                </div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-border"></div>
            <div className="text-sm text-muted-foreground">
              Security deposit: <span className="text-primary font-bold">500,000 ₫</span> — refunded
              when hardware is returned
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
