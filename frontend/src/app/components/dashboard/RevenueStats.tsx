import { Card } from "../ui/card";
import { TrendingUp, DollarSign, Calendar, Users } from "lucide-react";
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

const monthlyData = [
  { month: "T1", revenue: 45000000, orders: 35, customers: 28 },
  { month: "T2", revenue: 52000000, orders: 42, customers: 35 },
  { month: "T3", revenue: 48000000, orders: 38, customers: 32 },
  { month: "T4", revenue: 61000000, orders: 48, customers: 40 },
  { month: "T5", revenue: 58000000, orders: 45, customers: 38 },
  { month: "T6", revenue: 67000000, orders: 52, customers: 45 },
  { month: "T7", revenue: 72000000, orders: 58, customers: 50 },
  { month: "T8", revenue: 69000000, orders: 55, customers: 48 },
  { month: "T9", revenue: 75000000, orders: 60, customers: 52 },
  { month: "T10", revenue: 82000000, orders: 65, customers: 58 },
  { month: "T11", revenue: 78000000, orders: 62, customers: 55 },
  { month: "T12", revenue: 88000000, orders: 70, customers: 62 },
];

const categoryData = [
  { name: "Basic Gaming", revenue: 180000000, percentage: 25 },
  { name: "Pro Gaming", revenue: 360000000, percentage: 50 },
  { name: "Ultra Gaming", revenue: 180000000, percentage: 25 },
];

export function RevenueStats() {
  const currentYear = 2026;
  const totalRevenue = monthlyData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = monthlyData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalRevenue / totalOrders;
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const growthRate =
    ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) *
    100;

  return (
    <div>
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
            {(totalRevenue / 1000000).toFixed(0)}M đ
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
            Trung bình {(totalOrders / 12).toFixed(0)} đơn/tháng
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
            {(avgOrderValue / 1000).toFixed(0)}K đ
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
          <p className="text-sm text-muted-foreground mb-1">Khách Hàng</p>
          <p className="text-3xl font-bold mb-1">{currentMonth.customers}</p>
          <p className="text-xs text-muted-foreground">
            Tháng {monthlyData.length} năm {currentYear}
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
            Theo dõi doanh thu và số đơn hàng theo từng tháng
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={monthlyData}
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
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            />
            <Tooltip
              key="revenue-tooltip"
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #444",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: any) => [
                `${Number(value ?? 0).toLocaleString("vi-VN")}đ`,
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
          <BarChart data={monthlyData} id="orders-chart" key="orders-bar-chart">
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
          {categoryData.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {category.percentage}%
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {category.revenue.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Tổng doanh thu phân khúc:
            </span>
            <span className="text-2xl font-bold text-primary">
              {categoryData
                .reduce((sum, cat) => sum + cat.revenue, 0)
                .toLocaleString("vi-VN")}
              đ
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
