"use client";

import { useEffect, useState } from "react";
import { dsarAPI } from "@/lib/api";
import StatCard from "@/components/common/StatCard";
import SeverityBadge from "@/components/common/SeverityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import type { DSARRequest } from "@/types";

export default function DSARPage() {
  const [requests, setRequests] = useState<DSARRequest[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dsarAPI.list().catch(() => ({ data: [] })),
      dsarAPI.stats().catch(() => ({ data: null })),
    ]).then(([requestsRes, statsRes]) => {
      setRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
      setStats(statsRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading DSAR requests...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Data Subject Rights (DSAR)</h2>
        <p className="text-gray-500 mt-1">Manage data subject access, deletion, and portability requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Requests" value={stats?.totalRequests ?? 0} color="blue" />
        <StatCard title="Pending" value={stats?.pendingRequests ?? 0} color="yellow" />
        <StatCard title="Completed" value={stats?.completedRequests ?? 0} color="green" />
        <StatCard title="Overdue" value={stats?.overdueRequests ?? 0} color="red" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold">DSAR Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Requester</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No DSAR requests found</td></tr>
              ) : requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-mono text-gray-700">{req.id.slice(0, 8)}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 capitalize">{req.request_type}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">{req.data_subject_email}</td>
                  <td className="px-6 py-3"><StatusBadge status={req.status} /></td>
                  <td className="px-6 py-3 text-sm text-gray-500">{new Date(req.submitted_at).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{new Date(req.due_date).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{req.assigned_to ?? "Unassigned"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
