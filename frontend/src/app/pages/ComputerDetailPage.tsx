import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Monitor,
  Cpu,
  Zap,
  MemoryStick,
  HardDrive,
  Check,
  ArrowLeft,
  Clock,
  DollarSign,
} from "lucide-react";

// Mock data - trong thực tế sẽ fetch từ API
const computerData: { [key: string]: any } = {
  PC001: {
    id: "PC001",
    name: "Basic Gaming #1",
    category: "Basic",
    cpu: "Intel i5-12400F",
    gpu: "GTX 1660 Super",
    ram: "16GB DDR4",
    storage: "500GB NVMe SSD",
    status: "rented",
    hourlyPrice: 20000,
    dailyPrice: 150000,
    monthlyPrice: 2500000,
    description:
      "Cấu hình Basic Gaming phù hợp cho game thủ mới bắt đầu. Có thể chơi mượt các tựa game eSports như CSGO, Valorant, League of Legends ở mức cài đặt cao.",
    features: [
      "Chơi game eSports mượt mà 144+ FPS",
      "Streaming chất lượng 1080p",
      "Thiết kế tản nhiệt tối ưu",
      "Kết nối internet tốc độ cao",
      "Hỗ trợ kỹ thuật 24/7",
    ],
  },
  PC002: {
    id: "PC002",
    name: "Basic Gaming #2",
    category: "Basic",
    cpu: "Intel i5-12400F",
    gpu: "GTX 1660 Super",
    ram: "16GB DDR4",
    storage: "500GB NVMe SSD",
    status: "available",
    hourlyPrice: 20000,
    dailyPrice: 150000,
    monthlyPrice: 2500000,
    description:
      "Cấu hình Basic Gaming phù hợp cho game thủ mới bắt đầu. Có thể chơi mượt các tựa game eSports như CSGO, Valorant, League of Legends ở mức cài đặt cao.",
    features: [
      "Chơi game eSports mượt mà 144+ FPS",
      "Streaming chất lượng 1080p",
      "Thiết kế tản nhiệt tối ưu",
      "Kết nối internet tốc độ cao",
      "Hỗ trợ kỹ thuật 24/7",
    ],
  },
  PC003: {
    id: "PC003",
    name: "Pro Gaming #1",
    category: "Pro",
    cpu: "Intel i7-13700K",
    gpu: "RTX 4060 Ti",
    ram: "32GB DDR5",
    storage: "1TB NVMe SSD",
    status: "available",
    hourlyPrice: 35000,
    dailyPrice: 250000,
    monthlyPrice: 4500000,
    description:
      "Cấu hình Pro Gaming cho game thủ chuyên nghiệp. Xử lý mượt mà các tựa game AAA ở cài đặt cao đến ultra với FPS ổn định.",
    features: [
      "Chơi game AAA ultra settings 100+ FPS",
      "Streaming + Recording đồng thời",
      "Ray Tracing & DLSS 3.0",
      "Tản nhiệt nước AIO cao cấp",
      "Ưu tiên hỗ trợ kỹ thuật",
    ],
  },
  PC004: {
    id: "PC004",
    name: "Pro Gaming #2",
    category: "Pro",
    cpu: "Intel i7-13700K",
    gpu: "RTX 4060 Ti",
    ram: "32GB DDR5",
    storage: "1TB NVMe SSD",
    status: "available",
    hourlyPrice: 35000,
    dailyPrice: 250000,
    monthlyPrice: 4500000,
    description:
      "Cấu hình Pro Gaming cho game thủ chuyên nghiệp. Xử lý mượt mà các tựa game AAA ở cài đặt cao đến ultra với FPS ổn định.",
    features: [
      "Chơi game AAA ultra settings 100+ FPS",
      "Streaming + Recording đồng thời",
      "Ray Tracing & DLSS 3.0",
      "Tản nhiệt nước AIO cao cấp",
      "Ưu tiên hỗ trợ kỹ thuật",
    ],
  },
  PC005: {
    id: "PC005",
    name: "Ultra Gaming #1",
    category: "Ultra",
    cpu: "Intel i9-13900K",
    gpu: "RTX 4080",
    ram: "64GB DDR5",
    storage: "2TB NVMe SSD",
    status: "available",
    hourlyPrice: 50000,
    dailyPrice: 350000,
    monthlyPrice: 7000000,
    description:
      "Cấu hình Ultra Gaming đỉnh cao cho các streamer, content creator chuyên nghiệp. Xử lý mượt mà mọi tác vụ nặng nhất.",
    features: [
      "Chơi game 4K ultra settings 144+ FPS",
      "Streaming 4K + Recording đồng thời",
      "Ray Tracing & DLSS 3.0 tối ưu",
      "Render video & 3D siêu nhanh",
      "VIP support & setup tùy chỉnh",
    ],
  },
  PC006: {
    id: "PC006",
    name: "Ultra Gaming #2",
    category: "Ultra",
    cpu: "AMD Ryzen 9 7950X",
    gpu: "RTX 4090",
    ram: "64GB DDR5",
    storage: "2TB NVMe SSD",
    status: "available",
    hourlyPrice: 60000,
    dailyPrice: 400000,
    monthlyPrice: 8000000,
    description:
      "Cấu hình Ultra Gaming đỉnh cao nhất với RTX 4090. Dành cho những người yêu cầu hiệu năng tối đa trong mọi tình huống.",
    features: [
      "Hiệu năng gaming đỉnh cao nhất",
      "Streaming & Recording 8K",
      "Ray Tracing hoàn hảo",
      "Đa nhiệm cực mạnh",
      "Dịch vụ VIP cao cấp nhất",
    ],
  },
};

export function ComputerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rentalDuration, setRentalDuration] = useState("monthly");
  const [showSuccess, setShowSuccess] = useState(false);

  const computer = computerData[id || ""];

  if (!computer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 pb-12 flex items-center justify-center">
          <Card className="p-12 border-border text-center">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Không tìm thấy máy</h3>
            <Button onClick={() => navigate("/computers")} className="mt-4">
              Quay lại danh sách
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const calculatePrice = () => {
    switch (rentalDuration) {
      case "hourly":
        return computer.hourlyPrice;
      case "daily":
        return computer.dailyPrice;
      case "monthly":
        return computer.monthlyPrice;
      default:
        return 0;
    }
  };

  const handleRent = () => {
    // Mock rental process
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate("/account/rental-history");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/computers")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>

          {showSuccess && (
            <Card className="p-4 bg-accent/10 border-accent mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-accent rounded-full p-2">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-accent">Đặt thuê thành công!</h4>
                  <p className="text-sm text-muted-foreground">
                    Đang chuyển đến lịch sử thuê...
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Left Column - Details */}
            <div className="space-y-6">
              {/* Main Info */}
              <Card className="p-6 border-border">
                {/* Image */}
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-lg mb-6 flex items-center justify-center">
                  <Monitor className="w-48 h-48 text-primary/50" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">{computer.name}</h1>
                    <Badge
                      className={
                        computer.status === "available"
                          ? "bg-accent/20 text-accent border-accent/50"
                          : "bg-muted text-muted-foreground border-border"
                      }
                    >
                      {computer.status === "available" ? "Có sẵn" : "Đang thuê"}
                    </Badge>
                  </div>

                  <Badge className="bg-primary/20 text-primary border-primary/50">
                    {computer.category}
                  </Badge>

                  <p className="text-muted-foreground">{computer.description}</p>
                </div>
              </Card>

              {/* Specs */}
              <Card className="p-6 border-border">
                <h2 className="text-2xl font-bold mb-4">Cấu Hình Chi Tiết</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="bg-primary/20 p-3 rounded-lg">
                      <Cpu className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CPU</p>
                      <p className="font-bold">{computer.cpu}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <Zap className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">GPU</p>
                      <p className="font-bold">{computer.gpu}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="bg-accent/20 p-3 rounded-lg">
                      <MemoryStick className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">RAM</p>
                      <p className="font-bold">{computer.ram}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="bg-primary/20 p-3 rounded-lg">
                      <HardDrive className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Storage</p>
                      <p className="font-bold">{computer.storage}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Features */}
              <Card className="p-6 border-border">
                <h2 className="text-2xl font-bold mb-4">Tính Năng Nổi Bật</h2>
                <ul className="space-y-3">
                  {computer.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="bg-accent/20 p-1 rounded-full">
                        <Check className="w-4 h-4 text-accent" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Right Column - Rental */}
            <div className="space-y-6">
              {/* Rental Form */}
              <Card className="p-6 border-border sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Thuê Máy</h2>

                <div className="space-y-4">
                  {/* Duration Selection */}
                  <div className="space-y-2">
                    <Label>Thời gian thuê</Label>
                    <Select value={rentalDuration} onValueChange={setRentalDuration}>
                      <SelectTrigger className="bg-input-background border-border h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Theo giờ
                          </div>
                        </SelectItem>
                        <SelectItem value="daily">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Theo ngày
                          </div>
                        </SelectItem>
                        <SelectItem value="monthly">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Theo tháng
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Display */}
                  <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Giá thuê</span>
                      <span className="text-sm text-muted-foreground">
                        {rentalDuration === "hourly"
                          ? "/ giờ"
                          : rentalDuration === "daily"
                          ? "/ ngày"
                          : "/ tháng"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-primary" />
                      <span className="text-3xl font-bold text-primary">
                        {calculatePrice().toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>

                  {/* Pricing Info */}
                  <div className="space-y-2 text-sm p-4 bg-muted/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giá theo giờ:</span>
                      <span className="font-medium">
                        {computer.hourlyPrice.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giá theo ngày:</span>
                      <span className="font-medium">
                        {computer.dailyPrice.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giá theo tháng:</span>
                      <span className="font-medium">
                        {computer.monthlyPrice.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>

                  {/* Rent Button */}
                  <Button
                    onClick={handleRent}
                    disabled={computer.status === "rented"}
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50"
                  >
                    {computer.status === "available" ? "Thuê Ngay" : "Không Khả Dụng"}
                  </Button>

                  {/* Info */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Lưu ý:</strong> Sau khi thuê, bạn sẽ nhận được mã kết nối để
                      truy cập máy. Vui lòng thanh toán qua ví điện tử.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
