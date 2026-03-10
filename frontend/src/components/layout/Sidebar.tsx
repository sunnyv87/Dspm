"use client";

import { useAuthStore } from "@/lib/store";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: any) => void;
}

interface NavSection {
  title: string;
  items: { id: string; label: string; icon: string }[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { id: "dashboard", label: "Unified Dashboard", icon: "grid" },
    ],
  },
  {
    title: "Data Security (DSPM)",
    items: [
      { id: "connectors", label: "Connectors", icon: "plug" },
      { id: "assets", label: "Asset Inventory", icon: "database" },
      { id: "alerts", label: "Alerts", icon: "bell" },
      { id: "compliance", label: "Compliance", icon: "shield" },
    ],
  },
  {
    title: "Privacy Operations",
    items: [
      { id: "consent", label: "Consent Management", icon: "check-circle" },
      { id: "dsar", label: "Data Subject Rights", icon: "user-check" },
      { id: "breach", label: "Breach Monitoring", icon: "alert-triangle" },
      { id: "vendor-risk", label: "Vendor Risk", icon: "vendor" },
      { id: "retention", label: "Data Retention", icon: "clock" },
      { id: "workflows", label: "Workflows", icon: "workflow" },
      { id: "privacy-audit", label: "Audit Trail", icon: "audit" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { id: "ai-assistant", label: "AI Assistant", icon: "sparkles" },
    ],
  },
];

const iconMap: Record<string, string> = {
  grid: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
  plug: "M13 10V3L4 14h7v7l9-11h-7z",
  database: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
  bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  sparkles: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z",
  "check-circle": "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  "user-check": "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2m8-4a4 4 0 100-8 4 4 0 000 8zm11 2l-3 3-1.5-1.5",
  "alert-triangle": "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  vendor: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  workflow: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  audit: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01",
};

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { logout } = useAuthStore();

  return (
    <div className="w-64 bg-primary-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-primary-700">
        <h1 className="text-xl font-bold">TechD Platform</h1>
        <p className="text-primary-100 text-xs mt-1">DSPM + PrivacyOps</p>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-300">
              {section.title}
            </p>
            <div className="mt-1 space-y-0.5">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentPage === item.id
                      ? "bg-primary-700 text-white"
                      : "text-primary-100 hover:bg-primary-700/50"
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconMap[item.icon] || iconMap.grid} />
                  </svg>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-700">
        <button
          onClick={logout}
          className="w-full text-left text-primary-100 hover:text-white text-sm px-3 py-2"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
