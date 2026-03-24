import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar, Clock, Cpu, DollarSign } from "lucide-react";

const rentalHistory = [
  {
    id: "RPC001234",
    package: "Pro Gaming",
    date: "15/03/2026",
    duration: "3 ngày",
    price: "900.000đ",
    status: "completed",
    specs: "i7-13700K | RTX 4060 Ti | 32GB RAM",
  },
  {
    id: "RPC001189",
    package: "Ultra Gaming",
    date: "08/03/2026",
    duration: "1 ngày",
    price: "500.000đ",
    status: "completed",
    specs: "i9-13900K | RTX 4080 | 64GB RAM",
  },
  {
    id: "RPC001156",
    package: "Basic Gaming",
    date: "01/03/2026",
    duration: "5 ngày",
    price: "750.000đ",
    status: "completed",
    specs: "i5-12400F | GTX 1660 Super | 16GB RAM",
  },
  {
    id: "RPC001098",
    package: "Pro Gaming",
    date: "20/02/2026",
    duration: "1 tháng",
    price: "7.000.000đ",
    status: "completed",
    specs: "i7-13700K | RTX 4060 Ti | 32GB RAM",
  },
  {
    id: "RPC001045",
    package: "Pro Gaming",
    date: "10/02/2026",
    duration: "2 ngày",
    price: "600.000đ",
    status: "cancelled",
    specs: "i7-13700K | RTX 4060 Ti | 32GB RAM",
  },
];

const statusConfig = {
  completed: {
    label: "Hoàn thành",
    className: "bg-accent/20 text-accent border-accent/50",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function RentalHistory() {
  const totalSpent = rentalHistory
    .filter((item) => item.status === "completed")
    .reduce((sum, item) => sum + parseInt(item.price.replace(/\./g, "").replace("đ", "")), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Lịch Sử
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {" "}Thuê Máy
          </span>
        </h1>
        <p className="text-muted-foreground">
          Xem lại tất cả các lần thuê máy tính của bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
              <p className="text-2xl font-bold">{rentalHistory.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-3 rounded-lg">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-accent">
                {totalSpent.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/20 p-3 rounded-lg">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hoàn thành</p>
              <p className="text-2xl font-bold text-secondary">
                {rentalHistory.filter((item) => item.status === "completed").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {rentalHistory.map((rental) => (
          <Card
            key={rental.id}
            className="p-6 border-border hover:border-primary/50 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{rental.package}</h3>
                  <Badge className={statusConfig[rental.status as keyof typeof statusConfig].className}>
                    {statusConfig[rental.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  <span>{rental.specs}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Ngày thuê:</span>
                    <span className="font-medium">{rental.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Thời gian:</span>
                    <span className="font-medium">{rental.duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2">
                <div className="text-2xl font-bold text-primary">{rental.price}</div>
                <div className="text-xs text-muted-foreground">Mã: {rental.id}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State (if needed) */}
      {rentalHistory.length === 0 && (
        <Card className="p-12 border-border text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">Chưa có lịch sử thuê</h3>
          <p className="text-muted-foreground">
            Bạn chưa có đơn hàng nào. Hãy bắt đầu thuê máy tính ngay!
          </p>
        </Card>
      )}
    </div>
  );
}
