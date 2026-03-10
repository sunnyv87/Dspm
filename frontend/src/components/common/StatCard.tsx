interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "blue" | "red" | "yellow" | "green" | "gray";
}

const colorMap = {
  blue: "bg-primary-50 border-primary-500 text-primary-700",
  red: "bg-danger-50 border-danger-500 text-danger-600",
  yellow: "bg-warning-50 border-warning-500 text-warning-600",
  green: "bg-success-50 border-success-500 text-success-600",
  gray: "bg-gray-50 border-gray-400 text-gray-700",
};

export default function StatCard({ title, value, subtitle, color = "blue" }: StatCardProps) {
  return (
    <div className={`rounded-xl border-l-4 p-5 bg-white shadow-sm ${colorMap[color]}`}>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
