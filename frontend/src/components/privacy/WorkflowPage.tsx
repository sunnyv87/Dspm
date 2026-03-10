"use client";

import { useEffect, useState } from "react";
import { workflowAPI } from "@/lib/api";
import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import type { WorkflowInstance } from "@/types";

export default function WorkflowPage() {
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workflowAPI.list().then((res) => {
      setWorkflows(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    }).catch(() => {
      setWorkflows([]);
      setLoading(false);
    });
  }, []);

  const pending = workflows.filter((w) => w.status === "pending").length;
  const approved = workflows.filter((w) => w.status === "approved" || w.status === "completed").length;
  const rejected = workflows.filter((w) => w.status === "rejected").length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading workflows...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Workflows & Approvals</h2>
        <p className="text-gray-500 mt-1">Manage approval workflows for privacy operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Workflows" value={workflows.length} color="blue" />
        <StatCard title="Pending Approval" value={pending} color="yellow" />
        <StatCard title="Approved" value={approved} color="green" />
        <StatCard title="Rejected" value={rejected} color="red" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold">Workflow Instances</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Template</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Initiated By</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workflows.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No workflows found</td></tr>
              ) : workflows.map((wf) => (
                <tr key={wf.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{wf.template_name}</td>
                  <td className="px-6 py-3"><StatusBadge status={wf.status} /></td>
                  <td className="px-6 py-3 text-sm text-gray-700">{wf.initiated_by}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{wf.assigned_to ?? "Unassigned"}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{new Date(wf.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-sm text-gray-500 truncate max-w-xs">{wf.context ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
