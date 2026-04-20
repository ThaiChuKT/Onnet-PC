import { Card } from "../ui/card";
import { TrendingUp, DollarSign, Calendar, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatUsd, formatUsdCompact } from "../../lib/formatUsd";
import { apiGet } from "../../api/http";
import { toast } from "sonner";

type AdminBookingItemResponse = {
  bookingId: number;
  userEmail: string;
  specName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
};

type AdminUserPaymentItemResponse = {
  transactionId: number;
  amount: number;
  createdAt: string;
};

type PageResponse<T> = {
  content: T[];
};

type MonthSeed = {
  key: string;
  month: string;
};

type RevenueMonth = {
  month: string;
  key: string;
  revenue: number;
  orders: number;
  customers: number;
};

const PAID_BOOKING_STATUSES = new Set(["active", "completed"]);

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function createRecentMonths(count: number): MonthSeed[] {
  const now = new Date();
  const seeds: MonthSeed[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.toLocaleDateString("vi-VN", { month: "short" }).replace("thg", "T").replace(" ", "");
    seeds.push({ key: getMonthKey(d), month });
  }
  return seeds;
}

export function RevenueStats() {
  const [monthWindow, setMonthWindow] = useState("12");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [bookings, setBookings] = useState<AdminBookingItemResponse[]>([]);
  const [topUps, setTopUps] = useState<AdminUserPaymentItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [bookingPage, topUpPage] = await Promise.all([
          apiGet<PageResponse<AdminBookingItemResponse>>("/admin/bookings", { page: 0, size: 500 }),
          apiGet<PageResponse<AdminUserPaymentItemResponse>>("/admin/payments/topups", { page: 0, size: 500 }),
        ]);
        setBookings(bookingPage.content ?? []);
        setTopUps(topUpPage.content ?? []);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not load revenue data");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const filteredMonthlyData = useMemo<RevenueMonth[]>(() => {
    const len = Math.max(1, Number(monthWindow) || 12);
    const monthSeeds = createRecentMonths(len);
    const monthIndex = new Map(monthSeeds.map((seed) => [seed.key, seed]));
    const revenueByMonth = new Map<string, number>();
    const ordersByMonth = new Map<string, number>();
    const customersByMonth = new Map<string, Set<string>>();

    bookings
      .filter((item) => PAID_BOOKING_STATUSES.has((item.status ?? "").toLowerCase()))
      .forEach((item) => {
        if (!item.createdAt) return;
        const createdAt = new Date(item.createdAt);
        if (Number.isNaN(createdAt.getTime())) return;
        const key = getMonthKey(createdAt);
        if (!monthIndex.has(key)) return;

        revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + Number(item.totalPrice ?? 0));
        ordersByMonth.set(key, (ordersByMonth.get(key) ?? 0) + 1);

        const customerSet = customersByMonth.get(key) ?? new Set<string>();
        if (item.userEmail) {
          customerSet.add(item.userEmail.toLowerCase());
        }
        customersByMonth.set(key, customerSet);
      });

    topUps.forEach((item) => {
      if (!item.createdAt) return;
      const createdAt = new Date(item.createdAt);
      if (Number.isNaN(createdAt.getTime())) return;
      const key = getMonthKey(createdAt);
      if (!monthIndex.has(key)) return;
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + Number(item.amount ?? 0));
    });

    return monthSeeds.map((seed) => ({
      month: seed.month,
      key: seed.key,
      revenue: revenueByMonth.get(seed.key) ?? 0,
      orders: ordersByMonth.get(seed.key) ?? 0,
      customers: (customersByMonth.get(seed.key) ?? new Set<string>()).size,
    }));
  }, [bookings, monthWindow, topUps]);

  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();

    bookings
      .filter((item) => PAID_BOOKING_STATUSES.has((item.status ?? "").toLowerCase()))
      .forEach((item) => {
        const key = (item.specName ?? "Unknown").trim() || "Unknown";
        categoryMap.set(key, (categoryMap.get(key) ?? 0) + Number(item.totalPrice ?? 0));
      });

    const total = Array.from(categoryMap.values()).reduce((sum, value) => sum + value, 0);

    return Array.from(categoryMap.entries())
      .map(([name, revenue]) => ({
        name,
        revenue,
        percentage: total > 0 ? (revenue / total) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [bookings]);

  const filteredCategoryData = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return categoryData;
    return categoryData.filter((cat) => cat.name.toLowerCase().includes(q));
  }, [categoryQuery]);

  const currentYear = new Date().getFullYear();
  const totalRevenue = filteredMonthlyData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = filteredMonthlyData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalCustomers = filteredMonthlyData.reduce((sum, item) => sum + item.customers, 0);
  const currentMonth =
    filteredMonthlyData[filteredMonthlyData.length - 1] ?? {
      month: "T0",
      key: "",
      revenue: 0,
      orders: 0,
      customers: 0,
    };
  const previousMonth =
    filteredMonthlyData[filteredMonthlyData.length - 2] ??
    filteredMonthlyData[filteredMonthlyData.length - 1] ?? {
      month: "T0",
      key: "",
      revenue: 0,
      orders: 0,
      customers: 0,
    };
  const growthRate =
    previousMonth.revenue > 0
      ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
      : 0;

  const selectedCategoryRevenue = filteredCategoryData.reduce((sum, cat) => sum + cat.revenue, 0);

  return (
    <div>
      {isLoading && (
        <Card className="p-6 border-border mb-6">
          <p className="text-muted-foreground">Đang tải dữ liệu doanh thu...</p>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-3 mb-6">
        <Select value={monthWindow} onValueChange={setMonthWindow}>
          <SelectTrigger className="bg-input-background border-border">
            <SelectValue placeholder="Khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12 tháng gần nhất</SelectItem>
            <SelectItem value="6">6 tháng gần nhất</SelectItem>
            <SelectItem value="3">3 tháng gần nhất</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={categoryQuery}
          onChange={(e) => setCategoryQuery(e.target.value)}
          placeholder="Lọc phân khúc theo tên..."
          className="bg-input-background border-border"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6 border-border bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-primary/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Tổng Doanh Thu {currentYear}
          </p>
          <p className="text-3xl font-bold text-primary mb-1">
            {formatUsd(totalRevenue)}
          </p>
          <p className="text-xs text-accent">
            +{growthRate.toFixed(1)}% so với tháng trước
          </p>
        </Card>

        <Card className="p-6 border-border bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-accent/20 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Tổng Đơn Hàng</p>
          <p className="text-3xl font-bold mb-1">{totalOrders}</p>
          <p className="text-xs text-muted-foreground">
            Trung bình {(totalOrders / Math.max(filteredMonthlyData.length, 1)).toFixed(0)} đơn/tháng
          </p>
        </Card>

        <Card className="p-6 border-border bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-secondary/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-secondary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Giá Trị TB/Đơn</p>
          <p className="text-3xl font-bold text-secondary mb-1">
            {formatUsd(avgOrderValue)}
          </p>
          <p className="text-xs text-muted-foreground">
            Doanh thu trung bình mỗi đơn
          </p>
        </Card>

        <Card className="p-6 border-border bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-primary/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Khách Hàng (tổng theo tháng)</p>
          <p className="text-3xl font-bold mb-1">{totalCustomers}</p>
          <p className="text-xs text-muted-foreground">
            Tháng hiện tại: {currentMonth.customers} khách hàng
          </p>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="p-6 border-border mb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            Biểu Đồ
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {" "}
              Doanh Thu Năm {currentYear}
            </span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Theo dõi doanh thu theo từng tháng từ đơn hàng đã thanh toán và top-up ví
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={filteredMonthlyData}
            id="revenue-chart"
            key="revenue-line-chart"
          >
            <CartesianGrid
              key="revenue-grid"
              strokeDasharray="3 3"
              stroke="#333"
              opacity={0.3}
            />
            <XAxis
              key="revenue-xaxis"
              dataKey="month"
              stroke="#888"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              key="revenue-yaxis"
              stroke="#888"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => formatUsdCompact(Number(value))}
            />
            <Tooltip
              key="revenue-tooltip"
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #444",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: unknown) => [
                formatUsd(Number(value ?? 0)),
                "Doanh thu",
              ]}
            />
            <Legend key="revenue-legend" wrapperStyle={{ color: "#fff" }} />
            <Line
              key="revenue-line"
              type="monotone"
              dataKey="revenue"
              name="Doanh thu"
              stroke="#ff6b35"
              strokeWidth={3}
              dot={{ fill: "#ff6b35", r: 4 }}
              activeDot={{ r: 6, fill: "#ff4500" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Orders Chart */}
      <Card className="p-6 border-border mb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            Biểu Đồ
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {" "}
              Đơn Hàng & Khách Hàng
            </span>
          </h2>
          <p className="text-muted-foreground text-sm">
            So sánh số lượng đơn hàng và khách hàng theo tháng
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={filteredMonthlyData} id="orders-chart" key="orders-bar-chart">
            <CartesianGrid
              key="orders-grid"
              strokeDasharray="3 3"
              stroke="#333"
              opacity={0.3}
            />
            <XAxis
              key="orders-xaxis"
              dataKey="month"
              stroke="#888"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              key="orders-yaxis"
              stroke="#888"
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              key="orders-tooltip"
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #444",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: unknown, name: string) => [Number(value ?? 0), name]}
            />
            <Legend key="orders-legend" wrapperStyle={{ color: "#fff" }} />
            <Bar
              key="orders-bar"
              dataKey="orders"
              name="Đơn hàng"
              fill="#ff6b35"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              key="customers-bar"
              dataKey="customers"
              name="Khách hàng"
              fill="#4ade80"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Category Revenue */}
      <Card className="p-6 border-border">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            Doanh Thu
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {" "}
              Theo Phân Khúc
            </span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Phân tích doanh thu theo từng loại máy
          </p>
        </div>

        <div className="space-y-4">
          {filteredCategoryData.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {category.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatUsd(category.revenue)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, category.percentage)}%` }}
                />
              </div>
            </div>
          ))}

          {filteredCategoryData.length === 0 && (
            <p className="text-sm text-muted-foreground">Không có phân khúc phù hợp với bộ lọc.</p>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Tổng doanh thu phân khúc:
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatUsd(selectedCategoryRevenue)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
