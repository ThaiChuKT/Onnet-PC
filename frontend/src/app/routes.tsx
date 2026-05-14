import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { PackagesPage } from "./pages/PackagesPage";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { PackageFoldersPage } from "./pages/PackageFoldersPage";
import { ComputerDetailPage } from "./pages/ComputerDetailPage";
import { PackagePricingPage } from "./pages/PackagePricingPage";
import { PackageDetailsPage } from "./pages/PackageDetailsPage.tsx";
import { AIChatPage } from "./pages/AIChatPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { AccountPage } from "./pages/AccountPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EmailVerificationPage } from "./pages/EmailVerificationPage";
import { FAQPage } from "./pages/FAQPage";
import { AdminFAQPage } from "./pages/AdminFAQPage";
import { AccountInfo } from "./components/account/AccountInfo";
import { ChangePassword } from "./components/account/ChangePassword";
import { RentalHistory } from "./components/account/RentalHistory";
import { TopUp } from "./components/account/TopUp";
import { TopUpBills } from "./components/account/TopUpBills";
import { Mypcs } from "./components/account/Mypcs.tsx";
import { ComputerList } from "./components/dashboard/ComputerList";
import { AccountList } from "./components/dashboard/AccountList";
import { RevenueStats } from "./components/dashboard/RevenueStats";
import { OrderManagement } from "./components/dashboard/OrderManagement";
import { InvoiceManagement } from "./components/dashboard/InvoiceManagement";
import { SessionManagement } from "./components/dashboard/SessionManagement";
import { SunshineManagement } from "./components/dashboard/SunshineManagement";
import { AccountDetailPage } from "./pages/AccountDetailPage";
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
    path: "/forgot-password",
    Component: ForgotPasswordPage,
  },
  {
    path: "/reset-password",
    Component: ResetPasswordPage,
  },
  {
    path: "/verify-email",
    Component: EmailVerificationPage,
  },
  {
    path: "/computers",
    element: (
      <AdminRoute>
        <PackageFoldersPage />
      </AdminRoute>
    ),
  },
  {
    path: "/packages",
    Component: PackagesPage,
  },
  {
    path: "/packages/:tier",
    Component: PackageDetailsPage,
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
    path: "/checkout",
    element: (
      <ProtectedRoute>
        <CheckoutPage />
      </ProtectedRoute>
    ),
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
    path: "/faq-admin",
    element: (
      <AdminRoute>
        <AdminFAQPage />
      </AdminRoute>
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
        path: "transactions",
        Component: RentalHistory,
      },
      {
        path: "rental-history",
        Component: RentalHistory,
      },
      {
        path: "top-up",
        Component: TopUp,
      },
      {
        path: "top-up-bills",
        Component: TopUpBills,
      },
      {
        path: "mypcs",
        Component: Mypcs,
      },
    ],
  },
  {
    path: "/faq",
    Component: FAQPage,
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
        path: "accounts/:id",
        Component: AccountDetailPage,
      },
      {
        path: "revenue",
        Component: RevenueStats,
      },
      {
        path: "sessions",
        Component: SessionManagement,
      },
      {
        path: "sunshine",
        Component: SunshineManagement,
      },
      {
        path: "packages/:tier/edit",
        Component: PackagePricingPage,
      },
    ],
  },
]);
