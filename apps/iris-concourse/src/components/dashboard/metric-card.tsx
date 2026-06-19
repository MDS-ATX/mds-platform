interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
}

export function MetricCard({ label, value, subtitle, trend }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      {trend && (
        <p
          className={`text-sm mt-2 font-medium ${
            trend.positive ? "text-green-600" : "text-red-500"
          }`}
        >
          {trend.positive ? "▲ " : "▼ "}
          {trend.value}
        </p>
      )}
    </div>
  );
}
