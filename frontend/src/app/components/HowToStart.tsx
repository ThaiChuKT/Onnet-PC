import { CreditCard, MonitorSmartphone, UserPlus } from "lucide-react";
import { Card } from "./ui/card";

const steps = [
  {
    number: "01",
    title: "Sign up account",
    description: "Create your Onnet account so your wallet, bookings, and machine access stay in one place.",
    icon: UserPlus,
  },
  {
    number: "02",
    title: "Choose your plan",
    description: "Pick the weekly, monthly, or yearly package that matches the performance you need.",
    icon: CreditCard,
  },
  {
    number: "03",
    title: "Connect via Moonlight/Sunshine",
    description: "Launch your assigned gaming PC from your device with low-latency streaming.",
    icon: MonitorSmartphone,
  },
];

export function HowToStart() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted/30 via-background to-background py-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-16 h-40 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            How to
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              start
            </span>
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Get from account setup to your first streamed session in a few clear steps.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <Card className="group relative h-full min-h-[20rem] overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/10 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/10 blur-2xl transition-all duration-300 group-hover:bg-accent/20" />

                <div className="relative flex h-full flex-col">
                  <div className="mb-10 flex items-start justify-between gap-6">
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-6xl font-bold leading-none text-transparent md:text-7xl">
                      {step.number}
                    </span>
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h3 className="mb-4 text-2xl font-semibold leading-snug text-foreground">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
