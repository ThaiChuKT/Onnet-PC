import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { apiGet } from "../api/http";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { ListPagination } from "../components/dashboard/ListPagination";
import { formatUsd } from "../lib/formatUsd";
import type { ReactNode } from "react";

type AdminUserItemResponse = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  verified: boolean;
  subscriptionBookingId?: number | null;
  subscriptionSpecName?: string | null;
  subscriptionEndTime?: string | null;
  activePcId?: number | null;
  activePcLocation?: string | null;
};

type AdminBookingItemResponse = {
  bookingId: number;
  userId: number | null;
  userFullName: string | null;
  userEmail: string;
  specName: string;
  pcId: number | null;
  bookingType: string;
  totalHours: number | null;
  startTime: string;
  endTime: string | null;
  totalPrice: number;
  status: string;
  createdAt: string;
  planName?: string | null;
  durationDays?: number | null;
};

type AdminUserPaymentItemResponse = {
  transactionId: number;
  userId: number | null;
  userEmail: string;
  userFullName: string;
  amount: number;
  type: string;
  note: string;
  createdAt: string;
};

const pageSize = 4;

export function AccountDetailPage() {
  const { id } = useParams();
  const userId = Number(id);
  const [user, setUser] = useState<AdminUserItemResponse | null>(null);
  const [orders, setOrders] = useState<AdminBookingItemResponse[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminBookingItemResponse[]>([]);
  const [invoices, setInvoices] = useState<AdminUserPaymentItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersPage, setOrdersPage] = useState(0);
  const [subscriptionsPage, setSubscriptionsPage] = useState(0);
  const [invoicesPage, setInvoicesPage] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(userId)) {
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const [userResponse, ordersResponse, subscriptionsResponse, invoicesResponse] = await Promise.all([
          apiGet<AdminUserItemResponse>(`/admin/users/${userId}`),
          apiGet<AdminBookingItemResponse[]>(`/admin/users/${userId}/orders`),
          apiGet<AdminBookingItemResponse[]>(`/admin/users/${userId}/bookings`),
          apiGet<AdminUserPaymentItemResponse[]>(`/admin/users/${userId}/payments`),
        ]);
        setUser(userResponse);
        setOrders(ordersResponse ?? []);
        setSubscriptions(subscriptionsResponse ?? []);
        setInvoices(invoicesResponse ?? []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not load account detail");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [userId]);

  const orderPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const subscriptionPages = Math.max(1, Math.ceil(subscriptions.length / pageSize));
  const invoicePages = Math.max(1, Math.ceil(invoices.length / pageSize));

  const visibleOrders = useMemo(() => orders.slice(ordersPage * pageSize, ordersPage * pageSize + pageSize), [orders, ordersPage]);
  const visibleSubscriptions = useMemo(() => subscriptions.slice(subscriptionsPage * pageSize, subscriptionsPage * pageSize + pageSize), [subscriptions, subscriptionsPage]);
  const visibleInvoices = useMemo(() => invoices.slice(invoicesPage * pageSize, invoicesPage * pageSize + pageSize), [invoices, invoicesPage]);

  useEffect(() => {
    setOrdersPage(0);
    setSubscriptionsPage(0);
    setInvoicesPage(0);
  }, [userId]);

  if (loading) {
    return (
      <Card className="p-8 border-border text-center">
        <p className="text-muted-foreground">Loading account detail...</p>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="p-8 border-border text-center">
        <p className="font-medium">Account not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Admin account view</p>
            <h2 className="text-3xl font-bold">{user.fullName}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={user.active ? "bg-accent/20 text-accent border-accent/50" : "bg-muted text-muted-foreground border-border"}>{user.active ? "Active" : "Inactive"}</Badge>
            <Badge className={user.verified ? "bg-blue-500/20 text-blue-500 border-blue-500/50" : "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"}>{user.verified ? "Verified" : "Unverified"}</Badge>
            {user.subscriptionSpecName && <Badge className="bg-primary/20 text-primary border-primary/40">{user.subscriptionSpecName}</Badge>}
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-muted-foreground">User ID</p>
            <p className="font-semibold">{user.id}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-muted-foreground">Phone</p>
            <p className="font-semibold">{user.phone || "-"}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-muted-foreground">Current subscription</p>
            <p className="font-semibold">{user.subscriptionSpecName || "None"}</p>
          </div>
        </div>
      </Card>

      <SectionCard title="Orders" count={orders.length}>
        <div className="space-y-3">
          {visibleOrders.map((order) => (
            <Card key={order.bookingId} className="border-border p-4">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold">#{order.bookingId} - {order.bookingType}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.userFullName ? <Link to={`/dashboard/accounts/${order.userId ?? user.id}`} className="text-primary hover:underline">{order.userFullName}</Link> : user.fullName} • {order.userEmail}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.planName || order.specName}</p>
                </div>
                <div className="text-sm lg:text-right">
                  <p className="font-semibold text-money">{formatUsd(Number(order.totalPrice ?? 0))}</p>
                  <p className="text-muted-foreground">{order.status}</p>
                </div>
              </div>
            </Card>
          ))}
          <ListPagination page={ordersPage} totalPages={orderPages} onPageChange={setOrdersPage} />
        </div>
      </SectionCard>

      <SectionCard title="Invoices" count={invoices.length}>
        <div className="space-y-3">
          {visibleInvoices.map((invoice) => (
            <Card key={invoice.transactionId} className="border-border p-4">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold">Top-up #{invoice.transactionId}</p>
                  <p className="text-sm text-muted-foreground">
                    <Link to={`/dashboard/accounts/${invoice.userId ?? user.id}`} className="text-primary hover:underline">{invoice.userFullName || user.fullName}</Link> • {invoice.userEmail}
                  </p>
                  <p className="text-sm text-muted-foreground">{invoice.note || invoice.type}</p>
                </div>
                <div className="text-sm lg:text-right">
                  <p className="font-semibold text-money">{formatUsd(Number(invoice.amount ?? 0))}</p>
                  <p className="text-muted-foreground">{new Date(invoice.createdAt).toLocaleString("en-US")}</p>
                </div>
              </div>
            </Card>
          ))}
          <ListPagination page={invoicesPage} totalPages={invoicePages} onPageChange={setInvoicesPage} />
        </div>
      </SectionCard>

      <SectionCard title="Subscription packages" count={subscriptions.length}>
        <div className="space-y-3">
          {visibleSubscriptions.map((booking) => (
            <Card key={booking.bookingId} className="border-border p-4">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold">{booking.planName || booking.specName}</p>
                  <p className="text-sm text-muted-foreground">Booking #{booking.bookingId}</p>
                  <p className="text-sm text-muted-foreground">{booking.durationDays ? `${booking.durationDays} days` : "Custom duration"}</p>
                </div>
                <div className="text-sm lg:text-right">
                  <p className="font-semibold text-money">{formatUsd(Number(booking.totalPrice ?? 0))}</p>
                  <p className="text-muted-foreground">{booking.status}</p>
                </div>
              </div>
            </Card>
          ))}
          <ListPagination page={subscriptionsPage} totalPages={subscriptionPages} onPageChange={setSubscriptionsPage} />
        </div>
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <Card className="border-border p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">{count} items</p>
        </div>
      </div>
      {children}
    </Card>
  );
}
