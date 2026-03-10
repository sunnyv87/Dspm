interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  connected: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  partial_access: "bg-yellow-100 text-yellow-800",
  disabled: "bg-gray-100 text-gray-800",
  pending: "bg-blue-100 text-blue-800",
  open: "bg-red-100 text-red-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  running: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  queued: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  revoked: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
  rejected: "bg-red-100 text-red-800",
  approved: "bg-green-100 text-green-800",
  investigating: "bg-yellow-100 text-yellow-800",
  contained: "bg-blue-100 text-blue-800",
  closed: "bg-gray-100 text-gray-800",
  overdue: "bg-red-100 text-red-800",
  compliant: "bg-green-100 text-green-800",
  non_compliant: "bg-red-100 text-red-800",
  pending_review: "bg-yellow-100 text-yellow-800",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
      {status.replace(/_/g, " ").toUpperCase()}
    </span>
  );
}
