"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import ConnectorsPage from "@/components/connectors/ConnectorsPage";
import AssetsPage from "@/components/assets/AssetsPage";
import AlertsPage from "@/components/alerts/AlertsPage";
import CompliancePage from "@/components/compliance/CompliancePage";
import AIAssistantPage from "@/components/ai/AIAssistantPage";
import ConsentPage from "@/components/privacy/ConsentPage";
import DSARPage from "@/components/privacy/DSARPage";
import BreachPage from "@/components/privacy/BreachPage";
import VendorRiskPage from "@/components/privacy/VendorRiskPage";
import RetentionPage from "@/components/privacy/RetentionPage";
import WorkflowPage from "@/components/privacy/WorkflowPage";
import PrivacyAuditPage from "@/components/privacy/PrivacyAuditPage";
import LoginPage from "@/components/layout/LoginPage";
import { useAuthStore } from "@/lib/store";

type Page =
  | "dashboard"
  | "connectors"
  | "assets"
  | "alerts"
  | "compliance"
  | "ai-assistant"
  | "consent"
  | "dsar"
  | "breach"
  | "vendor-risk"
  | "retention"
  | "workflows"
  | "privacy-audit";

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
      case "ai-assistant": return <AIAssistantPage />;
      case "consent": return <ConsentPage />;
      case "dsar": return <DSARPage />;
      case "breach": return <BreachPage />;
      case "vendor-risk": return <VendorRiskPage />;
      case "retention": return <RetentionPage />;
      case "workflows": return <WorkflowPage />;
      case "privacy-audit": return <PrivacyAuditPage />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-auto p-6 bg-gray-50">{renderPage()}</main>
    </div>
  );
}
