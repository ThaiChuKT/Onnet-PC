import { Gamepad2, MonitorSmartphone, Headphones, ShieldCheck } from "lucide-react";
import { Card } from "./ui/card";

const features = [
  {
    icon: Gamepad2,
    title: "All your games",
    description: "Play your favorite titles with a full PC stack tuned for fast installs and steady performance.",
  },
  {
    icon: MonitorSmartphone,
    title: "PC games on any device",
    description: "Keep your session with you on desktop, laptop, tablet, or browser without changing your setup.",
  },
  {
    icon: Headphones,
    title: "Support when you need it",
    description: "Our team is available to help with setup, billing, and playtime issues when they come up.",
  },
  {
    icon: ShieldCheck,
    title: "High settings",
    description: "RTX-ready rigs keep graphics settings high while staying responsive for long sessions.",
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-56 h-56 bg-primary/20 blur-3xl rounded-full" />
        <div className="absolute top-10 right-0 w-72 h-72 bg-accent/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[36rem] h-40 bg-secondary/20 blur-3xl rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-[1.18]">
            Built for
            <span className="block pb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              modern gaming
            </span>
          </h2>
          <p className="text-foreground/70 text-lg leading-relaxed">
            A cleaner, faster cloud-PC experience with the core benefits users expect when they compare plans.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="min-h-[25rem] border border-primary/20 bg-gradient-to-br from-card/50 to-primary/10 p-8 text-center shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="mx-auto mb-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-md shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
                <feature.icon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mb-6 text-2xl font-semibold leading-snug text-foreground">{feature.title}</h3>
              <p className="mx-auto max-w-[14rem] text-foreground/70 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
