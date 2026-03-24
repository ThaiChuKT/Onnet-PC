import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ComputersPage } from "./pages/ComputersPage";
import { ComputerDetailPage } from "./pages/ComputerDetailPage";
import { AIChatPage } from "./pages/AIChatPage";
import { AccountPage } from "./pages/AccountPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AccountInfo } from "./components/account/AccountInfo";
import { ChangePassword } from "./components/account/ChangePassword";
import { RentalHistory } from "./components/account/RentalHistory";
import { TopUp } from "./components/account/TopUp";
import { ComputerList } from "./components/dashboard/ComputerList";
import { AccountList } from "./components/dashboard/AccountList";
import { RevenueStats } from "./components/dashboard/RevenueStats";
import { OrderManagement } from "./components/dashboard/OrderManagement";

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
    path: "/computers",
    Component: ComputersPage,
  },
  {
    path: "/computers/:id",
    Component: ComputerDetailPage,
  },
  {
    path: "/ai-chat",
    Component: AIChatPage,
  },
  {
    path: "/account",
    Component: AccountPage,
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
    Component: DashboardPage,
    children: [
      {
        index: true,
        Component: ComputerList,
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