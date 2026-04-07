import { Button } from "./ui/button";
import { ArrowRight, Zap, Cpu, Shield, Headphones } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Link } from "react-router";

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1704871132518-94cadb901021?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBwYyUyMHNldHVwJTIwcmdiJTIwbGlnaHRzfGVufDF8fHx8MTc3MzY3NjU4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Gaming PC setup"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/50 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">High performance · Fair pricing</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Gaming PC rental
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              done right
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
            Access high-end rigs with flexible subscription plans — pool-assigned machines, wallet
            checkout, and support when you need it.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg px-8"
              asChild
            >
              <a href="#packages">
                View plans
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-primary text-foreground hover:bg-primary/10 text-lg px-8" asChild>
              <Link to="/ai-chat">Free AI consult</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
            <div className="bg-card/50 backdrop-blur-md border border-primary/30 rounded-lg p-4 hover:border-primary transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <Cpu className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold">Strong specs</div>
                  <div className="text-xs text-muted-foreground">RTX 40 series class</div>
                </div>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-md border border-accent/30 rounded-lg p-4 hover:border-accent transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 p-2 rounded-lg">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-bold">Warranty & care</div>
                  <div className="text-xs text-muted-foreground">Technical support</div>
                </div>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-md border border-secondary/30 rounded-lg p-4 hover:border-secondary transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/20 p-2 rounded-lg">
                  <Headphones className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <div className="text-sm font-bold">24/7 support</div>
                  <div className="text-xs text-muted-foreground">Fast help</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
