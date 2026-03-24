import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Check, Cpu, Gamepad2, Zap, Clock } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";

const packages = [
  {
    name: "Basic Gaming",
    icon: Gamepad2,
    pricing: {
      hourly: { price: "15.000đ", period: "/ giờ" },
      daily: { price: "150.000đ", period: "/ ngày" },
      monthly: { price: "3.500.000đ", period: "/ tháng" },
    },
    image:
      "https://images.unsplash.com/photo-1760708825878-9e7ecf31565a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBkZXNrdG9wJTIwY29tcHV0ZXIlMjB0b3dlcnxlbnwxfHx8fDE3NzM2NzY1ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    features: [
      "Intel Core i5 / Ryzen 5",
      "GTX 1660 Super",
      "16GB RAM DDR4",
      "SSD 512GB NVMe",
      'Monitor 24" 144Hz',
      "Bàn phím + chuột gaming",
    ],
    popular: false,
  },
  {
    name: "Pro Gaming",
    icon: Zap,
    pricing: {
      hourly: { price: "30.000đ", period: "/ giờ" },
      daily: { price: "300.000đ", period: "/ ngày" },
      monthly: { price: "7.000.000đ", period: "/ tháng" },
    },
    image:
      "https://images.unsplash.com/photo-1738347826086-cadfac03cd45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZW5kJTIwZ2FtaW5nJTIwY29tcHV0ZXJ8ZW58MXx8fHwxNzczNjc2NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    features: [
      "Intel Core i7 / Ryzen 7",
      "RTX 4060 Ti 8GB",
      "32GB RAM DDR5",
      "SSD 1TB NVMe Gen4",
      'Monitor 27" 240Hz',
      "Full bộ gaming gear cao cấp",
    ],
    popular: true,
  },
  {
    name: "Ultra Gaming",
    icon: Cpu,
    pricing: {
      hourly: { price: "50.000đ", period: "/ giờ" },
      daily: { price: "500.000đ", period: "/ ngày" },
      monthly: { price: "12.000.000đ", period: "/ tháng" },
    },
    image:
      "https://images.unsplash.com/photo-1636914011676-039d36b73765?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYyUyMGdhbWluZyUyMHJvb20lMjBzZXR1cHxlbnwxfHx8fDE3NzM2NzY1ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    features: [
      "Intel Core i9 / Ryzen 9",
      "RTX 4080 16GB",
      "64GB RAM DDR5",
      "SSD 2TB NVMe Gen4",
      'Monitor 32" 4K 144Hz',
      "Premium gaming setup",
    ],
    popular: false,
  },
];

export function Packages() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "hourly" | "daily" | "monthly"
  >("daily");

  return (
    <section
      id="packages"
      className="py-20 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Gói Cho Thuê
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Phù Hợp Mọi Nhu Cầu
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Chọn cấu hình phù hợp với nhu cầu gaming của bạn. Tất cả đều được
            bảo dưỡng định kỳ và đảm bảo hiệu suất tối đa.
          </p>

          {/* Period Selector */}
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-lg p-1">
            <button
              onClick={() => setSelectedPeriod("hourly")}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                selectedPeriod === "hourly"
                  ? "bg-gradient-to-r from-primary to-accent text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="w-4 h-4" />
              Theo Giờ
            </button>
            <button
              onClick={() => setSelectedPeriod("daily")}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                selectedPeriod === "daily"
                  ? "bg-gradient-to-r from-primary to-accent text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="w-4 h-4" />
              Theo Ngày
            </button>
            <button
              onClick={() => setSelectedPeriod("monthly")}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                selectedPeriod === "monthly"
                  ? "bg-gradient-to-r from-primary to-accent text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="w-4 h-4" />
              Theo Tháng
              <span className="ml-1 text-xs bg-accent/20 px-2 py-0.5 rounded-full">
                Tiết kiệm
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
                    PHỔ BIẾN NHẤT
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
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-primary">
                        {currentPricing.price}
                      </span>
                      <span className="text-muted-foreground">
                        {currentPricing.period}
                      </span>
                    </div>
                    {selectedPeriod === "monthly" && (
                      <p className="text-xs text-accent mt-1">
                        Tiết kiệm đến 20% so với thuê theo ngày
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
                    className={`w-full ${
                      pkg.popular
                        ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        : "bg-card border border-primary text-foreground hover:bg-primary/10"
                    }`}
                  >
                    Đặt Ngay
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-card/50 backdrop-blur border border-border rounded-lg px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">Giá thuê linh hoạt</div>
                <div className="text-xs text-muted-foreground">
                  Tùy chọn theo nhu cầu của bạn
                </div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-border"></div>
            <div className="text-sm text-muted-foreground">
              Đặt cọc: <span className="text-primary font-bold">500.000đ</span>{" "}
              - Hoàn lại khi trả máy
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
