"use client";

import { useEffect, useState } from "react";
import { policyAPI } from "@/lib/api";
import SeverityBadge from "@/components/common/SeverityBadge";
import type { PolicyViolation } from "@/types";

export default function CompliancePage() {
  const [coverage, setCoverage] = useState<Record<string, any>>({});
  const [violations, setViolations] = useState<PolicyViolation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      policyAPI.complianceCoverage().catch(() => ({ data: {} })),
      policyAPI.violations().catch(() => ({ data: [] })),
    ]).then(([coverageRes, violationsRes]) => {
      setCoverage(coverageRes.data || {});
      setViolations(violationsRes.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Compliance Posture</h2>
        <p className="text-gray-500 mt-1">Policy compliance and regulatory framework coverage</p>
      </div>

      {/* Framework Coverage */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(coverage).map(([name, data]: [string, any]) => (
          <div key={name} className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">{name}</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Compliance</span>
              <span className={`text-lg font-bold ${data.compliance_pct >= 90 ? "text-green-600" : data.compliance_pct >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                {data.compliance_pct}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className={`h-2 rounded-full ${data.compliance_pct >= 90 ? "bg-green-500" : data.compliance_pct >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${data.compliance_pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{data.total_rules} rules</span>
              <span>{data.open_violations} violations</span>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(coverage).length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-400">
          No compliance frameworks configured. Built-in policies will be seeded on first scan.
        </div>
      )}

      {/* Violations */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Policy Violations ({violations.length})</h3>
        <div className="space-y-3">
          {violations.map((v) => (
            <div key={v.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={v.severity} />
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{v.status}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{v.description}</p>
              </div>
              <span className="text-xs text-gray-400">{new Date(v.detected_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
        {violations.length === 0 && <p className="text-gray-400 text-center py-4">No violations detected</p>}
      </div>

      {/* Supported Frameworks */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Supported Frameworks</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {["ISO 27001", "SOC 2", "PCI DSS", "GDPR", "HIPAA", "DPDPA", "RBI", "SEBI", "IRDAI"].map((fw) => (
            <div key={fw} className="text-center p-3 bg-gray-50 rounded-lg text-sm text-gray-700 font-medium">
              {fw}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
