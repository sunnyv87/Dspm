"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import ConnectorsPage from "@/components/connectors/ConnectorsPage";
import AssetsPage from "@/components/assets/AssetsPage";
import AlertsPage from "@/components/alerts/AlertsPage";
import CompliancePage from "@/components/compliance/CompliancePage";
import LoginPage from "@/components/layout/LoginPage";
import { useAuthStore } from "@/lib/store";

type Page = "dashboard" | "connectors" | "assets" | "alerts" | "compliance";

export default function Home() {
  const { token } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  if (!token) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard": return <DashboardOverview />;
      case "connectors": return <ConnectorsPage />;
      case "assets": return <AssetsPage />;
      case "alerts": return <AlertsPage />;
      case "compliance": return <CompliancePage />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-auto p-6">{renderPage()}</main>
    </div>
  );
}
