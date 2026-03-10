"use client";

import { useEffect, useState } from "react";
import { connectorAPI } from "@/lib/api";
import StatusBadge from "@/components/common/StatusBadge";
import type { Connector } from "@/types";

const CONNECTOR_TYPES = [
  { value: "aws_s3", label: "AWS S3" },
  { value: "azure_blob", label: "Azure Blob Storage" },
  { value: "gcs", label: "Google Cloud Storage" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "mssql", label: "MS SQL Server" },
  { value: "mongodb", label: "MongoDB" },
  { value: "snowflake", label: "Snowflake" },
  { value: "bigquery", label: "BigQuery" },
  { value: "microsoft_365", label: "Microsoft 365" },
  { value: "google_workspace", label: "Google Workspace" },
  { value: "slack", label: "Slack" },
  { value: "jira", label: "Jira" },
  { value: "salesforce", label: "Salesforce" },
];

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    connectorAPI.list().then((res) => {
      setConnectors(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Source Connectors</h2>
          <p className="text-gray-500 mt-1">Manage connections to cloud, databases, SaaS, and on-prem data sources</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm font-medium"
        >
          + Add Connector
        </button>
      </div>

      {/* Connector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((conn) => (
          <div key={conn.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{conn.name}</h3>
              <StatusBadge status={conn.status} />
            </div>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Type: <span className="text-gray-700">{conn.connector_type.replace(/_/g, " ")}</span></p>
              <p>Last sync: <span className="text-gray-700">{conn.last_sync_at ? new Date(conn.last_sync_at).toLocaleString() : "Never"}</span></p>
              {conn.last_error && <p className="text-danger-500 text-xs">Error: {conn.last_error}</p>}
            </div>
            <div className="flex gap-2 mt-4">
              <button className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100">Scan Now</button>
              <button className="text-xs px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100">Configure</button>
            </div>
          </div>
        ))}
      </div>

      {connectors.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 text-lg">No connectors configured</p>
          <p className="text-gray-400 text-sm mt-2">Add a data source connector to start discovering sensitive data</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Add Your First Connector
          </button>
        </div>
      )}

      {/* Supported Connectors Reference */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Supported Data Sources</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CONNECTOR_TYPES.map((ct) => (
            <div key={ct.value} className="text-sm p-2 bg-gray-50 rounded-lg text-gray-700 text-center">
              {ct.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
