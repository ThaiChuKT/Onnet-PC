import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ShoppingCart, Eye, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  computerName: string;
  computerId: string;
  package: string;
  duration: string;
  price: number;
  status: "pending" | "active" | "completed" | "cancelled";
  orderDate: string;
  startDate: string;
  endDate: string;
}

const initialOrders: Order[] = [
  {
    id: "ORD001",
    customerName: "Nguyễn Văn A",
    customerEmail: "nguyenvana@gmail.com",
    computerName: "Basic Gaming #1",
    computerId: "PC001",
    package: "Basic",
    duration: "30 ngày",
    price: 2500000,
    status: "active",
    orderDate: "01/03/2026",
    startDate: "01/03/2026",
    endDate: "31/03/2026",
  },
  {
    id: "ORD002",
    customerName: "Trần Thị B",
    customerEmail: "tranthib@gmail.com",
    computerName: "Pro Gaming #1",
    computerId: "PC003",
    package: "Pro",
    duration: "15 ngày",
    price: 3000000,
    status: "active",
    orderDate: "05/03/2026",
    startDate: "05/03/2026",
    endDate: "20/03/2026",
  },
  {
    id: "ORD003",
    customerName: "Lê Văn C",
    customerEmail: "levanc@gmail.com",
    computerName: "Ultra Gaming #1",
    computerId: "PC005",
    package: "Ultra",
    duration: "7 ngày",
    price: 2100000,
    status: "pending",
    orderDate: "10/03/2026",
    startDate: "15/03/2026",
    endDate: "22/03/2026",
  },
  {
    id: "ORD004",
    customerName: "Phạm Thị D",
    customerEmail: "phamthid@gmail.com",
    computerName: "Basic Gaming #2",
    computerId: "PC002",
    package: "Basic",
    duration: "30 ngày",
    price: 2500000,
    status: "completed",
    orderDate: "01/02/2026",
    startDate: "01/02/2026",
    endDate: "03/03/2026",
  },
  {
    id: "ORD005",
    customerName: "Hoàng Văn E",
    customerEmail: "hoangvane@gmail.com",
    computerName: "Pro Gaming #2",
    computerId: "PC004",
    package: "Pro",
    duration: "7 ngày",
    price: 1400000,
    status: "cancelled",
    orderDate: "12/03/2026",
    startDate: "12/03/2026",
    endDate: "19/03/2026",
  },
];

const statusConfig = {
  pending: {
    label: "Chờ xử lý",
    className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
    icon: Clock,
  },
  active: {
    label: "Đang hoạt động",
    className: "bg-accent/20 text-accent border-accent/50",
    icon: CheckCircle,
  },
  completed: {
    label: "Hoàn thành",
    className: "bg-blue-500/20 text-blue-500 border-blue-500/50",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-destructive/20 text-destructive border-destructive/50",
    icon: XCircle,
  },
};

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setSelectedOrder(null);
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    active: orders.filter((o) => o.status === "active").length,
    completed: orders.filter((o) => o.status === "completed").length,
    totalRevenue: orders
      .filter((o) => o.status === "completed" || o.status === "active")
      .reduce((sum, o) => sum + o.price, 0),
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng đơn</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chờ xử lý</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>
              <p className="text-2xl font-bold text-accent">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hoàn thành</p>
              <p className="text-2xl font-bold text-blue-500">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Doanh thu</p>
              <p className="text-lg font-bold text-primary">
                {(stats.totalRevenue / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const StatusIcon = statusConfig[order.status].icon;
          return (
            <Card
              key={order.id}
              className="p-6 border-border hover:border-primary/50 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold">{order.id}</h3>
                    <Badge className={statusConfig[order.status].className}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[order.status].label}
                    </Badge>
                    <Badge className="bg-primary/20 text-primary border-primary/50">
                      {order.package}
                    </Badge>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Khách hàng:</span>{" "}
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      <span className="font-medium">{order.customerEmail}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Máy:</span>{" "}
                      <span className="font-medium">{order.computerName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Thời gian:</span>{" "}
                      <span className="font-medium">{order.duration}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Giá:</span>{" "}
                      <span className="font-bold text-primary">
                        {order.price.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ngày đặt:</span>{" "}
                      <span className="font-medium">{order.orderDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog
                    open={selectedOrder?.id === order.id}
                    onOpenChange={(open) => !open && setSelectedOrder(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="border-primary text-foreground hover:bg-primary/10"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Chi tiết
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Chi Tiết Đơn Hàng</DialogTitle>
                      </DialogHeader>
                      {selectedOrder && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">Mã đơn</p>
                              <p className="font-bold">{selectedOrder.id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Trạng thái</p>
                              <Badge className={statusConfig[selectedOrder.status].className}>
                                {statusConfig[selectedOrder.status].label}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-bold">Thông tin khách hàng</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground">Tên</p>
                                <p className="font-medium">{selectedOrder.customerName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium">{selectedOrder.customerEmail}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-bold">Chi tiết dịch vụ</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground">Máy</p>
                                <p className="font-medium">{selectedOrder.computerName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Mã máy</p>
                                <p className="font-medium">{selectedOrder.computerId}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Gói</p>
                                <p className="font-medium">{selectedOrder.package}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Thời gian thuê</p>
                                <p className="font-medium">{selectedOrder.duration}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Ngày bắt đầu</p>
                                <p className="font-medium">{selectedOrder.startDate}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Ngày kết thúc</p>
                                <p className="font-medium">{selectedOrder.endDate}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-primary/10 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Tổng tiền:</span>
                              <span className="text-2xl font-bold text-primary">
                                {selectedOrder.price.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                          </div>

                          {selectedOrder.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleStatusChange(selectedOrder.id, "active")}
                                className="flex-1 bg-accent hover:bg-accent/90"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Xác nhận đơn
                              </Button>
                              <Button
                                onClick={() => handleStatusChange(selectedOrder.id, "cancelled")}
                                variant="outline"
                                className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Hủy đơn
                              </Button>
                            </div>
                          )}

                          {selectedOrder.status === "active" && (
                            <Button
                              onClick={() => handleStatusChange(selectedOrder.id, "completed")}
                              className="w-full bg-blue-500 hover:bg-blue-600"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Hoàn thành đơn
                            </Button>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {orders.length === 0 && (
        <Card className="p-12 border-border text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-muted-foreground">
            Đơn hàng từ khách hàng sẽ hiển thị ở đây
          </p>
        </Card>
      )}
    </div>
  );
}
