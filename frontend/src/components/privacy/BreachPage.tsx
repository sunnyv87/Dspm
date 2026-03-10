"use client";

import { useEffect, useState } from "react";
import { breachAPI } from "@/lib/api";
import StatCard from "@/components/common/StatCard";
import SeverityBadge from "@/components/common/SeverityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import type { BreachIncident } from "@/types";

export default function BreachPage() {
  const [incidents, setIncidents] = useState<BreachIncident[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      breachAPI.list().catch(() => ({ data: [] })),
      breachAPI.stats().catch(() => ({ data: null })),
    ]).then(([incidentsRes, statsRes]) => {
      setIncidents(Array.isArray(incidentsRes.data) ? incidentsRes.data : []);
      setStats(statsRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading breach incidents...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Breach Monitoring</h2>
        <p className="text-gray-500 mt-1">Track and respond to data breach incidents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Breaches" value={stats?.totalBreaches ?? 0} color="blue" />
        <StatCard title="Open" value={stats?.openBreaches ?? 0} color="red" />
        <StatCard title="Resolved" value={stats?.resolvedBreaches ?? 0} color="green" />
        <StatCard title="Under Investigation" value={(stats?.totalBreaches ?? 0) - (stats?.openBreaches ?? 0) - (stats?.resolvedBreaches ?? 0)} color="yellow" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold">Breach Incidents</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Affected Records</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Detected</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Reported</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {incidents.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No breach incidents found</td></tr>
              ) : incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{incident.title}</td>
                  <td className="px-6 py-3"><SeverityBadge severity={incident.severity} /></td>
                  <td className="px-6 py-3"><StatusBadge status={incident.status} /></td>
                  <td className="px-6 py-3 text-sm text-gray-700">{incident.affected_records?.toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{new Date(incident.detected_at).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{incident.reported_at ? new Date(incident.reported_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
