import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ComputersPage } from "./pages/ComputersPage";
import { ComputerDetailPage } from "./pages/ComputerDetailPage";
import { AIChatPage } from "./pages/AIChatPage";
import { AccountPage } from "./pages/AccountPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EmailVerificationPage } from "./pages/EmailVerificationPage";
import { AccountInfo } from "./components/account/AccountInfo";
import { ChangePassword } from "./components/account/ChangePassword";
import { RentalHistory } from "./components/account/RentalHistory";
import { TopUp } from "./components/account/TopUp";
import { ComputerList } from "./components/dashboard/ComputerList";
import { AccountList } from "./components/dashboard/AccountList";
import { RevenueStats } from "./components/dashboard/RevenueStats";
import { OrderManagement } from "./components/dashboard/OrderManagement";
import { InvoiceManagement } from "./components/dashboard/InvoiceManagement";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AdminRoute } from "./auth/AdminRoute";
import { WalletCheckoutPage } from "./pages/WalletCheckoutPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/verify-email",
    Component: EmailVerificationPage,
  },
  {
    path: "/computers",
    element: (
      <AdminRoute>
        <ComputersPage />
      </AdminRoute>
    ),
  },
  {
    path: "/computers/:id",
    element: (
      <AdminRoute>
        <ComputerDetailPage />
      </AdminRoute>
    ),
  },
  {
    path: "/ai-chat",
    Component: AIChatPage,
  },
  {
    path: "/wallet",
    element: (
      <ProtectedRoute>
        <WalletCheckoutPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/account",
    element: (
      <ProtectedRoute>
        <AccountPage />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        Component: AccountInfo,
      },
      {
        path: "change-password",
        Component: ChangePassword,
      },
      {
        path: "rental-history",
        Component: RentalHistory,
      },
      {
        path: "top-up",
        Component: TopUp,
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <AdminRoute>
        <DashboardPage />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        Component: RevenueStats,
      },
      {
        path: "computers",
        Component: ComputerList,
      },
      {
        path: "orders",
        Component: OrderManagement,
      },
      {
        path: "invoices",
        Component: InvoiceManagement,
      },
      {
        path: "accounts",
        Component: AccountList,
      },
      {
        path: "revenue",
        Component: RevenueStats,
      },
    ],
  },
]);

