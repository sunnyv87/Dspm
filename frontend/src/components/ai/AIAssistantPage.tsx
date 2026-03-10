"use client";

import { useState, useRef, useEffect } from "react";
import { aiQueryAPI } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  data?: any;
  intent?: string;
  confidence?: number;
  suggestions?: string[];
  timestamp: Date;
}

interface SuggestionCategory {
  label: string;
  queries: string[];
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionCategory[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSuggestions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSuggestions = async () => {
    try {
      const res = await aiQueryAPI.suggestions();
      setSuggestions(res.data.categories || []);
    } catch {
      setSuggestions([
        {
          label: "Getting Started",
          queries: [
            "What is our overall security posture?",
            "Show me all critical alerts",
            "Are any sensitive assets publicly exposed?",
          ],
        },
      ]);
    }
  };

  const sendQuery = async (query: string) => {
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: query.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await aiQueryAPI.query(query.trim());
      const d = res.data;
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: d.narrative || d.data?.narrative || "No results found.",
        data: d.data,
        intent: d.intent,
        confidence: d.confidence,
        suggestions: d.suggestions,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          err.response?.data?.detail ||
          "An error occurred while processing your query. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  const handleSuggestionClick = (query: string) => {
    sendQuery(query);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            AI Security Assistant
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ask questions about your security posture in plain English. All processing stays on-premise.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Data stays local
        </span>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
        {messages.length === 0 ? (
          <WelcomeScreen
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onSuggestionClick={handleSuggestionClick}
            />
          ))
        )}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4 mt-auto">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your security posture... (e.g., 'Show me critical alerts')"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              "Ask"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function WelcomeScreen({
  suggestions,
  onSuggestionClick,
}: {
  suggestions: SuggestionCategory[];
  onSuggestionClick: (q: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Ask me anything about your security posture
      </h2>
      <p className="text-gray-500 text-sm mb-8 text-center max-w-lg">
        I can answer questions about risk, alerts, compliance, data exposure, identity access, and more.
        All data is processed locally within your infrastructure — nothing leaves your cloud.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {suggestions.map((cat) => (
          <div key={cat.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{cat.label}</h3>
            <div className="space-y-2">
              {cat.queries.map((q) => (
                <button
                  key={q}
                  onClick={() => onSuggestionClick(q)}
                  className="w-full text-left text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-3 py-2 rounded-lg transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatMessage({
  message,
  onSuggestionClick,
}: {
  message: Message;
  onSuggestionClick: (q: string) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-3xl rounded-2xl px-5 py-3.5 ${
          isUser
            ? "bg-primary-600 text-white"
            : "bg-white border border-gray-200 text-gray-900"
        }`}
      >
        {/* Main narrative */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          <FormattedText text={message.content} isUser={isUser} />
        </div>

        {/* Data tables for assistant messages */}
        {!isUser && message.data && (
          <div className="mt-4 space-y-3">
            {/* Metrics grid */}
            {message.data.metrics && (
              <MetricsGrid metrics={message.data.metrics} />
            )}

            {/* Risk distribution */}
            {message.data.distribution && (
              <DistributionBar distribution={message.data.distribution} />
            )}

            {/* By severity / by type breakdowns */}
            {message.data.by_severity && (
              <SeverityBreakdown data={message.data.by_severity} />
            )}
            {message.data.by_type && !message.data.by_severity && (
              <TypeBreakdown data={message.data.by_type} />
            )}

            {/* Asset list */}
            {message.data.assets && message.data.assets.length > 0 && (
              <AssetTable assets={message.data.assets} />
            )}

            {/* Alert list */}
            {message.data.alerts && message.data.alerts.length > 0 && (
              <AlertTable alerts={message.data.alerts} />
            )}

            {/* Violation list */}
            {message.data.violations && message.data.violations.length > 0 && (
              <ViolationTable violations={message.data.violations} />
            )}

            {/* Findings list */}
            {message.data.findings && message.data.findings.length > 0 && (
              <FindingsTable findings={message.data.findings} />
            )}

            {/* Connectors list */}
            {message.data.connectors && message.data.connectors.length > 0 && (
              <ConnectorTable connectors={message.data.connectors} />
            )}

            {/* Risk trend data points */}
            {message.data.data_points && message.data.data_points.length > 0 && (
              <TrendChart dataPoints={message.data.data_points} />
            )}

            {/* Frameworks */}
            {message.data.frameworks && message.data.frameworks.length > 0 && (
              <FrameworkCards frameworks={message.data.frameworks} />
            )}

            {/* Recommendations */}
            {message.data.recommendations && message.data.recommendations.length > 0 && (
              <Recommendations items={message.data.recommendations} />
            )}

            {/* Top risky stores */}
            {message.data.top_risky_stores && message.data.top_risky_stores.length > 0 && (
              <RiskyStoresBar stores={message.data.top_risky_stores} />
            )}
          </div>
        )}

        {/* Suggestion chips for unknown queries */}
        {!isUser && message.data?.suggestions && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.data.suggestions.map((s: string) => (
              <button
                key={s}
                onClick={() => onSuggestionClick(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Follow-up suggestions */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Follow-up questions:</p>
            <div className="flex flex-wrap gap-2">
              {message.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => onSuggestionClick(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Confidence indicator */}
        {!isUser && message.confidence !== undefined && message.confidence > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-gray-400">
              {message.intent} ({Math.round(message.confidence * 100)}% confidence)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function FormattedText({ text, isUser }: { text: string; isUser: boolean }) {
  // Simple markdown-like bold formatting
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className={isUser ? "text-white" : "text-gray-900"}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function MetricsGrid({ metrics }: { metrics: any }) {
  const items = [
    { label: "Total Assets", value: metrics.total_assets, color: "blue" },
    { label: "Sensitive", value: metrics.sensitive_assets, color: "yellow" },
    { label: "Critical Risk", value: metrics.critical_risk, color: "red" },
    { label: "Publicly Exposed", value: metrics.publicly_exposed, color: "red" },
  ].filter((i) => i.value !== undefined);

  if (items.length === 0) return null;

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
    green: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className={`px-3 py-2 rounded-lg border text-center ${colorMap[item.color]}`}
        >
          <div className="text-lg font-bold">{Number(item.value).toLocaleString()}</div>
          <div className="text-[10px] uppercase tracking-wide">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function DistributionBar({ distribution }: { distribution: Record<string, number> }) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  const colors: Record<string, string> = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };

  return (
    <div>
      <div className="flex h-4 rounded-full overflow-hidden">
        {Object.entries(distribution).map(([level, count]) => (
          <div
            key={level}
            className={`${colors[level] || "bg-gray-300"} transition-all`}
            style={{ width: `${(count / total) * 100}%` }}
            title={`${level}: ${count}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {Object.entries(distribution).map(([level, count]) => (
          <span key={level} className="text-[10px] text-gray-500 capitalize">
            {level}: {count}
          </span>
        ))}
      </div>
    </div>
  );
}

function SeverityBreakdown({ data }: { data: Record<string, number> }) {
  const colors: Record<string, string> = {
    critical: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(data).map(([sev, count]) => (
        <span
          key={sev}
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[sev.toLowerCase()] || "bg-gray-100 text-gray-700"}`}
        >
          {sev}: {count}
        </span>
      ))}
    </div>
  );
}

function TypeBreakdown({ data }: { data: Record<string, number> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(data)
        .sort(([, a], [, b]) => b - a)
        .map(([type, count]) => (
          <span key={type} className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {type.replace(/_/g, " ")}: {count}
          </span>
        ))}
    </div>
  );
}

function AssetTable({ assets }: { assets: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="pb-2 pr-3">Name</th>
            <th className="pb-2 pr-3">Type</th>
            <th className="pb-2 pr-3">Risk</th>
            <th className="pb-2 pr-3">Sensitive</th>
            <th className="pb-2 pr-3">Exposure</th>
            <th className="pb-2">Owner</th>
          </tr>
        </thead>
        <tbody>
          {assets.slice(0, 10).map((a, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td className="py-1.5 pr-3 font-medium">{a.name}</td>
              <td className="py-1.5 pr-3 text-gray-500">{a.type}</td>
              <td className="py-1.5 pr-3">
                <RiskBadge score={a.risk_score} />
              </td>
              <td className="py-1.5 pr-3">{a.sensitive_count ?? 0}</td>
              <td className="py-1.5 pr-3">
                <ExposureBadge status={a.exposure} />
              </td>
              <td className="py-1.5 text-gray-500">{a.owner || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {assets.length > 10 && (
        <p className="text-[10px] text-gray-400 mt-1">Showing 10 of {assets.length} assets</p>
      )}
    </div>
  );
}

function AlertTable({ alerts }: { alerts: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="pb-2 pr-3">Severity</th>
            <th className="pb-2 pr-3">Title</th>
            <th className="pb-2 pr-3">Status</th>
            <th className="pb-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {alerts.slice(0, 10).map((a, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td className="py-1.5 pr-3">
                <SeverityBadge severity={a.severity} />
              </td>
              <td className="py-1.5 pr-3 font-medium">{a.title}</td>
              <td className="py-1.5 pr-3 capitalize text-gray-500">{a.status?.replace(/_/g, " ")}</td>
              <td className="py-1.5 text-gray-400">{a.created?.split("T")[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ViolationTable({ violations }: { violations: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="pb-2 pr-3">Severity</th>
            <th className="pb-2 pr-3">Description</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {violations.slice(0, 10).map((v, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td className="py-1.5 pr-3"><SeverityBadge severity={v.severity} /></td>
              <td className="py-1.5 pr-3 font-medium">{v.description || "—"}</td>
              <td className="py-1.5 capitalize text-gray-500">{v.status?.replace(/_/g, " ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FindingsTable({ findings }: { findings: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="pb-2 pr-3">Type</th>
            <th className="pb-2 pr-3">Severity</th>
            <th className="pb-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {findings.slice(0, 10).map((f, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td className="py-1.5 pr-3 text-gray-600">{f.type?.replace(/_/g, " ")}</td>
              <td className="py-1.5 pr-3"><SeverityBadge severity={f.severity} /></td>
              <td className="py-1.5 font-medium">{f.description || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConnectorTable({ connectors }: { connectors: any[] }) {
  const statusColors: Record<string, string> = {
    connected: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    partial_access: "bg-yellow-100 text-yellow-800",
    disabled: "bg-gray-100 text-gray-600",
    pending: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="pb-2 pr-3">Name</th>
            <th className="pb-2 pr-3">Type</th>
            <th className="pb-2 pr-3">Status</th>
            <th className="pb-2">Last Sync</th>
          </tr>
        </thead>
        <tbody>
          {connectors.map((c, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td className="py-1.5 pr-3 font-medium">{c.name}</td>
              <td className="py-1.5 pr-3 text-gray-500">{c.type}</td>
              <td className="py-1.5 pr-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[c.status] || "bg-gray-100"}`}>
                  {c.status}
                </span>
              </td>
              <td className="py-1.5 text-gray-400">{c.last_sync?.split("T")[0] || "Never"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrendChart({ dataPoints }: { dataPoints: { date: string; score: number; level: string }[] }) {
  const max = Math.max(...dataPoints.map((d) => d.score), 100);
  const chartHeight = 60;
  const points = dataPoints.slice(-30); // last 30 points

  return (
    <div>
      <p className="text-[10px] text-gray-500 mb-1">Risk Trend (last {points.length} data points)</p>
      <div className="flex items-end gap-px h-16">
        {points.map((p, i) => {
          const h = (p.score / max) * chartHeight;
          const color = p.score >= 80 ? "bg-red-400" : p.score >= 60 ? "bg-orange-400" : p.score >= 40 ? "bg-yellow-400" : "bg-green-400";
          return (
            <div
              key={i}
              className={`${color} rounded-t-sm flex-1 min-w-[3px] transition-all`}
              style={{ height: `${h}px` }}
              title={`${p.date}: ${p.score}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function FrameworkCards({ frameworks }: { frameworks: any[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {frameworks.map((fw, i) => {
        const pct = fw.coverage_percent || 0;
        const color = pct >= 90 ? "text-green-600" : pct >= 70 ? "text-yellow-600" : "text-red-600";
        const bg = pct >= 90 ? "bg-green-500" : pct >= 70 ? "bg-yellow-500" : "bg-red-500";
        return (
          <div key={i} className="border border-gray-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-gray-700">{fw.name || fw.framework_type}</div>
            <div className={`text-lg font-bold ${color}`}>{pct}%</div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1">
              <div className={`${bg} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              {fw.violation_count || 0} violation(s) | {fw.total_rules || 0} rules
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Recommendations({ items }: { items: string[] }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <p className="text-xs font-semibold text-amber-800 mb-2">Recommended Actions</p>
      <ul className="space-y-1">
        {items.map((r, i) => (
          <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">&#9679;</span>
            <FormattedText text={r} isUser={false} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function RiskyStoresBar({ stores }: { stores: { name: string; risk_score: number }[] }) {
  const max = Math.max(...stores.map((s) => s.risk_score), 100);
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-gray-500">Top Risky Data Stores</p>
      {stores.slice(0, 5).map((s, i) => {
        const pct = (s.risk_score / max) * 100;
        const color = s.risk_score >= 80 ? "bg-red-500" : s.risk_score >= 60 ? "bg-orange-500" : "bg-yellow-500";
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[10px] text-gray-600 w-36 truncate">{s.name}</span>
            <div className="flex-1 bg-gray-100 h-2 rounded-full">
              <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] font-medium text-gray-700 w-8 text-right">{s.risk_score}</span>
          </div>
        );
      })}
    </div>
  );
}

function RiskBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) return <span className="text-gray-400">—</span>;
  const color =
    score >= 80 ? "bg-red-100 text-red-800" :
    score >= 60 ? "bg-orange-100 text-orange-800" :
    score >= 40 ? "bg-yellow-100 text-yellow-800" :
    "bg-green-100 text-green-800";
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${color}`}>{score}</span>;
}

function ExposureBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-gray-400">—</span>;
  const colors: Record<string, string> = {
    public: "bg-red-100 text-red-800",
    external_shared: "bg-orange-100 text-orange-800",
    internal: "bg-yellow-100 text-yellow-800",
    private: "bg-green-100 text-green-800",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${colors[status] || "bg-gray-100"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string | null }) {
  if (!severity) return null;
  const colors: Record<string, string> = {
    critical: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
    info: "bg-blue-100 text-blue-800",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${colors[severity.toLowerCase()] || "bg-gray-100"}`}>
      {severity}
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          <span className="text-xs text-gray-400 ml-2">Querying your data locally...</span>
        </div>
      </div>
    </div>
  );
}
