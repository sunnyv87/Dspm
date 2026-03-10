"use client";

import { useEffect, useState } from "react";
import { retentionAPI } from "@/lib/api";
import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import type { RetentionPolicy } from "@/types";

export default function RetentionPage() {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      retentionAPI.policies().catch(() => ({ data: [] })),
      retentionAPI.stats().catch(() => ({ data: null })),
    ]).then(([policiesRes, statsRes]) => {
      setPolicies(Array.isArray(policiesRes.data) ? policiesRes.data : []);
      setStats(statsRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading retention policies...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Data Retention</h2>
        <p className="text-gray-500 mt-1">Manage data retention policies and lifecycle rules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Policies" value={stats?.totalPolicies ?? 0} color="blue" />
        <StatCard title="Active" value={(stats?.totalPolicies ?? 0) - (stats?.overdue ?? 0) - (stats?.expiringSoon ?? 0)} color="green" />
        <StatCard title="Expiring Soon" value={stats?.expiringSoon ?? 0} color="yellow" />
        <StatCard title="Overdue" value={stats?.overdue ?? 0} color="red" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold">Retention Policies</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Policy Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Data Category</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Retention Period</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Assets</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Next Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {policies.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No retention policies found</td></tr>
              ) : policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{policy.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{policy.data_category}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{policy.retention_period_days} days</td>
                  <td className="px-6 py-3"><StatusBadge status={policy.status} /></td>
                  <td className="px-6 py-3 text-sm text-gray-700">{policy.assets_count}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{policy.next_review ? new Date(policy.next_review).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
