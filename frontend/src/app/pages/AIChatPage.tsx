import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
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

const initialMessage: Message = {
  id: "1",
  role: "assistant",
  content:
    "Xin chào! Tôi là AI assistant của RentPC Pro. Tôi có thể giúp bạn:\n\n• Tư vấn cấu hình máy phù hợp với nhu cầu\n• So sánh các gói dịch vụ\n• Giải đáp thắc mắc về giá cả\n• Gợi ý máy tốt nhất cho từng mức giá\n\nBạn muốn thuê máy để làm gì?",
  timestamp: new Date(),
  suggestions: [
    "Chơi game AAA",
    "Streaming",
    "Làm việc văn phòng",
    "Render video/3D",
  ],
};

// Mock AI responses
const aiResponses: { [key: string]: string } = {
  "chơi game": `Để chơi game, tôi gợi ý các cấu hình sau:

**Basic Gaming (20k/giờ)**
• CPU: Intel i5-12400F
• GPU: GTX 1660 Super
• RAM: 16GB DDR4
→ Phù hợp: Game eSports (CSGO, Valorant, LOL) ở 144+ FPS

**Pro Gaming (35k/giờ)**
• CPU: Intel i7-13700K
• GPU: RTX 4060 Ti
• RAM: 32GB DDR5
→ Phù hợp: Game AAA (Cyberpunk, GTA 5) ở Ultra 100+ FPS

**Ultra Gaming (50k/giờ)**
• CPU: Intel i9-13900K
• GPU: RTX 4080
• RAM: 64GB DDR5
→ Phù hợp: Game 4K, VR, Ray Tracing tối đa

Bạn thường chơi game gì?`,

  streaming: `Để streaming chất lượng cao, tôi đề xuất:

**Pro Gaming (35k/giờ)** ⭐ Khuyên dùng
• CPU: Intel i7-13700K (12 cores xử lý tốt)
• GPU: RTX 4060 Ti (NVENC encoder)
• RAM: 32GB DDR5
• Có thể: Stream 1080p60fps + chơi game mượt

**Ultra Gaming (50k/giờ)** 🔥 Chuyên nghiệp
• CPU: Intel i9-13900K (24 cores)
• GPU: RTX 4080
• RAM: 64GB DDR5
• Có thể: Stream 4K + record + chơi game ultra

Cả hai đều có NVENC encoder giúp stream không ảnh hưởng FPS!

Bạn stream game gì và platform nào?`,

  "làm việc": `Cho công việc văn phòng, tôi gợi ý:

**Basic Gaming (20k/giờ)** ✅ Tối ưu
• CPU: Intel i5-12400F
• RAM: 16GB DDR4
• Storage: 500GB NVMe SSD
→ Phù hợp: Office, Google Workspace, Zoom, nhẹ nhàng

**Pro Gaming (35k/giờ)** - Nếu cần mạnh hơn
• CPU: Intel i7-13700K
• RAM: 32GB DDR5
• Storage: 1TB NVMe SSD
→ Phù hợp: Đa nhiệm nặng, AutoCAD, Photoshop

Công việc của bạn có cần phần mềm đặc biệt không?`,

  render: `Để render video/3D chuyên nghiệp:

**Ultra Gaming (50k/giờ)** 🎬 Bắt buộc
• CPU: Intel i9-13900K (24 cores)
• GPU: RTX 4080 (CUDA cores)
• RAM: 64GB DDR5
• Storage: 2TB NVMe SSD

**Ưu điểm:**
✓ Render Premiere/After Effects nhanh 3-5x
✓ GPU rendering cho Blender, Cinema 4D
✓ RAM 64GB xử lý project lớn
✓ CUDA/OptiX acceleration

**Giá tham khảo:**
• 1 giờ: 50,000đ
• 1 ngày: 350,000đ
• 1 tháng: 7,000,000đ (tiết kiệm nhất!)

Bạn dùng phần mềm nào (Premiere, Blender, ...)?`,

  giá: `**Bảng giá dịch vụ:**

💰 **Basic Gaming**
• Giờ: 20,000đ
• Ngày: 150,000đ (tiết kiệm 330k so với giờ!)
• Tháng: 2,500,000đ (tiết kiệm 12M so với giờ!)

💎 **Pro Gaming**
• Giờ: 35,000đ
• Ngày: 250,000đ
• Tháng: 4,500,000đ

🔥 **Ultra Gaming**
• Giờ: 50,000đ
• Ngày: 350,000đ
• Tháng: 7,000,000đ

**Mẹo tiết kiệm:**
📌 Thuê theo tháng giảm đến 90%!
📌 Nạp ví PayPal nhanh chóng
📌 Không phí ẩn, không ràng buộc

Bạn dự định thuê trong bao lâu?`,

  default: `Tôi có thể giúp bạn về:

🎮 **Tư vấn cấu hình**
• Chơi game: Basic/Pro/Ultra
• Streaming & Recording
• Làm việc & học tập
• Render video & 3D

💰 **Tư vấn giá cả**
• So sánh gói theo giờ/ngày/tháng
• Tính toán chi phí phù hợp
• Mẹo tiết kiệm

📊 **So sánh máy**
• So sánh hiệu năng
• Chọn máy theo budget
• Xem máy nào đang trống

Bạn cần tư vấn gì cụ thể?`,
};

export function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
      lowerMessage.includes("office")
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
      lowerMessage.includes("tiền")
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
            ? ["Xem máy phù hợp", "So sánh giá", "Câu hỏi khác"]
            : undefined,
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === "Xem máy phù hợp") {
      navigate("/computers");
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
                  Chat Tư Vấn
                </span>
              </h1>
            </div>
            <p className="text-muted-foreground">
              Hỏi AI để được tư vấn cấu hình và giá phù hợp nhất
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
                      {message.timestamp.toLocaleTimeString("vi-VN", {
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
                  placeholder="Nhập câu hỏi của bạn..."
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
              onClick={() => navigate("/computers")}
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <Monitor className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold">Xem Máy</p>
                  <p className="text-sm text-muted-foreground">
                    Danh sách đầy đủ
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-4 border-border hover:border-primary/50 cursor-pointer transition-all"
              onClick={() => handleSend("So sánh giá các gói")}
            >
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-bold">So Sánh Giá</p>
                  <p className="text-sm text-muted-foreground">
                    Chọn gói tốt nhất
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-4 border-border hover:border-primary/50 cursor-pointer transition-all"
              onClick={() => handleSend("Máy nào mạnh nhất?")}
            >
              <div className="flex items-center gap-3">
                <div className="bg-secondary/20 p-2 rounded-lg">
                  <Zap className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-bold">Hiệu Năng Cao</p>
                  <p className="text-sm text-muted-foreground">
                    Xem máy mạnh nhất
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
