"use client";

import { useEffect, useState } from "react";
import { assetAPI } from "@/lib/api";
import StatusBadge from "@/components/common/StatusBadge";
import type { Asset } from "@/types";

type AssetView = "all" | "sensitive" | "exposed" | "stale" | "shadow" | "unowned";

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AssetView>("all");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const fetchAssets = async () => {
      try {
        let res;
        switch (view) {
          case "sensitive": res = await assetAPI.sensitive(); setAssets(res.data); break;
          case "exposed": res = await assetAPI.exposed(); setAssets(res.data); break;
          case "stale": res = await assetAPI.stale(); setAssets(res.data); break;
          case "shadow": res = await assetAPI.shadow(); setAssets(res.data); break;
          case "unowned": res = await assetAPI.unowned(); setAssets(res.data); break;
          default:
            res = await assetAPI.list({ page: 1, page_size: 50 });
            setAssets(res.data.items || []);
            setTotal(res.data.total || 0);
        }
      } catch { setAssets([]); }
      setLoading(false);
    };
    fetchAssets();
  }, [view]);

  const views: { id: AssetView; label: string }[] = [
    { id: "all", label: "All Assets" },
    { id: "sensitive", label: "Sensitive" },
    { id: "exposed", label: "Publicly Exposed" },
    { id: "stale", label: "Stale" },
    { id: "shadow", label: "Shadow Data" },
    { id: "unowned", label: "Unowned" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Asset Inventory</h2>
        <p className="text-gray-500 mt-1">Discovered data assets and their security posture</p>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 flex-wrap">
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === v.id ? "bg-primary-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Exposure</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sensitive Count</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Risk Score</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Region</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                  <p className="text-xs text-gray-400">{asset.path}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{asset.asset_type}</td>
                <td className="px-4 py-3"><StatusBadge status={asset.exposure_status} /></td>
                <td className="px-4 py-3 text-sm text-gray-600">{asset.sensitive_data_count}</td>
                <td className="px-4 py-3">
                  {asset.risk_score !== null ? (
                    <span className={`text-sm font-mono font-bold ${
                      asset.risk_score >= 80 ? "text-red-600" : asset.risk_score >= 60 ? "text-orange-600" : asset.risk_score >= 40 ? "text-yellow-600" : "text-green-600"
                    }`}>{asset.risk_score}</span>
                  ) : <span className="text-gray-400 text-sm">-</span>}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{asset.geo_region || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{asset.business_owner || asset.technical_owner || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {assets.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">No assets found for this view</div>
        )}
      </div>
    </div>
  );
}
