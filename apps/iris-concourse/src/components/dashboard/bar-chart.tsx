interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  showValues?: boolean;
}

export function BarChart({ data, height = 200, showValues = true }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((item, i) => {
        const barHeight = (item.value / max) * (height - 30);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            {showValues && (
              <span className="text-xs text-gray-500 font-medium">{item.value}</span>
            )}
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{
                height: barHeight,
                backgroundColor: item.color || "#1a1a1a",
                minHeight: item.value > 0 ? 4 : 0,
              }}
            />
            <span className="text-[10px] text-gray-500 whitespace-nowrap text-center">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
