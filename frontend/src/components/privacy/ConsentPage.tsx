"use client";

import { useEffect, useState } from "react";
import { consentAPI } from "@/lib/api";
import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import type { ConsentRecord } from "@/types";

export default function ConsentPage() {
  const [records, setRecords] = useState<ConsentRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      consentAPI.list().catch(() => ({ data: [] })),
      consentAPI.stats().catch(() => ({ data: null })),
    ]).then(([recordsRes, statsRes]) => {
      setRecords(Array.isArray(recordsRes.data) ? recordsRes.data : []);
      setStats(statsRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading consent records...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Consent Management</h2>
        <p className="text-gray-500 mt-1">Track and manage data subject consent records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Consents" value={stats?.totalConsents ?? 0} color="blue" />
        <StatCard title="Active" value={stats?.activeConsents ?? 0} color="green" />
        <StatCard title="Expired" value={stats?.expiredConsents ?? 0} color="yellow" />
        <StatCard title="Revoked" value={(stats?.totalConsents ?? 0) - (stats?.activeConsents ?? 0) - (stats?.expiredConsents ?? 0)} color="red" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold">Consent Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Subject ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Legal Basis</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Granted</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No consent records found</td></tr>
              ) : records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-mono text-gray-700">{record.data_subject_id?.slice(0, 8)}...</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{record.purpose}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{record.legal_basis}</td>
                  <td className="px-6 py-3"><StatusBadge status={record.status} /></td>
                  <td className="px-6 py-3 text-sm text-gray-500">{new Date(record.granted_at).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{record.expires_at ? new Date(record.expires_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
