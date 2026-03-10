"use client";

import { useEffect, useState } from "react";
import { alertAPI } from "@/lib/api";
import SeverityBadge from "@/components/common/SeverityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import type { Alert } from "@/types";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    alertAPI.list({
      severity: severityFilter || undefined,
      alert_status: statusFilter || undefined,
      page: 1, page_size: 50,
    }).then((res) => {
      setAlerts(res.data.items || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [severityFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Security Alerts</h2>
        <p className="text-gray-500 mt-1">Alerts and remediation workflow</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="accepted_risk">Accepted Risk</option>
        </select>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <SeverityBadge severity={alert.severity} />
                  <StatusBadge status={alert.status} />
                  <span className="text-xs text-gray-400">{alert.alert_type.replace(/_/g, " ")}</span>
                </div>
                <h3 className="font-medium text-gray-900">{alert.title}</h3>
                {alert.description && <p className="text-sm text-gray-500 mt-1">{alert.description}</p>}
                {alert.remediation_recommendation && (
                  <p className="text-sm text-primary-600 mt-2">
                    Recommendation: {alert.remediation_recommendation}
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-gray-400">
                <p>{new Date(alert.created_at).toLocaleDateString()}</p>
                {alert.assigned_to && <p className="mt-1">Assigned</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No alerts found</p>
        </div>
      )}
    </div>
  );
}
