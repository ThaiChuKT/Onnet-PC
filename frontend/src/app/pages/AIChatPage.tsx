import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthProvider";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Monitor,
  TrendingUp,
  Zap,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const SUGGEST_VIEW_PLANS = "View plans";

const initialMessage: Message = {
  id: "1",
  role: "assistant",
  content:
    "Hi! I’m the RentPC Pro assistant. I can help with:\n\n• Picking a tier for gaming, streaming, or work\n• Comparing Basic / Pro / Ultra\n• Pricing questions (see home page for current VND rates)\n• What to expect from pool-assigned hardware\n\nWhat do you want to use the PC for?",
  timestamp: new Date(),
  suggestions: ["AAA gaming", "Streaming", "Office work", "Video / 3D render"],
};

const aiResponses: { [key: string]: string } = {
  "chơi game": `For gaming, our subscription tiers map to these typical builds:

**Basic** — esports & lighter titles (1080p high FPS)
**Pro** — AAA at high/ultra 1440p
**Ultra** — 4K, heavy RT, VR

Exact hardware is assigned from the pool when you start a session. Tell me which games you play and I’ll narrow the tier.`,

  streaming: `For streaming, **Pro** is the usual sweet spot (NVENC, strong CPU). **Ultra** if you want 4K stream + heavy game simultaneously.

Ask in My bookings after paying — Start session assigns a machine from the pool.`,

  "làm việc": `For office and productivity, **Basic** covers browser, Office, video calls. Choose **Pro** if you run heavy multitasking, CAD, or large Photoshop files.`,

  render: `For Premiere, Blender, or 3D, pick **Ultra** for maximum GPU/CPU/RAM headroom. Long jobs are cheaper on monthly/yearly plans — check the Plans section on the home page.`,

  giá: `Published prices are on the home page (weekly / monthly / yearly). They’re shown in ₫ and updated there.

Rough orientation (verify on **Plans**):
• Basic — entry tier
• Pro — mid / streaming / AAA
• Ultra — top performance

Wallet top-up uses PayPal in USD on the Top up page.`,

  default: `I can help with:

🎮 **Tiers** — Basic vs Pro vs Ultra for your workload
💰 **Pricing** — point you to the Plans section for live numbers
🖥️ **Flow** — subscribe → pay in My bookings → Start session

What should we tackle first?`,
};

export function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const goToPlansOrCatalog = () => {
    if (isAdmin) {
      navigate("/computers");
    } else {
      navigate("/");
      window.setTimeout(() => {
        window.location.hash = "packages";
      }, 0);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes("game") ||
      lowerMessage.includes("chơi") ||
      lowerMessage.includes("aaa")
    ) {
      return aiResponses["chơi game"];
    } else if (
      lowerMessage.includes("stream") ||
      lowerMessage.includes("live")
    ) {
      return aiResponses["streaming"];
    } else if (
      lowerMessage.includes("làm việc") ||
      lowerMessage.includes("văn phòng") ||
      lowerMessage.includes("office") ||
      lowerMessage.includes("work")
    ) {
      return aiResponses["làm việc"];
    } else if (
      lowerMessage.includes("render") ||
      lowerMessage.includes("video") ||
      lowerMessage.includes("3d") ||
      lowerMessage.includes("blender")
    ) {
      return aiResponses["render"];
    } else if (
      lowerMessage.includes("giá") ||
      lowerMessage.includes("bao nhiêu") ||
      lowerMessage.includes("tiền") ||
      lowerMessage.includes("price") ||
      lowerMessage.includes("cost") ||
      lowerMessage.includes("how much")
    ) {
      return aiResponses["giá"];
    } else {
      return aiResponses["default"];
    }
  };

  const handleSend = (message?: string) => {
    const textToSend = message || inputValue.trim();
    if (!textToSend) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(textToSend),
        timestamp: new Date(),
        suggestions:
          Math.random() > 0.5
            ? [SUGGEST_VIEW_PLANS, "Compare pricing", "Another question"]
            : undefined,
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === SUGGEST_VIEW_PLANS) {
      goToPlansOrCatalog();
    } else {
      handleSend(suggestion);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-secondary to-accent p-3 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold">
                AI
                <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
                  {" "}
                  assistant
                </span>
              </h1>
            </div>
            <p className="text-muted-foreground">
              Ask about tiers, pricing, and how renting works
            </p>
          </div>

          {/* Chat Container */}
          <Card className="border-border h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-primary to-accent"
                        : "bg-gradient-to-br from-secondary to-accent"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`flex-1 ${
                      message.role === "user" ? "text-right" : ""
                    }`}
                  >
                    <div
                      className={`inline-block max-w-[80%] p-4 rounded-lg ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-primary to-accent text-white"
                          : "bg-muted/50"
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.content}</p>
                    </div>

                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="border-border hover:border-primary"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-secondary to-accent">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your question…"
                  className="bg-input-background border-border"
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim()}
                  className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card
              className="p-4 border-border hover:border-primary/50 cursor-pointer transition-all"
              onClick={() => goToPlansOrCatalog()}
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <Monitor className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold">{isAdmin ? "PC catalog" : "View plans"}</p>
                  <p className="text-sm text-muted-foreground">
                    {isAdmin ? "Admin inventory" : "Subscription tiers on home"}
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-4 border-border hover:border-primary/50 cursor-pointer transition-all"
              onClick={() => handleSend("Compare pricing of subscription tiers")}
            >
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-bold">Compare pricing</p>
                  <p className="text-sm text-muted-foreground">
                    Basic / Pro / Ultra
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-4 border-border hover:border-primary/50 cursor-pointer transition-all"
              onClick={() => handleSend("Which tier is the most powerful?")}
            >
              <div className="flex items-center gap-3">
                <div className="bg-secondary/20 p-2 rounded-lg">
                  <Zap className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-bold">Top performance</p>
                  <p className="text-sm text-muted-foreground">
                    Ultra tier overview
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
