import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { ChatbotBuilderWebchat } from "../components/ChatbotBuilderWebchat";
import { Sparkles } from "lucide-react";

const accountId = (import.meta.env.VITE_CHATBOT_BUILDER_ACCOUNT_ID as string | undefined)?.trim() || "1632229";
const webchatId = (import.meta.env.VITE_CHATBOT_BUILDER_WEBCHAT_ID as string | undefined)?.trim();
const color = (import.meta.env.VITE_CHATBOT_BUILDER_COLOR as string | undefined)?.trim() || "#ff4d1d";

export function AIChatPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background pt-20">
        <section className="border-b border-border bg-card/35">
          <div className="mx-auto max-w-[1680px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-3">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold md:text-4xl">
                  AI <span className="text-primary">assistant</span>
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Ask about plans, checkout, sessions, Moonlight, and account support.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1680px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-primary/20 bg-card/80 p-2 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <ChatbotBuilderWebchat
              accountId={accountId}
              webchatId={webchatId}
              color={color}
              headerTitle="OnnetPC assistant"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
