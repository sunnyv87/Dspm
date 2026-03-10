"use client";

import { useEffect, useState } from "react";
import { reportAPI, riskAPI } from "@/lib/api";
import StatCard from "@/components/common/StatCard";
import type { ExecutiveSummary, RiskSummary } from "@/types";

export default function DashboardOverview() {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [riskSummary, setRiskSummary] = useState<RiskSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportAPI.executiveSummary().catch(() => ({ data: null })),
      riskAPI.summary().catch(() => ({ data: null })),
    ]).then(([summaryRes, riskRes]) => {
      setSummary(summaryRes.data);
      setRiskSummary(riskRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading dashboard...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Executive Dashboard</h2>
        <p className="text-gray-500 mt-1">Data security posture overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assets Scanned"
          value={summary?.total_assets_scanned ?? 0}
          color="blue"
        />
        <StatCard
          title="Sensitive Assets"
          value={summary?.sensitive_assets_count ?? 0}
          color="yellow"
        />
        <StatCard
          title="Critical Risk Assets"
          value={summary?.critical_risk_assets ?? 0}
          color="red"
        />
        <StatCard
          title="Publicly Exposed"
          value={summary?.publicly_exposed_sensitive ?? 0}
          color="red"
        />
      </div>

      {/* Risk Distribution */}
      {riskSummary && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-red-50">
              <p className="text-3xl font-bold text-red-600">{riskSummary.critical_count}</p>
              <p className="text-sm text-gray-500">Critical</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50">
              <p className="text-3xl font-bold text-orange-600">{riskSummary.high_count}</p>
              <p className="text-sm text-gray-500">High</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50">
              <p className="text-3xl font-bold text-yellow-600">{riskSummary.medium_count}</p>
              <p className="text-sm text-gray-500">Medium</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <p className="text-3xl font-bold text-green-600">{riskSummary.low_count}</p>
              <p className="text-sm text-gray-500">Low</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500">Average Risk Score: <span className="font-bold text-lg">{riskSummary.average_risk_score}</span>/100</p>
          </div>
        </div>
      )}

      {/* Top Risky Stores */}
      {summary?.top_risky_stores && summary.top_risky_stores.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Top Risky Data Stores</h3>
          <div className="space-y-3">
            {summary.top_risky_stores.map((store, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-700">{store.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${store.risk_score >= 80 ? "bg-red-500" : store.risk_score >= 60 ? "bg-orange-500" : "bg-yellow-500"}`}
                      style={{ width: `${store.risk_score}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-gray-600 w-12 text-right">{store.risk_score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts by Severity */}
      {summary?.alerts_by_severity && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Open Alerts by Severity</h3>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(summary.alerts_by_severity).map(([severity, count]) => (
              <div key={severity} className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-gray-500 capitalize">{severity}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
