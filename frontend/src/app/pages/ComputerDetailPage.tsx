import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useEffect, useMemo, useState } from "react";
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
import { apiGet, apiPost } from "../api/http";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthProvider";

type SubscriptionPlanPriceResponse = {
  id: number;
  planName: string;
  durationDays: number;
  price: number;
};

type MachineDetailResponse = {
  pcId: number;
  specId: number;
  specName: string;
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
  operatingSystem: string;
  description: string;
  hourlyPrice: number;
  location: string;
  plans: SubscriptionPlanPriceResponse[];
  approvedReviews: unknown[];
};

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
  message: string | null;
};

export function ComputerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  type RentalUnit = "hour" | "week" | "month" | "year";
  const [rentalUnit, setRentalUnit] = useState<RentalUnit>("month");
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [computer, setComputer] = useState<MachineDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRenting, setIsRenting] = useState(false);

  const pcId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!pcId) {
        setIsLoading(false);
        setLoadError("ID máy không hợp lệ");
        return;
      }
      setIsLoading(true);
      setLoadError(null);
      try {
        const detail = await apiGet<MachineDetailResponse>(`/pcs/${pcId}`);
        if (!cancelled) setComputer(detail);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Không thể tải thông tin máy";
        if (!cancelled) setLoadError(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pcId]);

  const currentPlan = useMemo(() => {
    if (!computer) return null;
    const durationDays = rentalUnit === "week" ? 7 : rentalUnit === "month" ? 30 : rentalUnit === "year" ? 365 : null;
    if (!durationDays) return null;
    return computer.plans?.find((p) => p.durationDays === durationDays) ?? null;
  }, [computer, rentalUnit]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 pb-12 flex items-center justify-center">
          <Card className="p-12 border-border text-center">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Đang tải thông tin máy...</h3>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!computer || loadError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 pb-12 flex items-center justify-center">
          <Card className="p-12 border-border text-center">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Không tìm thấy máy</h3>
            {loadError && <p className="text-muted-foreground">{loadError}</p>}
            <Button onClick={() => navigate("/computers")} className="mt-4">
              Quay lại danh sách
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const estimatedPrice = () => {
    if (rentalUnit === "hour") return Number(computer.hourlyPrice) * quantity;
    if (!currentPlan) return 0;
    return Number(currentPlan.price) * quantity;
  };

  const handleRent = async () => {
    if (isRenting) return;
    if (!isAuthenticated) {
      toast.message("Vui lòng đăng nhập để thuê máy");
      navigate("/login", { replace: false, state: { from: `/computers/${computer.pcId}` } });
      return;
    }
    setIsRenting(true);
    try {
      const res = await apiPost<RentMachineResponse, { specId: number; rentalUnit: string; quantity: number }>(
        "/bookings/rent",
        { specId: computer.specId, rentalUnit, quantity },
      );
      setShowSuccess(true);
      toast.success(res.message ?? "Tạo yêu cầu thuê máy thành công");
      window.setTimeout(() => {
        setShowSuccess(false);
        navigate("/account/rental-history");
      }, 1500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể thuê máy");
    } finally {
      setIsRenting(false);
    }
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
                    <h1 className="text-3xl font-bold">{computer.specName}</h1>
                    <Badge className="bg-accent/20 text-accent border-accent/50">Chi tiết</Badge>
                  </div>

                  <Badge className="bg-primary/20 text-primary border-primary/50">
                    PC #{computer.pcId}
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
                      <p className="font-bold">{computer.ram}GB</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="bg-primary/20 p-3 rounded-lg">
                      <HardDrive className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Storage</p>
                      <p className="font-bold">{computer.storage}GB</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Notes */}
              <Card className="p-6 border-border">
                <h2 className="text-2xl font-bold mb-4">Thông Tin Thêm</h2>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="bg-accent/20 p-1 rounded-full">
                      <Check className="w-4 h-4 text-accent" />
                    </div>
                    <span>Hệ điều hành: {computer.operatingSystem || "N/A"}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-accent/20 p-1 rounded-full">
                      <Check className="w-4 h-4 text-accent" />
                    </div>
                    <span>Địa điểm: {computer.location || "N/A"}</span>
                  </li>
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
                    <Label>Gói thuê</Label>
                    <Select value={rentalUnit} onValueChange={(v) => setRentalUnit(v as RentalUnit)}>
                      <SelectTrigger className="bg-input-background border-border h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hour">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Theo giờ
                          </div>
                        </SelectItem>
                        <SelectItem value="week">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Theo tuần
                          </div>
                        </SelectItem>
                        <SelectItem value="month">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Theo tháng
                          </div>
                        </SelectItem>
                        <SelectItem value="year">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Theo năm
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Số lượng</Label>
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                      className="bg-input-background border-border h-12"
                    />
                    <p className="text-xs text-muted-foreground">
                      {rentalUnit === "hour"
                        ? "Số giờ thuê"
                        : rentalUnit === "week"
                        ? "Số tuần thuê"
                        : rentalUnit === "month"
                        ? "Số tháng thuê"
                        : "Số năm thuê"}
                    </p>
                  </div>

                  {/* Price Display */}
                  <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Giá thuê</span>
                      <span className="text-sm text-muted-foreground">
                        {rentalUnit === "hour"
                          ? "/ giờ"
                          : rentalUnit === "week"
                          ? "/ tuần"
                          : rentalUnit === "month"
                          ? "/ tháng"
                          : "/ năm"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-primary" />
                      <span className="text-3xl font-bold text-primary">
                        {estimatedPrice().toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    {rentalUnit !== "hour" && !currentPlan && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Gói thuê này chưa có sẵn cho cấu hình này.
                      </p>
                    )}
                  </div>

                  {/* Pricing Info */}
                  <div className="space-y-2 text-sm p-4 bg-muted/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giá theo giờ:</span>
                      <span className="font-medium">
                        {Number(computer.hourlyPrice).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    {computer.plans?.map((p) => (
                      <div key={p.id} className="flex justify-between">
                        <span className="text-muted-foreground">{p.planName}:</span>
                        <span className="font-medium">{Number(p.price).toLocaleString("vi-VN")}đ</span>
                      </div>
                    ))}
                  </div>

                  {/* Rent Button */}
                  <Button
                    onClick={handleRent}
                    disabled={
                      isRenting ||
                      (rentalUnit !== "hour" && !currentPlan)
                    }
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50"
                  >
                    {isRenting ? "Đang xử lý..." : "Thuê Ngay"}
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
