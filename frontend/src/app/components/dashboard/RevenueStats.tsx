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
import { Link } from "react-router";

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

type DetailMode = "topup" | "bookingRevenue" | "bookingOrders";

const PAID_BOOKING_STATUSES = new Set(["paid", "expired", "completed"]);

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function createRecentMonths(count: number): MonthSeed[] {
  const now = new Date();
  const seeds: MonthSeed[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.toLocaleDateString("en-US", { month: "short" });
    seeds.push({ key: getMonthKey(d), month });
  }
  return seeds;
}

export function RevenueStats() {
  const [monthWindow, setMonthWindow] = useState("12");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [categoryRevenueMin, setCategoryRevenueMin] = useState("");
  const [categoryRevenueMax, setCategoryRevenueMax] = useState("");
  const [categoryUsersMin, setCategoryUsersMin] = useState("");
  const [categoryUsersMax, setCategoryUsersMax] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookings, setBookings] = useState<AdminBookingItemResponse[]>([]);
  const [topUps, setTopUps] = useState<AdminUserPaymentItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);
  const [selectedMonthLabel, setSelectedMonthLabel] = useState<string>("");
  const [detailMode, setDetailMode] = useState<DetailMode>("topup");

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
        // Use console.log instead of console.debug so logs are visible with default DevTools filters.
        console.log("RevenueStats: bookings loaded", bookingPage.content?.length, bookingPage.content?.slice(0, 3));
        console.log("RevenueStats: topUps loaded", topUpPage.content?.length, topUpPage.content?.slice(0, 3));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not load revenue data");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const dateRangeStart = useMemo(() => {
    if (!startDate) return null;
    const d = new Date(startDate);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }, [startDate]);

  const dateRangeEnd = useMemo(() => {
    if (!endDate) return null;
    const d = new Date(endDate);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(23, 59, 59, 999);
    return d;
  }, [endDate]);

  const monthSeeds = useMemo(() => {
    if (dateRangeStart || dateRangeEnd) {
      const start = dateRangeStart || new Date(1970, 0, 1);
      const end = dateRangeEnd || new Date();
      const seeds: MonthSeed[] = [];
      const current = new Date(start.getFullYear(), start.getMonth(), 1);
      while (current <= end) {
        const month = current.toLocaleDateString("en-US", { month: "short" });
        seeds.push({ key: getMonthKey(current), month });
        current.setMonth(current.getMonth() + 1);
      }
      return seeds;
    }
    const len = Math.max(1, Number(monthWindow) || 12);
    return createRecentMonths(len);
  }, [dateRangeStart, dateRangeEnd, monthWindow]);

  const bookingMonthlyData = useMemo<RevenueMonth[]>(() => {
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
        if (dateRangeStart && createdAt < dateRangeStart) return;
        if (dateRangeEnd && createdAt > dateRangeEnd) return;

        const key = getMonthKey(createdAt);
        if (!monthIndex.has(key)) return;

        revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + Number(item.totalPrice ?? 0));
        ordersByMonth.set(key, (ordersByMonth.get(key) ?? 0) + 1);

        const customerSet = customersByMonth.get(key) ?? new Set<string>();
        if (item.userEmail) customerSet.add(item.userEmail.toLowerCase());
        customersByMonth.set(key, customerSet);
      });

    return monthSeeds.map((seed) => ({
      month: seed.month,
      key: seed.key,
      revenue: revenueByMonth.get(seed.key) ?? 0,
      orders: ordersByMonth.get(seed.key) ?? 0,
      customers: (customersByMonth.get(seed.key) ?? new Set<string>()).size,
    }));
  }, [bookings, monthSeeds, dateRangeStart, dateRangeEnd]);

  const topUpMonthlyData = useMemo(() => {
    const monthIndex = new Map(monthSeeds.map((seed) => [seed.key, seed]));
    const revenueByMonth = new Map<string, number>();

    topUps.forEach((item) => {
      if (!item.createdAt) return;
      const createdAt = new Date(item.createdAt);
      if (Number.isNaN(createdAt.getTime())) return;
      if (dateRangeStart && createdAt < dateRangeStart) return;
      if (dateRangeEnd && createdAt > dateRangeEnd) return;

      const key = getMonthKey(createdAt);
      if (!monthIndex.has(key)) return;
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + Number(item.amount ?? 0));
    });

    return monthSeeds.map((seed) => ({
      month: seed.month,
      key: seed.key,
      revenue: revenueByMonth.get(seed.key) ?? 0,
    }));
  }, [topUps, monthSeeds, dateRangeStart, dateRangeEnd]);

  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, { revenue: number; users: Set<string>; count: number }>();
    const monthIndex = new Map(monthSeeds.map((seed) => [seed.key, seed]));

    bookings
      .filter((item) => PAID_BOOKING_STATUSES.has((item.status ?? "").toLowerCase()))
      .forEach((item) => {
        if (!item.createdAt) return;
        const createdAt = new Date(item.createdAt);
        if (Number.isNaN(createdAt.getTime())) return;
        if (dateRangeStart && createdAt < dateRangeStart) return;
        if (dateRangeEnd && createdAt > dateRangeEnd) return;
        const keyByMonth = getMonthKey(createdAt);
        if (!monthIndex.has(keyByMonth)) return;

        const key = (item.specName ?? "Unknown").trim() || "Unknown";
        const current = categoryMap.get(key) ?? { revenue: 0, users: new Set<string>(), count: 0 };
        current.revenue += Number(item.totalPrice ?? 0);
        current.count += 1;
        if (item.userEmail) current.users.add(item.userEmail.toLowerCase());
        categoryMap.set(key, current);
      });

    const total = Array.from(categoryMap.values()).reduce((sum, value) => sum + value.revenue, 0);

    const result = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        percentage: total > 0 ? (data.revenue / total) * 100 : 0,
        users: data.users.size,
        count: data.count,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    console.log("RevenueStats categoryData:", {
      categoryMap: Object.fromEntries(categoryMap.entries()),
      result,
      total,
      bookingsCount: bookings.length,
    });

    return result;
  }, [bookings, monthSeeds, dateRangeStart, dateRangeEnd]);

  const filteredCategoryData = useMemo(() => {
    let result = categoryData;
    
    // Filter by name
    const q = categoryQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((cat) => cat.name.toLowerCase().includes(q));
    }

    // Filter by revenue range
    if (categoryRevenueMin || categoryRevenueMax) {
      const min = categoryRevenueMin ? Number(categoryRevenueMin) : 0;
      const max = categoryRevenueMax ? Number(categoryRevenueMax) : Infinity;
      result = result.filter((cat) => cat.revenue >= min && cat.revenue <= max);
    }

    // Filter by users range
    if (categoryUsersMin || categoryUsersMax) {
      const min = categoryUsersMin ? Number(categoryUsersMin) : 0;
      const max = categoryUsersMax ? Number(categoryUsersMax) : Infinity;
      result = result.filter((cat) => cat.users >= min && cat.users <= max);
    }

    return result;
  }, [categoryData, categoryQuery, categoryRevenueMin, categoryRevenueMax, categoryUsersMin, categoryUsersMax]);

  const topUpRevenue = topUpMonthlyData.reduce((sum, item) => sum + item.revenue, 0);
  const bookingRevenue = bookingMonthlyData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = bookingMonthlyData.reduce((sum, item) => sum + item.orders, 0);
  const totalCustomers = bookingMonthlyData.reduce((sum, item) => sum + item.customers, 0);
  const currentMonth =
    bookingMonthlyData[bookingMonthlyData.length - 1] ?? {
      month: "M0",
      key: "",
      revenue: 0,
      orders: 0,
      customers: 0,
    };
  const previousMonth =
    topUpMonthlyData[topUpMonthlyData.length - 2] ??
    topUpMonthlyData[topUpMonthlyData.length - 1] ?? {
      month: "M0",
      key: "",
      revenue: 0,
    };
  const currentTopUpMonth =
    topUpMonthlyData[topUpMonthlyData.length - 1] ?? {
      month: "T0",
      key: "",
      revenue: 0,
    };
  const growthRate =
    previousMonth.revenue > 0
      ? ((currentTopUpMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
      : 0;

  const selectedCategoryRevenue = filteredCategoryData.reduce((sum, cat) => sum + cat.revenue, 0);

  const selectedMonthBookingDetails = useMemo(() => {
    if (!selectedMonthKey) return [];
    return bookings
      .filter((item) => PAID_BOOKING_STATUSES.has((item.status ?? "").toLowerCase()))
      .filter((item) => {
        if (!item.createdAt) return false;
        const createdAt = new Date(item.createdAt);
        if (Number.isNaN(createdAt.getTime())) return false;
        return getMonthKey(createdAt) === selectedMonthKey;
      })
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }, [bookings, selectedMonthKey]);

  const selectedMonthTopUpDetails = useMemo(() => {
    if (!selectedMonthKey) return [];
    return topUps
      .filter((item) => {
        if (!item.createdAt) return false;
        const createdAt = new Date(item.createdAt);
        if (Number.isNaN(createdAt.getTime())) return false;
        return getMonthKey(createdAt) === selectedMonthKey;
      })
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }, [topUps, selectedMonthKey]);

  const openMonthDetails = (payload: { key?: string; month?: string } | undefined, mode: DetailMode) => {
    if (!payload?.key) return;
    setSelectedMonthKey(payload.key);
    setSelectedMonthLabel(payload.month ?? payload.key);
    setDetailMode(mode);
  };

  const makeClickableDot = (mode: DetailMode, fill: string) => (props: any) => {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null) return null;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={fill}
        stroke="none"
        style={{ cursor: "pointer" }}
        onClick={(event) => {
          event.stopPropagation();
          openMonthDetails(payload, mode);
        }}
      />
    );
  };

  const makeClickableBarShape = (mode: DetailMode, fill: string) => (props: any) => {
    const { x, y, width, height, payload } = props;
    if (x == null || y == null || width == null || height == null) return null;
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill={fill}
        style={{ cursor: "pointer" }}
        onClick={(event) => {
          event.stopPropagation();
          openMonthDetails(payload, mode);
        }}
      />
    );
  };

  const clearDetails = () => {
    setSelectedMonthKey(null);
    setSelectedMonthLabel("");
  };

  const formatDateTime = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("en-US");
  };

  useEffect(() => {
    console.log("RevenueStats: aggregates", {
      bookingsCount: bookings.length,
      topUpsCount: topUps.length,
      paidStatuses: Array.from(PAID_BOOKING_STATUSES),
      topUpRevenue,
      bookingRevenue,
      totalOrders,
      totalCustomers,
      startDate,
      endDate,
      monthWindow,
    });
  }, [bookings.length, topUps.length, topUpRevenue, bookingRevenue, totalOrders, totalCustomers, startDate, endDate, monthWindow]);

  return (
    <div>
      {isLoading && (
        <Card className="p-6 border-border mb-6">
          <p className="text-muted-foreground">Loading revenue data...</p>
        </Card>
      )}

      <div className="grid md:grid-cols-4 gap-3 mb-6">
        <Select value={monthWindow} onValueChange={setMonthWindow} disabled={!!startDate || !!endDate}>
          <SelectTrigger className="bg-input-background border-border">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">Last 12 months</SelectItem>
            <SelectItem value="6">Last 6 months</SelectItem>
            <SelectItem value="3">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="From date"
          className="bg-input-background border-border"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="To date"
          className="bg-input-background border-border"
        />
        <Input
          value={categoryQuery}
          onChange={(e) => setCategoryQuery(e.target.value)}
          placeholder="Filter segments by name..."
          className="bg-input-background border-border"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link to="/dashboard/invoices">
          <Card className="p-6 border-border bg-gradient-to-br from-primary/10 to-accent/10 cursor-pointer hover:shadow-lg hover:shadow-primary/25 transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-primary/20 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Wallet top-up revenue
            </p>
            <p className="text-3xl font-bold text-primary mb-1">
              {formatUsd(topUpRevenue)}
            </p>
            <p className="text-xs text-accent">
              +{growthRate.toFixed(1)}% top up compared with last month
            </p>
          </Card>
        </Link>

        <Link to="/dashboard/orders">
          <Card className="p-6 border-border bg-card/50 cursor-pointer hover:shadow-lg hover:shadow-accent/25 transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-accent/20 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
            <p className="text-3xl font-bold mb-1">{totalOrders}</p>
            <p className="text-xs text-muted-foreground">
              Average {(totalOrders / Math.max(bookingMonthlyData.length, 1)).toFixed(0)} orders/month
            </p>
          </Card>
        </Link>

        <Link to="/dashboard/orders">
          <Card className="p-6 border-border bg-card/50 cursor-pointer hover:shadow-lg hover:shadow-secondary/25 transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-secondary/20 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Machine booking revenue</p>
            <p className="text-3xl font-bold text-secondary mb-1">
              {formatUsd(bookingRevenue)}
            </p>
            <p className="text-xs text-muted-foreground">
              Total revenue from machine rentals, excluding wallet top-ups
            </p>
          </Card>
        </Link>

        <Link to="/dashboard/accounts">
          <Card className="p-6 border-border bg-card/50 cursor-pointer hover:shadow-lg hover:shadow-primary/25 transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-primary/20 p-3 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Customers</p>
            <p className="text-3xl font-bold mb-1">{totalCustomers}</p>
            <p className="text-xs text-muted-foreground">
              Current month: {currentMonth.customers} customers
            </p>
          </Card>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6 border-border">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              Chart
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {" "}
                Top Up
              </span>
            </h2>
            <p className="text-muted-foreground text-sm">
              Track top-up revenue by month
            </p>
            <p className="text-xs text-muted-foreground mt-1">Click a chart point to view month details.</p>
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={topUpMonthlyData} id="topup-chart" key="topup-line-chart">
              <CartesianGrid
                key="topup-grid"
                strokeDasharray="3 3"
                stroke="#333"
                opacity={0.3}
              />
              <XAxis
                key="topup-xaxis"
                dataKey="month"
                stroke="#888"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                key="topup-yaxis"
                stroke="#888"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => formatUsdCompact(Number(value))}
              />
              <Tooltip
                key="topup-tooltip"
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #444",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: unknown) => [
                  formatUsd(Number(value ?? 0)),
                  "Top up",
                ]}
              />
              <Legend key="topup-legend" wrapperStyle={{ color: "#fff" }} />
              <Line
                key="topup-line"
                type="monotone"
                dataKey="revenue"
                name="Top up"
                stroke="#ff6b35"
                strokeWidth={3}
                dot={makeClickableDot("topup", "#ff6b35")}
                activeDot={{ r: 6, fill: "#ff4500" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border-border">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              Chart
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {" "}
                Booking
              </span>
            </h2>
            <p className="text-muted-foreground text-sm">
              Track booking revenue by month
            </p>
            <p className="text-xs text-muted-foreground mt-1">Click a chart point to view month details.</p>
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={bookingMonthlyData} id="booking-chart" key="booking-line-chart">
              <CartesianGrid
                key="booking-grid"
                strokeDasharray="3 3"
                stroke="#333"
                opacity={0.3}
              />
              <XAxis
                key="booking-xaxis"
                dataKey="month"
                stroke="#888"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                key="booking-yaxis"
                stroke="#888"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => formatUsdCompact(Number(value))}
              />
              <Tooltip
                key="booking-tooltip"
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #444",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: unknown) => [
                  formatUsd(Number(value ?? 0)),
                  "Booking",
                ]}
              />
              <Legend key="booking-legend" wrapperStyle={{ color: "#fff" }} />
              <Line
                key="booking-line"
                type="monotone"
                dataKey="revenue"
                name="Booking"
                stroke="#4ade80"
                strokeWidth={3}
                dot={makeClickableDot("bookingRevenue", "#4ade80")}
                activeDot={{ r: 6, fill: "#22c55e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Orders Chart */}
      <Card className="p-6 border-border mb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            Chart
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {" "}
              Orders & Customers
            </span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Compare order and customer counts by month
          </p>
          <p className="text-xs text-muted-foreground mt-1">Click a bar to view booking details for the month.</p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={bookingMonthlyData} id="orders-chart" key="orders-bar-chart">
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
                 formatter={(value: unknown) => [Number(value ?? 0)]}
            />
            <Legend key="orders-legend" wrapperStyle={{ color: "#fff" }} />
            <Bar
              key="orders-bar"
              dataKey="orders"
              name="Orders"
              fill="#ff6b35"
              shape={makeClickableBarShape("bookingOrders", "#ff6b35")}
              radius={[8, 8, 0, 0]}
            />
            <Bar
              key="customers-bar"
              dataKey="customers"
              name="Customers"
              fill="#4ade80"
              shape={makeClickableBarShape("bookingOrders", "#4ade80")}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {selectedMonthKey && (
        <Card className="p-6 border-border mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xl font-bold">Details for {selectedMonthLabel}</h3>
              <p className="text-sm text-muted-foreground">
                {detailMode === "topup" && "Top-up transaction list"}
                {detailMode === "bookingRevenue" && "Bookings by revenue"}
                {detailMode === "bookingOrders" && "Bookings from the orders chart"}
              </p>
            </div>
            <button
              type="button"
              onClick={clearDetails}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Close details
            </button>
          </div>

          {detailMode === "topup" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transactions: {selectedMonthTopUpDetails.length}</span>
                <Link to="/dashboard/invoices" className="text-sm text-primary hover:underline">
                  View full list in Invoices
                </Link>
              </div>
              {selectedMonthTopUpDetails.length === 0 ? (
                <p className="text-sm text-muted-foreground">No top-up transactions this month.</p>
              ) : (
                <div className="space-y-2">
                  {selectedMonthTopUpDetails.slice(0, 20).map((item) => (
                    <div key={item.transactionId} className="border border-border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">Top up #{item.transactionId}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                      </div>
                      <p className="font-semibold text-primary">{formatUsd(Number(item.amount ?? 0))}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bookings: {selectedMonthBookingDetails.length}</span>
                <Link to="/dashboard/orders" className="text-sm text-primary hover:underline">
                  View full list in Orders
                </Link>
              </div>
              {selectedMonthBookingDetails.length === 0 ? (
                <p className="text-sm text-muted-foreground">No matching bookings this month.</p>
              ) : (
                <div className="space-y-2">
                  {selectedMonthBookingDetails.slice(0, 20).map((item) => (
                    <div key={item.bookingId} className="border border-border rounded-lg p-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">Booking #{item.bookingId} - {item.userEmail || "(no email)"}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.specName || "Unknown spec"} | {String(item.status || "").toUpperCase()} | {formatDateTime(item.createdAt)}
                        </p>
                      </div>
                      <p className="font-semibold text-secondary">{formatUsd(Number(item.totalPrice ?? 0))}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Category Revenue */}
      <Card className="p-6 border-border mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              Revenue
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {" "}
                By Segment
              </span>
            </h2>
            <p className="text-muted-foreground text-sm">
              Analyze revenue by machine type
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-3 mb-6">
            <Input
              value={categoryQuery}
              onChange={(e) => setCategoryQuery(e.target.value)}
              placeholder="Search segments..."
              className="bg-input-background border-border"
            />
            <Input
              type="number"
              value={categoryRevenueMin}
              onChange={(e) => setCategoryRevenueMin(e.target.value)}
              placeholder="Minimum revenue..."
              className="bg-input-background border-border"
            />
            <Input
              type="number"
              value={categoryRevenueMax}
              onChange={(e) => setCategoryRevenueMax(e.target.value)}
              placeholder="Maximum revenue..."
              className="bg-input-background border-border"
            />
            <button
              type="button"
              onClick={() => {
                setCategoryQuery("");
                setCategoryRevenueMin("");
                setCategoryRevenueMax("");
                setCategoryUsersMin("");
                setCategoryUsersMax("");
              }}
              className="px-4 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-md transition-colors text-sm"
            >
              Clear filters
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-6">
            <Input
              type="number"
              value={categoryUsersMin}
              onChange={(e) => setCategoryUsersMin(e.target.value)}
              placeholder="Minimum customers..."
              className="bg-input-background border-border"
            />
            <Input
              type="number"
              value={categoryUsersMax}
              onChange={(e) => setCategoryUsersMax(e.target.value)}
              placeholder="Maximum customers..."
              className="bg-input-background border-border"
            />
          </div>

          <div className="space-y-4">
            {filteredCategoryData.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {category.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatUsd(category.revenue)} • {category.users} customers • {category.count} orders
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
              <p className="text-sm text-muted-foreground">No segments match the filters.</p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Total segment revenue:
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
