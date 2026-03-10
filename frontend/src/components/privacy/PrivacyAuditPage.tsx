"use client";

import { useEffect, useState } from "react";
import { privacyAuditAPI } from "@/lib/api";
import type { AuditEntry } from "@/types";

export default function PrivacyAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    privacyAuditAPI.entries({ limit: 50, sort: "desc" }).then((res) => {
      setEntries(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    }).catch(() => {
      setEntries([]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading audit trail...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Audit Trail</h2>
        <p className="text-gray-500 mt-1">Comprehensive log of all privacy operations and actions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <span className="text-sm text-gray-400">{entries.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actor</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Resource</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No audit entries found</td></tr>
              ) : entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">{entry.action}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">{entry.actor}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{entry.resource_type}/{entry.resource_id?.slice(0, 8)}</td>
                  <td className="px-6 py-3 text-sm text-gray-500 truncate max-w-xs">{entry.details ?? "—"}</td>
                  <td className="px-6 py-3 text-sm font-mono text-gray-400">{entry.ip_address ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
