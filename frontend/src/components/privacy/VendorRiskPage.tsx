"use client";

import { useEffect, useState } from "react";
import { vendorRiskAPI } from "@/lib/api";
import StatCard from "@/components/common/StatCard";
import SeverityBadge from "@/components/common/SeverityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import type { Vendor } from "@/types";

export default function VendorRiskPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      vendorRiskAPI.list().catch(() => ({ data: [] })),
      vendorRiskAPI.stats().catch(() => ({ data: null })),
    ]).then(([vendorsRes, statsRes]) => {
      setVendors(Array.isArray(vendorsRes.data) ? vendorsRes.data : []);
      setStats(statsRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading vendor data...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Vendor Risk Management</h2>
        <p className="text-gray-500 mt-1">Assess and monitor third-party vendor data processing risks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Vendors" value={stats?.totalVendors ?? 0} color="blue" />
        <StatCard title="High Risk" value={stats?.highRiskVendors ?? 0} color="red" />
        <StatCard title="Assessments Due" value={stats?.assessmentsDue ?? 0} color="yellow" />
        <StatCard title="Compliant" value={(stats?.totalVendors ?? 0) - (stats?.highRiskVendors ?? 0)} color="green" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold">Vendor Registry</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Compliance</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Data Types</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Next Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No vendors found</td></tr>
              ) : vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{vendor.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{vendor.category}</td>
                  <td className="px-6 py-3"><SeverityBadge severity={vendor.risk_level} /></td>
                  <td className="px-6 py-3"><StatusBadge status={vendor.compliance_status} /></td>
                  <td className="px-6 py-3 text-sm text-gray-500">{vendor.data_types_shared?.join(", ") || "—"}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{vendor.next_assessment_date ? new Date(vendor.next_assessment_date).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
